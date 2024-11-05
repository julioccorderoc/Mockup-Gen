import logging
import os
from fastapi import APIRouter, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from .dataModel import MockupPayload
from .templateManager import TemplateManager
from .mockupGenerator import MockupGenerator
from .cleanUp import cleanup_temp_files

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate-mockup")
async def generate_mockup(payload: MockupPayload, background_tasks: BackgroundTasks):
    """
    Endpoint to generate and return a mockup image
    """
    generator = MockupGenerator()
    try:
        # Get template path
        template_path = TemplateManager.get_template_path(payload.template)
        
        # Generate mockup
        temp_image_path = await generator.generate(template_path, payload.data)
        
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