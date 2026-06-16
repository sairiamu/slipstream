# SlipStream — Agent Context

## What You Are Building

**SlipStream** is a web application that allows university students to search for their
name and instantly receive their personal exam timetable as a downloadable PDF — extracted
on-demand from a single large master PDF uploaded by an administrator.

The problem it solves: a university prints one enormous PDF (up to 36,000 pages, one page
per student) and hands it to staff. SlipStream replaces that chaos with a clean search
interface — students open a link on their phone, type their name or registration number,
preview their timetable page, and download it in seconds.

---

## Users

| Role | What they do |
|------|-------------|
| **Student** | Opens the app on a phone, searches by name or reg number, downloads their timetable page |
| **Admin** | Logs in once, uploads the master PDF, triggers indexing, manages the index |

Most students will use a **mobile phone**. Design and build for mobile-first, then enhance for desktop.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), TailwindCSS |
| Backend | FastAPI (Python 3.11+) |
| PDF processing | `pypdf` library |
| Index storage | JSON file on disk (upgrade to SQLite if scale demands) |
| Auth (admin) | Simple token-based auth via `.env` secret |
| Hosting | Any Linux server / VPS (Nginx + Uvicorn) |

---

## Core User Flows

### Flow 1 — Student (primary)
1. Student opens SlipStream URL on phone
2. Sees search bar with placeholder "Enter your name or reg number…"
3. Types at least 2 characters → live suggestions appear (fuzzy match)
4. Taps their name in the dropdown
5. A preview card appears showing page number + student details
6. Taps "Download my timetable" → browser downloads a single-page PDF
7. Done. No login required.

### Flow 2 — Admin (one-time setup per exam period)
1. Admin navigates to `/admin`
2. Enters admin secret token
3. Uploads the master PDF (may be 36,000 pages, 500MB+)
4. Triggers "Build Index" — backend reads every page, extracts name + reg number, stores mapping
5. Index status shown: "Indexed 36,000 students ✓"
6. App is now live for students

### Flow 3 — Download
1. Student search resolves to a page number
2. Backend uses `pypdf` to extract exactly that one page
3. Returns it as `application/pdf` with filename `{StudentName}_timetable.pdf`
4. Browser triggers native download

---

## API Endpoints

```
POST   /api/upload          — Admin: upload master PDF (multipart)
POST   /api/index           — Admin: trigger indexing of uploaded PDF
GET    /api/search?q=       — Student: fuzzy search, returns list of matches
GET    /api/download/{id}   — Student: returns single-page PDF
GET    /api/status          — Health check + index stats
```

All admin endpoints require header: `Authorization: Bearer <ADMIN_TOKEN>`

---

## Index Format

The index is a JSON file stored at `data/index.json`:

```json
{
  "students": [
    {
      "id": "2021-CS-001",
      "name": "Amina Juma",
      "page": 4523,
      "reg": "2021/CS/001"
    }
  ],
  "total": 36000,
  "indexed_at": "2025-06-16T10:30:00Z",
  "pdf_path": "data/master.pdf"
}
```

---

## PDF Text Extraction Rules

When indexing, for each page:
1. Extract all text with `pypdf`
2. Look for patterns matching student name (usually near the top of the page)
3. Look for patterns matching reg number (format: `YYYY/DEPT/NNN` or similar)
4. If both are found, store `{ name, reg, page_number }`
5. If extraction is ambiguous, flag that page in `data/unmatched.json` for manual review

The exact regex patterns for name/reg extraction must be **configurable** via `data/config.json`
because every university formats timetable pages differently.

---

## Key Constraints

- **No student login** — search is public, download is public. Security by obscurity is acceptable for timetables.
- **Single PDF upload** — only one master PDF active at a time; re-uploading replaces it.
- **Phone-first** — every interactive element must be tappable (min 44px touch targets).
- **Offline resilience** — if the server goes down mid-download, the partially downloaded PDF should still open.
- **Large file handling** — uploading a 500MB PDF must not time out. Use chunked upload or streaming.
- **Indexing is async** — indexing 36k pages takes time. Show live progress to the admin.

---

## Environment Variables

```env
ADMIN_TOKEN=your-secret-token-here
PDF_DATA_DIR=./data
MAX_UPLOAD_SIZE_MB=1000
CORS_ORIGINS=http://localhost:5173,https://yourapp.com
```

---

## Project Structure

```
slipstream/
├── backend/
│   ├── main.py              # FastAPI app entrypoint
│   ├── routes/
│   │   ├── admin.py         # Upload, index, auth
│   │   └── student.py       # Search, download
│   ├── services/
│   │   ├── pdf_service.py   # pypdf extraction logic
│   │   ├── index_service.py # Build + query the index
│   │   └── search_service.py# Fuzzy search logic
│   ├── data/                # PDF + index stored here (gitignored)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── StudentSearch.jsx   # Main student page
│   │   │   └── AdminPanel.jsx      # Admin upload + index
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── ResultCard.jsx
│   │   │   └── ProgressBar.jsx
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── context/
│   ├── CONTEXT.md           # This file
│   └── SPEC.md              # Visual + technical spec
└── docker-compose.yml       # Optional: run everything together
```
