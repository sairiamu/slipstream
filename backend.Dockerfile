# STAGE 1 — builder
FROM python:3.11-slim AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpoppler-cpp-dev poppler-utils \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# STAGE 2 — runtime
FROM python:3.11-slim AS runtime

# Install only runtime deps (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    poppler-utils libpoppler-cpp-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Create non-root user
RUN groupadd --gid 1001 appgroup && \
    useradd --uid 1001 --gid appgroup --shell /bin/bash --create-home appuser

WORKDIR /app

# Copy app code
COPY backend/ ./backend/

# Copy the timetable PDF into the container
# COPY "MUST_PERSONALIZED TIMETABLE_TEST 2_SEMESTER II 2025-2026_15-06-2026.pdf" ./data/timetable.pdf
COPY ["MUST_PERSONALIZED TIMETABLE_TEST 2_SEMESTER II 2025-2026_15-06-2026.pdf", "./data/timetable.pdf"]

# Create data directory and set permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appgroup /app

# Switch to non-root
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/status')" || exit 1

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "2", "--no-access-log"]
