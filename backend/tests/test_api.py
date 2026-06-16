from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "SlipStream API is running"}

def test_api_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    assert "status" in response.json()
