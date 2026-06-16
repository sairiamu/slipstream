# SlipStream

SlipStream is a fast, mobile-first web application designed for university students to instantly find and download their individual exam timetable pages from a massive master PDF.

## 🚀 Features
- **Fuzzy Search**: Search by name or registration number with typo tolerance.
- **On-demand PDF Extraction**: Extracts and serves only the specific page relevant to the student.
- **Live Indexing**: Admin dashboard with real-time SSE (Server-Sent Events) progress tracking for PDF processing.
- **Secure Admin**: Token-based authentication for PDF uploads and indexing triggers.
- **CI/CD Integrated**: Automated testing and Docker image builds via GitHub Actions.

## 🛠 Tech Stack
- **Backend**: Python 3.11, FastAPI, PyPDF, RapidFuzz.
- **Frontend**: Vite-based modern web UI.
- **Infrastructure**: Docker, Nginx, GitHub Actions.

## 📦 Quick Start (Docker)

1. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   ADMIN_TOKEN=your_secure_token
   CORS_ORIGINS=http://localhost:8080
   ```

2. **Launch**:
   ```bash
   docker compose up --build
   ```
   - Frontend: `http://localhost:8080`
   - Backend API: `http://localhost:8000`

## 🧪 CI/CD & Testing
The project includes a GitHub Actions pipeline (`.github/workflows/deploy.yml`) that:
1. Runs automated tests on every PR and push.
2. Builds Docker images for both Frontend and Backend.
3. Pushes the images to Docker Hub (on `main` branch pushes).

### Running Tests Locally
```bash
cd backend
export PYTHONPATH=$PYTHONPATH:.
pytest tests/
```

## ⚙️ Configuration
Extraction rules are defined in `backend/data/config.json`. Update these regex patterns to match your PDF format:
- `name_regex`: Pattern to find the student's name.
- `reg_regex`: Pattern to find the registration number.

## 🚀 Deployment Instructions

To push this project to your GitHub repository:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/sairiamu/slipstream.git
git push -u origin main
```

> **Note**: Ensure you have configured your Docker Hub secrets (`DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`) in your GitHub repository settings for the CI/CD pipeline to succeed.
