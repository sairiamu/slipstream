import os
import sys
import asyncio
from loguru import logger
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Add the parent directory to sys.path to resolve the 'backend' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.routes import admin, student
from backend.services.index_service import load_index, PDF_PATH, INDEX_FILE
from backend.routes.admin import index_pdf_background, indexing_progress

load_dotenv()

app = FastAPI(title="SlipStream API")

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:8080").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info(f"Using PDF path: {PDF_PATH}")
    logger.info(f"Using Index path: {INDEX_FILE}")

    if not os.path.exists(PDF_PATH):
        logger.warning(f"Timetable PDF not found at {PDF_PATH}. System waiting for upload.")
        return

    if os.path.exists(INDEX_FILE):
        index = load_index(INDEX_FILE)
        if index.get("students"):
            logger.info(f"✓ Index loaded: {len(index['students'])} students ready")
            return

    logger.info("No valid index found — building index from timetable PDF...")
    # Run indexing in a background thread so the server starts accepting requests
    asyncio.create_task(index_pdf_background(PDF_PATH, INDEX_FILE))

@app.get("/api/status")
async def status():
    status_val = "ready"
    if indexing_progress["running"]:
        status_val = "indexing"
    elif not os.path.exists(PDF_PATH):
        status_val = "no_pdf"

    index_data = load_index(INDEX_FILE)

    return {
        "status": status_val,
        "students": len(index_data.get("students", [])),
        "indexed_at": index_data.get("indexed_at"),
        "pdf_present": os.path.exists(PDF_PATH),
        "version": "1.0.0"
    }

# Include routes
app.include_router(admin.router)
app.include_router(student.router)

@app.get("/")
async def root():
    return {"message": "SlipStream API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
