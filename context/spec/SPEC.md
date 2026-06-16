# SlipStream — Design & Technical Specification

---

## 1. Visual Identity

### Brand Concept

SlipStream is named after the aerodynamic draft that pulls you forward effortlessly.
The UI should feel the same way — frictionless, fast, and calm under pressure.
It lives on student phones, often in crowded exam hallways. It must be readable in
sunlight, tappable with a thumb, and trustworthy on first glance.

The aesthetic: **glassmorphism layered over a deep navy base, with milk-white surfaces
and silver accents.** Think frosted glass panels floating over a dark ocean. Every card
floats. Nothing feels flat or printed — it feels like polished material.

---

## 2. Colour System

| Token | Hex | Role |
|-------|-----|------|
| `--color-navy` | `#0A1628` | Base background — deep dark blue, like night sky |
| `--color-navy-mid` | `#112240` | Secondary background layer |
| `--color-navy-light` | `#1D3461` | Elevated surface beneath glass |
| `--color-milk` | `#F8F5F0` | Primary text on dark, card fill tint |
| `--color-milk-dim` | `#D9D4CC` | Secondary text, placeholders |
| `--color-silver` | `#C8CDD8` | Borders, dividers, glass edges |
| `--color-silver-bright` | `#E2E6EE` | Highlighted borders, icon fills |
| `--color-glass` | `rgba(255,255,255,0.07)` | Glass panel background |
| `--color-glass-hover` | `rgba(255,255,255,0.12)` | Glass on hover/focus |
| `--color-glass-border` | `rgba(255,255,255,0.15)` | Glass panel border |
| `--color-accent` | `#4A9DFF` | Primary action (buttons, links, progress) |
| `--color-accent-glow` | `rgba(74,157,255,0.25)` | Button glow, focus ring |
| `--color-success` | `#34D399` | Success states, indexed confirmation |
| `--color-warning` | `#FBBF24` | Warning states |
| `--color-danger` | `#F87171` | Errors |

### Usage Rules
- **Never** place `--color-milk` text directly on `--color-glass` without sufficient contrast — always test
- Glass panels always sit on `--color-navy-mid` or `--color-navy-light` backgrounds
- Accent blue is for ONE primary action per screen — do not use it decoratively
- Silver is for structure: borders, separators, input strokes. Not for text.

---

## 3. Typography

```css
--font-display: 'Plus Jakarta Sans', sans-serif;  /* headings, brand name */
--font-body:    'Inter', sans-serif;               /* all body copy, inputs */
--font-mono:    'JetBrains Mono', monospace;       /* reg numbers, IDs, code */
```

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Size | Weight | Font |
|------|------|--------|------|
| App name / hero | 32px mobile / 48px desktop | 700 | Plus Jakarta Sans |
| Section heading | 20px | 600 | Plus Jakarta Sans |
| Card title | 16px | 600 | Inter |
| Body / label | 14px | 400 | Inter |
| Caption / helper | 12px | 400 | Inter |
| Reg number / ID | 13px | 400 | JetBrains Mono |

---

## 4. Glassmorphism System

Every card, panel, and modal uses this exact glass recipe. Do not deviate.

### Glass Panel (standard)
```css
.glass-panel {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### Glass Panel (elevated — for modals, dropdowns)
```css
.glass-panel--elevated {
  background: rgba(255, 255, 255, 0.11);
  backdrop-filter: blur(24px) saturate(200%);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}
