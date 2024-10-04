from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from playwright.async_api import async_playwright
import tempfile
import html
#import asyncio
#import sys

# Configurar el bucle de eventos para Windows
#if sys.platform == "win32":
#    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ajusta en producción.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# contents of the mockup
class MockupContent(BaseModel):
    template: str
    content: str

# function to load content into the template


# primary function
@app.post("/generate-mockup")
async def generate_mockup(request: MockupContent):
    try:
        # Crear un archivo temporal para la imagen
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            temp_image_path = tmp_file.name

        # Construir la ruta correcta al archivo de plantilla
        current_dir = Path(__file__).parent
        templates_dir = current_dir.parent / "templates"
        html_path = templates_dir / f"{request.template}.html"

        # Verificar que exista la plantilla
        if not html_path.exists():
            raise HTTPException(status_code=404, detail=f"Template file not found: {html_path}")

        # Generar la imagen del mockup
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # Cargar la plantilla HTML
            #html_path = Path("../templates/{request.template}").resolve()
            await page.goto(f"file://{html_path}")
            
            # Load content on mockup
            escaped_content = html.escape(request.content)
            await page.evaluate(f"document.getElementById('comment-text').innerHTML = '{escaped_content}'")
            
            # Esperar a que el elemento esté presente
            element = await page.query_selector("#capture-area")

            # Verificar que haya un area de captura
            if not element:
                raise HTTPException(status_code=500, detail="Capture area not found in the template")

            # Capturar la imagen del elemento
            await element.screenshot(path=temp_image_path, omit_background=True)
            
            # Cerrar la instancia del navegador
            await browser.close()

        # Devolver la imagen generada
        return FileResponse(temp_image_path, media_type="image/png", 
                            filename="instagram-comment-mockup.png")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)