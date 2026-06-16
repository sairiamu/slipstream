from pypdf import PdfReader, PdfWriter
from io import BytesIO
import re
import os
from loguru import logger
from backend.services.index_service import PDF_PATH

def extract_page(pdf_path: str, page_number: int) -> bytes:
    try:
        reader = PdfReader(pdf_path)
        writer = PdfWriter()
        writer.add_page(reader.pages[page_number - 1])  # 0-indexed
        buffer = BytesIO()
        writer.write(buffer)
        buffer.seek(0)
        return buffer.read()
    except Exception as e:
        logger.error(f"Error extracting page {page_number} from {pdf_path}: {e}")
        raise

def extract_student_info(page_text: str, config: dict) -> dict | None:
    try:
        name_pattern = re.compile(config["name_regex"])
        reg_pattern = re.compile(config["reg_regex"])

        name_match = name_pattern.search(page_text)
        reg_match = reg_pattern.search(page_text)

        if name_match and reg_match:
            name = name_match.group(1).strip()
            # Clean name: "LASTNAME, FIRSTNAME" -> "FIRSTNAME LASTNAME" or just remove comma
            clean_name = name.replace(',', ' ').strip()
            # Reduce multiple spaces to one
            clean_name = ' '.join(clean_name.split())

            return {
                "name": clean_name,
                "reg": reg_match.group(1).strip()
            }
    except Exception as e:
        logger.error(f"Error extracting student info: {e}")
    return None

def extract_exam_schedule(page_text: str) -> list[dict]:
    # Look for DD/MM/YYYY, DD-MM-YYYY, or DD Month YYYY
    date_pattern = r"(\d{1,2})[/ \-](\d{1,2}|[A-Za-z]+)[/ \-](\d{4})"
    # Look for HH:MM, H:MMam/pm
    time_pattern = r"(\d{1,2}:\d{2})\s?([AaPp][Mm])?"

    lines = page_text.split('\n')
    schedule = []

    # Simple heuristic: look for lines that contain a date and a time
    for i, line in enumerate(lines):
        date_match = re.search(date_pattern, line)
        time_match = re.search(time_pattern, line)

        if date_match and time_match:
            date_str = date_match.group(0)
            time_str = time_match.group(0)

            # Subject extraction: take the start of the line or the line before if it's short
            subject = line.split(date_str)[0].strip()
            if not subject and i > 0:
                subject = lines[i-1].strip()

            # Basic cleanup
            subject = re.sub(r'^\d+\.?\s*', '', subject) # remove leading numbers

            try:
                from dateutil import parser
                dt = parser.parse(f"{date_str} {time_str}")
                iso_dt = dt.isoformat()
            except:
                iso_dt = None

            schedule.append({
                "subject": subject or "Unknown Subject",
                "date": date_str,
                "time": time_str,
                "datetime_iso": iso_dt
            })

    return schedule
