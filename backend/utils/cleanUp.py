import logging
import os
import shutil

logger = logging.getLogger(__name__)

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