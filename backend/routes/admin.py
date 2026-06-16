from fastapi import APIRouter, UploadFile, File, Header, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import os
import json
import asyncio
from loguru import logger
from pypdf import PdfReader
from backend.services.pdf_service import extract_student_info
from backend.services.index_service import save_index, load_config, PDF_PATH, INDEX_FILE, DATA_DIR
from dotenv import load_dotenv

load_dotenv()
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

router = APIRouter()

# Global state for indexing progress
indexing_progress = {"current": 0, "total": 0, "running": False, "status": "idle"}

async def index_pdf_background(pdf_path: str = PDF_PATH, index_path: str = INDEX_FILE):
    global indexing_progress
    try:
        if not os.path.exists(pdf_path):
            logger.error(f"Cannot start indexing: PDF not found at {pdf_path}")
            indexing_progress.update({"running": False, "status": f"failed: PDF not found at {pdf_path}"})
            return

        reader = PdfReader(pdf_path)
        total = len(reader.pages)
        indexing_progress.update({"total": total, "current": 0, "running": True, "status": "indexing"})

        results = []
        config = load_config()

        for i, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            info = extract_student_info(text, config)
            if info:
                # Use reg as id if it's unique enough, or combine with name
                student_id = info["reg"].replace("/", "-")
                results.append({**info, "page": i + 1, "id": student_id})

            indexing_progress["current"] = i + 1
            if (i + 1) % 100 == 0 or (i + 1) == total:
                logger.info(f"Indexing progress: {i + 1}/{total}")

            if i % 50 == 0:
                await asyncio.sleep(0.01)  # Yield to event loop

        save_index({
            "students": results,
            "total": len(results),
            "pdf_path": pdf_path
        }, path=index_path)
        indexing_progress["running"] = False
        indexing_progress["status"] = "completed"
    except Exception as e:
        logger.error(f"Indexing failed: {e}")
        indexing_progress["running"] = False
        indexing_progress["status"] = f"failed: {str(e)}"

def verify_token(authorization: str = Header(None)):
    if not ADMIN_TOKEN:
        logger.warning("ADMIN_TOKEN not set in environment. Skipping verification.")
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...), authorization: str = Header(None)):
    verify_token(authorization)

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    os.makedirs(os.path.dirname(PDF_PATH), exist_ok=True)

    with open(PDF_PATH, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return {"message": "Upload successful", "filename": file.filename, "path": PDF_PATH}

@router.post("/api/index")
async def trigger_index(background_tasks: BackgroundTasks, authorization: str = Header(None)):
    verify_token(authorization)

    if not os.path.exists(PDF_PATH):
        raise HTTPException(status_code=400, detail="No PDF uploaded")

    if indexing_progress["running"]:
        return {"message": "Indexing already in progress"}

    background_tasks.add_task(index_pdf_background, PDF_PATH, INDEX_FILE)
    return {"message": "Indexing started"}

@router.get("/api/index/progress")
async def index_progress_sse():
    async def event_stream():
        while True:
            data = json.dumps(indexing_progress)
            yield f"data: {data}\n\n"
            if not indexing_progress["running"] and (indexing_progress["status"] in ["completed", "idle"] or "failed" in indexing_progress["status"]):
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
