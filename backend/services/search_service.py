from rapidfuzz import process, fuzz
from loguru import logger

def search_students(query: str, index_data: dict) -> list[dict]:
    students = index_data.get("students", [])
    logger.info(f"Searching for: '{query}' across {len(students)} students")

    if not query:
        return []

    query_parts = query.lower().split()

    # 1. Exact match / Contains match by registration number or Name
    simple_matches = []
    for s in students:
        name_lower = s["name"].lower()
        reg_lower = s["reg"].lower()

        # Match if all parts of the query are found in the name or the full query is in the reg
        if all(part in name_lower for part in query_parts) or any(part in reg_lower for part in query_parts):
            simple_matches.append(s)

    logger.debug(f"Simple matches found: {len(simple_matches)}")

    # 2. Fuzzy match by name for typo tolerance
    names = [s["name"] for s in students]
    fuzzy_results = process.extract(
        query,
        names,
        scorer=fuzz.WRatio,
        limit=10,
        score_cutoff=50 # Lowered slightly for better recall
    )

    # Collect fuzzy matches, ensuring we don't duplicate
    found_ids = {s["id"] for s in simple_matches}

    fuzzy_matches = []
    for res in fuzzy_results:
        idx = res[2]
        student = students[idx]
        if student["id"] not in found_ids:
            fuzzy_matches.append(student)

    # Combine and limit
    combined = simple_matches + fuzzy_matches
    logger.info(f"Total results for '{query}': {len(combined)}")
    return combined[:15]
