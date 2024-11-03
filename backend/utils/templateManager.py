import logging
from fastapi import HTTPException
from pathlib import Path

logger = logging.getLogger(__name__)

class TemplateManager:
    @staticmethod
    def get_template_path(template_data: dict) -> Path:
        current_dir = Path(__file__).parent.parent.parent
        templates_dir = current_dir / "templates"
        template_path = templates_dir / template_data['social'] / f"{template_data['social']}-{template_data['option']}.html"
        
        if not template_path.exists():
            logger.error(f"Template file not found: {template_path}")
            raise HTTPException(status_code=404, detail=f"Template file not found: {template_path}")
            
        return template_path