from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from backend.services.index_service import load_index
from backend.services.search_service import search_students
from backend.services.pdf_service import extract_page, extract_exam_schedule
import os
import pypdf

from loguru import logger

router = APIRouter()

@router.get("/api/search")
async def search(q: str = Query(..., min_length=2)):
    logger.info(f"Incoming search request: q={q}")
    index_data = load_index()

    # Check if index is actually populated
    if not index_data.get("pdf_path") or not index_data.get("students"):
        raise HTTPException(status_code=503, detail="Index not ready")

    results = search_students(q, index_data)
    return results

@router.get("/api/download/{student_id}")
async def download(student_id: str):
    index_data = load_index()
    student = next((s for s in index_data["students"] if s["id"] == student_id), None)

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pdf_path = index_data.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        logger.error(f"Master PDF not found at {pdf_path}")
        raise HTTPException(status_code=500, detail="Something went wrong on our end. Try again in a moment.")

    try:
        pdf_content = extract_page(pdf_path, student["page"])
        safe_name = student['name'].replace(' ', '_')
        filename = f"{safe_name}_timetable.pdf"
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"inline; filename=\"{filename}\"",
                "X-Frame-Options": "SAMEORIGIN"
            }
        )
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong on our end. Try again in a moment.")

@router.get("/api/preview/{student_id}")
async def preview(student_id: str):
    # For preview, we also just return the single page PDF
    # The frontend will display it in an iframe
    return await download(student_id)

@router.get("/api/schedule/{student_id}")
async def get_schedule(student_id: str):
    index_data = load_index()
    student = next((s for s in index_data["students"] if s["id"] == student_id), None)

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pdf_path = index_data.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Master PDF not found")

    try:
        reader = pypdf.PdfReader(pdf_path)
        page = reader.pages[student["page"] - 1]
        text = page.extract_text()
        return extract_exam_schedule(text)
    except Exception as e:
        logger.error(f"Schedule extraction failed: {e}")
        return []