```

### Glass Input
```css
.glass-input {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(200, 205, 216, 0.3);
  border-radius: 14px;
  color: #F8F5F0;
  padding: 14px 18px;
  font-size: 16px; /* prevents iOS zoom on focus */
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.glass-input:focus {
  outline: none;
  border-color: rgba(74, 157, 255, 0.6);
  box-shadow: 0 0 0 3px rgba(74, 157, 255, 0.15);
}
.glass-input::placeholder {
  color: rgba(217, 212, 204, 0.5);
}
```

---

## 5. Skeuomorphism Details

Skeuomorphic touches add depth and make the UI feel crafted, not generated.
Apply these precisely and sparingly:

### Search Bar — Inset well effect
The search bar should look physically pressed into the surface:
```css
.search-well {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top-color: rgba(0, 0, 0, 0.4);      /* darker top = pressed in */
  border-bottom-color: rgba(255,255,255,0.12); /* lighter bottom = depth */
  box-shadow:
    inset 0 2px 6px rgba(0, 0, 0, 0.3),       /* inner shadow top */
    inset 0 -1px 0 rgba(255, 255, 255, 0.05); /* inner highlight bottom */
  border-radius: 16px;
}
```

### Download Button — Physical press
```css
.btn-primary {
  background: linear-gradient(180deg, #5BADFF 0%, #2D8EFF 50%, #1A7BF0 100%);
  border: 1px solid rgba(255,255,255,0.2);
  border-bottom-width: 3px;                   /* thicker bottom = physical depth */
  border-bottom-color: #1060CC;
  border-radius: 14px;
  box-shadow:
    0 4px 12px rgba(45, 142, 255, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.25);
  transition: transform 0.08s, box-shadow 0.08s;
}
.btn-primary:active {
  transform: translateY(2px);
  border-bottom-width: 1px;
  box-shadow: 0 1px 6px rgba(45, 142, 255, 0.3);
}
```

### Result Card — Paper-like texture suggestion
```css
.result-card {
  /* Glass base */
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 20px;
  /* Top highlight = catches light like a card face */
  box-shadow:
    0 2px 0 rgba(255,255,255,0.08) inset,
    0 8px 32px rgba(0, 0, 0, 0.35);
}
```

### Admin Upload Zone — Dashed tactile border
```css
.upload-zone {
  border: 2px dashed rgba(200, 205, 216, 0.35);
  border-radius: 20px;
  background: rgba(255,255,255,0.03);
  transition: border-color 0.2s, background 0.2s;
}
.upload-zone.drag-over {
  border-color: rgba(74, 157, 255, 0.7);
  background: rgba(74, 157, 255, 0.06);
  box-shadow: 0 0 0 4px rgba(74, 157, 255, 0.1);
}
```

---

## 6. Background System

The background is a living scene, not a flat colour:

```css
body {
  background-color: #0A1628;
  background-image:
    /* radial glow top-left: accent blue nebula */
    radial-gradient(ellipse 60% 40% at 20% 10%, rgba(74,157,255,0.12) 0%, transparent 70%),
    /* radial glow bottom-right: silver shimmer */
    radial-gradient(ellipse 50% 35% at 85% 90%, rgba(200,205,216,0.07) 0%, transparent 70%),
    /* subtle mid-canvas depth */
    radial-gradient(ellipse 40% 50% at 50% 50%, rgba(17,34,64,0.6) 0%, transparent 100%);
  min-height: 100vh;
}
```

On mobile, simplify to reduce GPU cost:
```css
@media (max-width: 768px) {
  body {
    background-image:
      radial-gradient(ellipse 80% 30% at 50% 0%, rgba(74,157,255,0.10) 0%, transparent 70%);
  }
}
```

---

## 7. Component Specifications

### 7.1 — App Header

```
┌─────────────────────────────────────┐
│  〜  SlipStream          [Admin ⚙]  │
│      Find your exam timetable       │
└─────────────────────────────────────┘
```

- Logo: `〜` wave character in accent blue, followed by "SlipStream" in Plus Jakarta Sans 700
- Tagline: "Find your exam timetable" in milk-dim, 13px
- Header has NO background — floats over body background
- Admin link: small ghost button, silver text, top-right corner

---

### 7.2 — Search Bar (StudentSearch page)

```
┌─────────────────────────────────────┐
│  🔍  Enter your name or reg number  │  ← glass-input inside search-well
└─────────────────────────────────────┘
         ↓ (after 2+ chars typed)
┌─────────────────────────────────────┐  ← glass-panel--elevated dropdown
│  Amina Juma          2021/CS/001   │
│  Amina Hassan        2021/EE/004   │
│  Aminata Diallo      2022/CS/017   │
└─────────────────────────────────────┘
```

- Input font-size **must be 16px** to prevent iOS auto-zoom
- Debounce search input by 200ms
- Show spinner inside input while fetching
- Dropdown items: 56px min height (touch target), name left, reg right in monospace
- Highlight matching characters in accent blue within dropdown results
- Press Escape → clear and close dropdown

---

### 7.3 — Result Card (shown after student selects their name)

```
┌─────────────────────────────────────┐
│  ✦ Your timetable found             │
│                                     │
│  Amina Juma                         │
│  2021/CS/001  •  Page 4,523         │
│                                     │
│  ┌─────────────────────────────┐   │  ← PDF preview (iframe or img)
│  │   [Timetable preview]       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ⬇  Download my timetable  │   │  ← btn-primary (full width on mobile)
│  └─────────────────────────────┘   │
│                                     │
│  [ Search again ]                   │  ← ghost button, smaller
└─────────────────────────────────────┘
```

- Card animates in: `transform: translateY(12px)` → `translateY(0)`, opacity 0→1, 300ms ease-out
- `✦` sparkle icon in accent blue
- PDF preview: `<iframe>` with `src="/api/preview/{id}"` — show skeleton while loading
- On mobile, preview is 200px tall; on desktop, 340px
- Download filename: `{StudentName}_Timetable.pdf` (spaces replaced with underscores)

---

### 7.4 — Admin Panel (`/admin`)

#### Auth gate
```
┌─────────────────────────────────────┐
│  🔐 Admin Access                    │
│                                     │
│  [ Enter admin token ____________ ] │
│  [ Unlock ]                         │
└─────────────────────────────────────┘
```

#### Dashboard (after auth)
```
┌─────────────────────────────────────┐
│  Index Status                       │
│  ● 36,000 students indexed          │
│  Last indexed: 16 Jun 2025, 10:30   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Upload New Timetable PDF           │
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │  ← upload-zone
│    Drop PDF here or tap to browse   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                     │
│  [ ⚙ Build Index ]                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Indexing Progress                  │
│  ████████████░░░░░░░░ 62%           │  ← live progress via SSE
│  22,320 / 36,000 pages processed    │
└─────────────────────────────────────┘
```

- Use Server-Sent Events (`/api/index/progress`) to stream progress to admin
- Progress bar: glass track + accent fill + subtle pulse animation on the leading edge
- Show unmatched page count at the end: "36,000 indexed, 12 pages unmatched → view log"

---

### 7.5 — Loading & Empty States

**Loading (search in progress):**
Three silver dots pulsing in sequence inside a glass pill.

**No results:**
```
No match found for "Aminah Jumah"
Try your registration number instead, or contact the exams office.
```
Never say "0 results" — be human.

**Index not ready:**
```
Timetables aren't available yet.
Check back soon or contact the exams office.
```

---

## 8. Motion & Animation

All animations must respect `prefers-reduced-motion`.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Page load | Fade in + slide up 16px | 400ms | ease-out |
| Search dropdown | Scale Y 0.95→1 + opacity | 150ms | ease-out |
| Result card appear | Translate Y 12→0 + opacity | 300ms | ease-out |
| Button press | Translate Y 0→2px | 80ms | linear |
| Progress bar fill | Width transition | 200ms | ease |
| Glass panel hover | Border brightens | 200ms | ease |

---

## 9. Responsive Breakpoints

```
Mobile:  320px – 767px   (primary target)
Tablet:  768px – 1023px  (secondary)
Desktop: 1024px+          (admin mainly uses desktop)
```

### Mobile rules (enforced):
- All touch targets minimum **44px × 44px**
- Search input font-size **16px** (prevents iOS zoom)
- Cards fill full width with `16px` horizontal padding
- No hover-only interactions — every action must work on tap
- Dropdown closes on tap outside (use `touchstart` not `mousedown`)
- Sticky header: no — let content breathe, students scroll naturally
- Bottom of screen safe area: add `padding-bottom: env(safe-area-inset-bottom)` to page wrapper

### Desktop enhancements:
- Max content width: `480px` centered (app feels like a card on desktop too)
- Admin panel: `720px` max width
- Hover states on cards: `border-color` brightens, subtle `transform: translateY(-2px)`

---

## 10. Accessibility

- All interactive elements: visible focus ring using `box-shadow: 0 0 0 3px rgba(74,157,255,0.4)`
- Never remove `outline` without replacing it
- Search input: `aria-label="Search by name or registration number"`
- Dropdown: `role="listbox"`, each item `role="option"`, `aria-selected`
- Progress bar: `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Download button: `aria-label="Download {studentName}'s timetable PDF"`
- Error messages: `role="alert"` so screen readers announce them immediately
- Colour contrast: milk on navy-mid passes WCAG AA (min 4.5:1)

---

## 11. Backend Implementation Notes

### PDF Page Extraction (fast path)
```python
from pypdf import PdfReader, PdfWriter
from io import BytesIO

def extract_page(pdf_path: str, page_number: int) -> bytes:
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    writer.add_page(reader.pages[page_number - 1])  # 0-indexed
    buffer = BytesIO()
    writer.write(buffer)
    buffer.seek(0)
    return buffer.read()
```

### Fuzzy Search
Use Python `rapidfuzz` library for fast fuzzy matching:
```python
from rapidfuzz import process, fuzz

def search_students(query: str, index: list[dict]) -> list[dict]:
    names = [s["name"] for s in index]
    matches = process.extract(query, names, scorer=fuzz.WRatio, limit=8, score_cutoff=60)
    ids = {m[2] for m in matches}
    return [index[i] for i in ids]
```

Also search by reg number: exact prefix match on `reg` field.

### Indexing — Text Extraction Per Page
```python
def extract_student_info(page_text: str, config: dict) -> dict | None:
    import re
    name_pattern = re.compile(config["name_regex"])
    reg_pattern  = re.compile(config["reg_regex"])
    name_match = name_pattern.search(page_text)
    reg_match  = reg_pattern.search(page_text)
    if name_match and reg_match:
        return {"name": name_match.group(1).strip(), "reg": reg_match.group(1).strip()}
    return None
```

Default `config.json`:
```json
{
  "name_regex": "Student Name[:\\s]+([A-Za-z ]+)",
  "reg_regex": "Reg(?:istration)?[:\\s#]+([0-9]{4}/[A-Z]+/[0-9]+)"
}
```

Admin can edit this config from the admin panel if the university's PDF has different formatting.

### Async Indexing with SSE Progress
```python
import asyncio
from fastapi import BackgroundTasks
from fastapi.responses import StreamingResponse

indexing_progress = {"current": 0, "total": 0, "running": False}

async def index_pdf_background(pdf_path: str):
    reader = PdfReader(pdf_path)
    total = len(reader.pages)
    indexing_progress.update({"total": total, "current": 0, "running": True})
    results = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        info = extract_student_info(text, load_config())
        if info:
            results.append({**info, "page": i + 1})
        indexing_progress["current"] = i + 1
        if i % 100 == 0:
            await asyncio.sleep(0)  # yield to event loop
    save_index(results)
    indexing_progress["running"] = False

@app.get("/api/index/progress")
async def index_progress_sse():
    async def event_stream():
        while indexing_progress["running"]:
            data = json.dumps(indexing_progress)
            yield f"data: {data}\n\n"
            await asyncio.sleep(0.5)
        yield f"data: {json.dumps({**indexing_progress, 'done': True})}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

---

## 12. Security Considerations

- Admin token: stored only in `.env`, never in frontend code, never logged
- Upload validation: check MIME type is `application/pdf`, reject otherwise
- File size limit: enforce in Nginx (`client_max_body_size 1000m`) AND in FastAPI
- No student PII is stored beyond what's in the PDF itself
- Rate limit the search endpoint: 30 requests/minute per IP (use `slowapi`)
- The download endpoint returns only pre-indexed pages — no arbitrary page access

---

## 13. Agent Prompts

These prompts are for an AI coding agent executing this project. Use them in order.

---

### PROMPT 1 — Backend Scaffold

```
You are building the SlipStream backend. Read CONTEXT.md and SPEC.md first.

Set up a FastAPI project in the `backend/` directory with:
- main.py with CORS configured for the origins in .env
- routes/admin.py with POST /api/upload, POST /api/index, GET /api/index/progress
- routes/student.py with GET /api/search and GET /api/download/{id}
- services/pdf_service.py implementing extract_page() and extract_student_info()
- services/index_service.py with build_index(), load_index(), save_index()
- services/search_service.py with search_students() using rapidfuzz
- data/ directory with .gitkeep and a sample config.json

Follow the exact code patterns in SPEC.md Section 11.
Use python-dotenv for env vars. Use loguru for logging.
Write requirements.txt with pinned versions.
Do not write tests yet — focus on working routes first.
```

---

### PROMPT 2 — Frontend Scaffold

```
You are building the SlipStream React frontend. Read CONTEXT.md and SPEC.md first.

Set up a Vite + React project in `frontend/` with TailwindCSS.
Create the full CSS custom property system from SPEC.md Section 2.
Import the Google Fonts specified in Section 3.
Implement all CSS classes: glass-panel, glass-panel--elevated, glass-input,
search-well, btn-primary, result-card, upload-zone as specified in Sections 4 and 5.
Implement the background system from Section 6.

Create stub pages:
- src/pages/StudentSearch.jsx — renders the header + search bar shell (no API calls yet)
- src/pages/AdminPanel.jsx — renders the admin layout shell

App.jsx should route / to StudentSearch and /admin to AdminPanel.
All components must be mobile-first as per Section 9.
Respect prefers-reduced-motion as per Section 8.
```

---

### PROMPT 3 — Search Feature

```
Implement the full search feature in StudentSearch.jsx following SPEC.md Section 7.2.

- SearchBar component: glass-input inside search-well, 16px font, magnifier icon
- Debounce input by 200ms using a custom useDebounce hook
- Call GET /api/search?q={query} when input length >= 2
- Show loading spinner (three silver dots) while fetching
- Render dropdown (glass-panel--elevated) with results
  - Each row: student name (left) + reg number in JetBrains Mono (right)
  - Min-height 56px per row for touch targets
  - Highlight matched characters in accent blue (#4A9DFF)
- On selection, hide dropdown and show ResultCard component
- Escape key clears input and closes dropdown
- Tap outside closes dropdown (use touchstart event on mobile)
```

---

### PROMPT 4 — Result Card & Download

```
Implement the ResultCard component following SPEC.md Section 7.3.

Props: { student: { name, reg, page, id } }

- Animate card in: opacity 0→1, translateY 12px→0, 300ms ease-out
- Show student name (16px 600 Inter), reg number (JetBrains Mono), page number
- PDF preview: iframe pointing to /api/preview/{id}
  - 200px tall on mobile, 340px on desktop
  - Show skeleton placeholder while iframe loads
- Download button (btn-primary, full width on mobile):
  - href="/api/download/{id}"
  - download attribute = "{StudentName}_Timetable.pdf"
  - Shows ⬇ icon + "Download my timetable"
  - Physical press animation on active state per SPEC.md Section 5
- "Search again" ghost button below: clears result and refocuses search input
```

---

### PROMPT 5 — Admin Panel

```
Implement the full AdminPanel page following SPEC.md Section 7.4.

Auth gate:
- Glass card centered on page with token input + "Unlock" button
- Store token in sessionStorage (not localStorage)
- Call GET /api/status with Authorization header to validate token
- Show error if token is wrong

Dashboard (after auth):
- Index status card: show total indexed, last indexed date
- Upload zone (upload-zone class): drag-and-drop + click to browse
  - Accept only .pdf files
  - Show file name + size after selection
  - POST to /api/upload with multipart/form-data and auth header
  - Show upload progress bar (use XMLHttpRequest for progress events)
- Build Index button: POST /api/index, then connect to GET /api/index/progress via SSE
- Progress card: animated progress bar, "X / Y pages processed"
- On completion: show count of indexed + unmatched with success state

Config panel (collapsible):
- Show current name_regex and reg_regex from config
- Allow admin to edit and save (POST /api/config)
- Warn: "Changing this requires re-indexing"
```

---

### PROMPT 6 — Polish & Responsive QA

```
Review all components against SPEC.md and apply final polish:

1. Verify all glass-panel CSS matches SPEC.md Section 4 exactly
2. Verify all skeuomorphic details match Section 5 exactly
3. Test all touch targets are minimum 44px tall (add padding if needed)
4. Verify search input is 16px font-size (iOS zoom prevention)
5. Add safe-area-inset-bottom padding to page wrapper
6. Implement all empty/loading states from Section 7.5
7. Add aria- attributes from Section 10 to all interactive elements
8. Add prefers-reduced-motion block from Section 8
9. Test layout at 320px, 375px, 768px, 1024px
10. Verify colour contrast: milk (#F8F5F0) on navy-mid (#112240) must pass WCAG AA
11. Add a favicon: a wave emoji 〜 rendered as SVG
12. Ensure the page title is "SlipStream — Find Your Exam Timetable"
```

---

### PROMPT 7 — Deployment

```
Write deployment configuration for SlipStream.

1. docker-compose.yml:
   - backend service: Python 3.11, uvicorn, port 8000, mounts ./data volume
   - frontend service: Node 20, vite build, served by nginx
   - nginx service: reverse proxy, /api/* → backend, /* → frontend static

2. nginx.conf:
   - client_max_body_size 1000m (for large PDF uploads)
   - gzip on for JS/CSS
   - Cache static assets 1 year
   - Proxy /api/ to backend with appropriate headers

3. .env.example with all required variables documented

4. README.md with:
   - One-command setup: docker compose up
   - How admin uploads the PDF
   - How to change regex config
   - How to update to a new semester's PDF
```

---

## 14. Definition of Done

The project is complete when:

- [ ] Student can search by name and get their timetable page in under 2 seconds
- [ ] Student can search by reg number
- [ ] Download works and produces a valid single-page PDF
- [ ] Admin can upload a PDF and trigger indexing
- [ ] Indexing progress is shown live
- [ ] All glass/skeuomorphic styles match this spec exactly
- [ ] App is usable one-handed on a 375px phone screen
- [ ] All touch targets are ≥ 44px
- [ ] No iOS auto-zoom on search input focus
- [ ] WCAG AA colour contrast passes on primary text
- [ ] `prefers-reduced-motion` is respected
- [ ] App loads under 3 seconds on a 4G mobile connection
