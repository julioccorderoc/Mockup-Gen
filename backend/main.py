import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.loggingConfig import setup_logging
from utils.mockupRoutes import router as mockup_router

# Configure logging first
setup_logging()

# Get logger for this module
logger = logging.getLogger(__name__)

# Configure app
app = FastAPI()
logger.info("FastAPI app initialized")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mockup_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)