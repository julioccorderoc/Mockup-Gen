import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/templates")

# Path to templates directory (relative to backend)
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

@router.get("/{social}/{template_type}", response_class=HTMLResponse)
async def get_template(social: str, template_type: str):
    """
    Fetch a social media template by social network and type.
    
    Args:
        social: Social network name (e.g., 'instagram', 'twitter')
        template_type: Template type (e.g., 'post', 'comment')
        
    Returns:
        HTMLResponse: The template HTML content
        
    Raises:
        HTTPException: If template not found or other errors occur
    """
    try:
        # Construct template path and sanitize it
        template_path = TEMPLATES_DIR / social / f"{social}-{template_type}.html"
        template_path = template_path.resolve()
        
        # Security check: ensure the path is within templates directory
        if not str(template_path).startswith(str(TEMPLATES_DIR)):
            logger.warning(f"Attempted path traversal: {template_path}")
            raise HTTPException(status_code=400, detail="Invalid template path")

        # Check if template exists
        if not template_path.is_file():
            logger.warning(f"Template not found: {template_path}")
            return get_error_template()

        # Read and return template content
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
            return HTMLResponse(content=template_content)

    except Exception as e:
        logger.error(f"Error fetching template: {str(e)}")
        return get_error_template()

def get_error_template() -> HTMLResponse:
    """
    Return the error template HTML.
    """
    try:
        error_template_path = TEMPLATES_DIR / "load-error.html"
        with open(error_template_path, 'r', encoding='utf-8') as f:
            return HTMLResponse(content=f.read())
    except Exception as e:
        logger.error(f"Error loading error template: {str(e)}")
        # Fallback HTML if even the error template fails to load
        return HTMLResponse(content="""
            <div class="error-container">
                <h2>Error Loading Template</h2>
                <p>Unable to load the requested template.</p>
            </div>
        """)