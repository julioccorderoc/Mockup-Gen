import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import tempfile
import html
from typing import Dict, Any
import shutil
import os
import asyncio
from playwright.async_api import async_playwright

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Update CORS configuration to be more permissive during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MockupPayload(BaseModel):
    template: dict
    data: dict
    config: dict

class TemplateManager:
    @staticmethod
    def get_template_path(template_data: dict) -> Path:
        current_dir = Path(__file__).parent.parent
        templates_dir = current_dir / "templates"
        template_path = templates_dir / template_data['social'] / f"{template_data['social']}-{template_data['option']}.html"
        
        if not template_path.exists():
            logger.error(f"Template file not found: {template_path}")
            raise HTTPException(status_code=404, detail=f"Template file not found: {template_path}")
            
        return template_path

class MockupGenerator:
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()
        self.temp_file_path = None
        logger.info(f"Created temporary directory: {self.temp_dir}")
    
    async def insert_data_into_template(self, page: Any, data: Dict[str, Any]) -> None:
        logger.info("Inserting data into template")
        for field, value in data.items():
            try:
                escaped_value = html.escape(str(value['value']))
                await page.evaluate(
                    f"document.querySelector('[data-field=\"{field}\"]').innerHTML = '{escaped_value}'"
                )
            except Exception as e:
                logger.error(f"Error inserting data for field {field}: {str(e)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error inserting data for field {field}: {str(e)}"
                )

    async def capture_element(self, page: Any) -> None:
        element = await page.query_selector("#capture-area")
        if not element:
            logger.error("Capture area not found in template")
            raise HTTPException(status_code=500, detail="Capture area not found in template")
        
        self.temp_file_path = os.path.join(self.temp_dir, f"mockup_{int(asyncio.get_event_loop().time())}.png")
        await element.screenshot(path=self.temp_file_path, omit_background=True)
        logger.info(f"Screenshot captured and saved to {self.temp_file_path}")

    async def generate(self, payload: MockupPayload) -> str:
        template_path = TemplateManager.get_template_path(payload.template)
        
        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                
                await page.goto(f"file://{template_path}")
                logger.info(f"Loaded template: {template_path}")
                
                await self.insert_data_into_template(page, payload.data)
                await self.capture_element(page)
                
                await browser.close()
                
                if not os.path.exists(self.temp_file_path):
                    raise HTTPException(
                        status_code=500,
                        detail="Generated image file not found"
                    )
                
                return self.temp_file_path
                
            except Exception as e:
                logger.error(f"Error generating mockup: {str(e)}")
                self.cleanup()
                raise HTTPException(status_code=500, detail=str(e))

    def cleanup(self):
        """
        Synchronous cleanup to be called after file is sent
        """
        try:
            if self.temp_dir and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
                logger.info(f"Cleaned up temporary directory: {self.temp_dir}")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

def cleanup_temp_files(temp_dir: str):
    """
    Background task to clean up temporary files
    """
    try:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
            logger.info(f"Cleaned up temporary directory in background task: {temp_dir}")
    except Exception as e:
        logger.error(f"Error in background cleanup: {str(e)}")

@app.post("/generate-mockup")
async def generate_mockup(payload: MockupPayload, background_tasks: BackgroundTasks):
    """
    Endpoint to generate and return a mockup image
    """
    generator = MockupGenerator()
    try:
        temp_image_path = await generator.generate(payload)
        
        if not os.path.exists(temp_image_path):
            raise HTTPException(
                status_code=500,
                detail="Generated image file not found"
            )
        
        filename = f"{payload.template['social']}-{payload.template['option']}-mockup.png"
        
        # Schedule cleanup as a background task
        background_tasks.add_task(cleanup_temp_files, generator.temp_dir)
        
        return FileResponse(
            temp_image_path,
            media_type="image/png",
            filename=filename
        )
        
    except Exception as e:
        logger.error(f"Error generating mockup: {str(e)}")
        generator.cleanup()  # Clean up if there's an error
        raise HTTPException(
            status_code=500,
            detail=f"Error generating mockup: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)