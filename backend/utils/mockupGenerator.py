import logging
import os
import asyncio
import tempfile
import html
import shutil
from typing import Dict, Any, Callable, Coroutine
from fastapi import HTTPException
from pathlib import Path
from playwright.async_api import Page, async_playwright

logger = logging.getLogger(__name__)

class MockupGenerator:
    def __init__(self):
        """Initialize the MockupGenerator with a temporary directory."""
        self.temp_dir = tempfile.mkdtemp()
        self.temp_file_path = None
        logger.info(f"Created temporary directory: {self.temp_dir}")
        
        # Define handlers for different field types
        self.field_handlers = {
            'string': self._handle_string_field,
            'number': self._handle_string_field,  # Numbers can use the same handler as strings
            'image': self._handle_image_field,
            'duration': self._handle_string_field  # Duration can use the same handler as strings
        }

    async def _handle_string_field(self, page: Page, field: str, value: Dict[str, Any]) -> None:
        """Handle string-type fields. Special handling for 'content' field to preserve HTML formatting."""
        content = str(value['value'])
        
        # Prepare the JavaScript function
        if field == 'content':
            # Don't escape HTML for content field
            js_function = """
                (params) => {
                    const element = document.querySelector(`[data-field="${params.field}"]`);
                    if (element) {
                        element.innerHTML = params.value;
                    }
                }
            """
        else:
            # Escape HTML for other fields
            content = html.escape(content)
            js_function = """
                (params) => {
                    const element = document.querySelector(`[data-field="${params.field}"]`);
                    if (element) {
                        element.innerHTML = params.value;
                    }
                }
            """
        
        # Pass parameters as a single object
        await page.evaluate(js_function, {'field': field, 'value': content})

    async def _handle_image_field(self, page: Page, field: str, value: Dict[str, Any]) -> None:
        """Handle image-type fields by setting the src attribute."""
        if not value.get('value'):
            logger.warning(f"Empty image value for field {field}")
            return
            
        js_function = """
            (params) => {
                const element = document.querySelector(`[data-field="${params.field}"]`);
                if (element && element.tagName === 'IMG') {
                    element.src = params.value;
                }
            }
        """
        
        await page.evaluate(js_function, {'field': field, 'value': value['value']})

    async def insert_data_into_template(self, page: Page, data: Dict[str, Any]) -> None:
        """Insert data into template using appropriate handlers based on field type."""
        logger.info("Inserting data into template")
        
        for field, value in data.items():
            try:
                # Get the appropriate handler for the field type
                field_type = value.get('type', 'string')  # Default to string type
                handler = self.field_handlers.get(field_type)
                
                if not handler:
                    logger.warning(f"No handler found for field type: {field_type}")
                    continue
                    
                await handler(page, field, value)
                
            except Exception as e:
                logger.error(f"Error inserting data for field {field}: {str(e)}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"Error inserting data for field {field}: {str(e)}"
                )

    async def capture_element(self, page: Page) -> None:
        """Capture screenshot of the specified element."""
        element = await page.query_selector("#capture-area")
        if not element:
            logger.error("Capture area not found in template")
            raise HTTPException(
                status_code=500, 
                detail="Capture area not found in template"
            )
        
        self.temp_file_path = os.path.join(
            self.temp_dir, 
            f"mockup_{int(asyncio.get_event_loop().time())}.png"
        )
        
        await element.screenshot(
            path=self.temp_file_path, 
            omit_background=True
        )
        logger.info(f"Screenshot captured and saved to {self.temp_file_path}")

    async def generate(self, template_path: Path, data: dict) -> str:
        """Generate mockup image from template and data."""
        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch()
                page = await browser.new_page()
                
                await page.goto(f"file://{template_path}")
                logger.info(f"Loaded template: {template_path}")
                
                await self.insert_data_into_template(page, data)
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

    def cleanup(self) -> None:
        """Clean up temporary files and directory."""
        try:
            if self.temp_dir and os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
                logger.info(f"Cleaned up temporary directory: {self.temp_dir}")
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")