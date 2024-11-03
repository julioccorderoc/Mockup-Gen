import logging
import os
import asyncio
import tempfile
import html
import shutil
from typing import Dict, Any
from fastapi import HTTPException
from pathlib import Path
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

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

    async def generate(self, template_path: Path, data: dict) -> str:
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