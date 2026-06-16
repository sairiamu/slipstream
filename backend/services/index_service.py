import json
import os
from loguru import logger
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Set absolute paths relative to the 'backend' directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

# Unified path configuration
DATA_DIR = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "data"))
INDEX_FILE = os.getenv("INDEX_PATH", os.path.join(DATA_DIR, "index.json"))
PDF_PATH = os.getenv("PDF_PATH", os.path.join(DATA_DIR, "master.pdf"))

def save_index(data: dict, path: str = INDEX_FILE):
    try:
        data["indexed_at"] = datetime.now(timezone.utc).isoformat()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        logger.info(f"Index saved to {path}")
    except Exception as e:
        logger.error(f"Error saving index: {e}")

def load_index(path: str = INDEX_FILE) -> dict:
    if not os.path.exists(path):
        logger.warning(f"Index file not found at {path}")
        return {"students": [], "total": 0, "indexed_at": None, "pdf_path": None}
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading index: {e}")
        return {"students": [], "total": 0, "indexed_at": None, "pdf_path": None}

def load_config() -> dict:
    config_path = os.path.join(DATA_DIR, "config.json")
    if not os.path.exists(config_path):
        return {
            "name_regex": r"\d+\.\s+([A-Z, ]+)",
            "reg_regex": r"Reg:\s+(\d+)"
        }
    try:
        with open(config_path, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading config: {e}")
        return {
            "name_regex": r"\d+\.\s+([A-Z, ]+)",
            "reg_regex": r"Reg:\s+(\d+)"
        }
