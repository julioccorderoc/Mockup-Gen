import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from playwright.async_api import async_playwright
import tempfile
import html

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the structure of the incoming payload
class MockupPayload(BaseModel):
    template: dict
    data: dict
    config: dict

async def insert_data_into_template(page, data):
    """
    Insert data from the payload into the HTML template.
    """
    logger.info("Inserting data into template")
    for field, value in data.items():
        try:
            escaped_value = html.escape(str(value['value']))
            await page.evaluate(f"document.querySelector('[data-field=\"{field}\"]').innerHTML = '{escaped_value}'")
        except Exception as e:
            logger.error(f"Error inserting data for field {field}: {str(e)}")

@app.post("/generate-mockup")
async def generate_mockup(payload: MockupPayload):
    logger.info("Received request to generate mockup")
    try:
        # Create a temporary file for the image
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            temp_image_path = tmp_file.name

        # Build the correct path to the template file
        current_dir = Path(__file__).parent.parent  # Go up one level from 'backend'
        templates_dir = current_dir / "templates"
        html_path = templates_dir / payload.template['social'] / f"{payload.template['social']}-{payload.template['option']}.html"

        # Verify that the template exists
        if not html_path.exists():
            logger.error(f"Template file not found: {html_path}")
            raise HTTPException(status_code=404, detail=f"Template file not found: {html_path}")

        # Generate the mockup image
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # Load the HTML template
            await page.goto(f"file://{html_path}")
            logger.info(f"Loaded template: {html_path}")
            
            # Insert data into the template
            await insert_data_into_template(page, payload.data)
            
            # Wait for the capture area to be present
            element = await page.query_selector("#capture-area")

            # Verify that there's a capture area
            if not element:
                logger.error("Capture area not found in the template")
                raise HTTPException(status_code=500, detail="Capture area not found in the template")

            # Capture the image of the element
            await element.screenshot(path=temp_image_path, omit_background=True)
            logger.info(f"Screenshot captured and saved to {temp_image_path}")
            
            # Close the browser instance
            await browser.close()

        # Return the generated image
        logger.info("Returning generated image")
        return FileResponse(temp_image_path, media_type="image/png", 
                            filename=f"{payload.template['social']}-{payload.template['option']}-mockup.png")

    except Exception as e:
        logger.error(f"Error generating mockup: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)