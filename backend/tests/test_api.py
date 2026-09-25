import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "voiceshield-api"
    assert data["version"] == "1.0.0"

def test_model_health_endpoint():
    response = client.get("/api/v1/health/model")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "model_not_loaded"
    assert data["model"] == "AASIST"
    assert "device" in data
    assert "weights_path" in data

def test_analyze_valid_audio():
    # Generate 1-second 16kHz sine wave audio
    sr = 16000
    t = np.linspace(0, 1, sr)
    audio = np.sin(2 * np.pi * 440 * t).astype(np.float32)

    buf = io.BytesIO()
    sf.write(buf, audio, sr, format="WAV")
    buf.seek(0)

    files = {"file": ("test_sine.wav", buf, "audio/wav")}
    response = client.post("/api/v1/analyze", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "model_not_loaded"
    assert data["prediction"] is None
    assert data["confidence"] is None
    assert data["audio"]["duration"] == 1.0
    assert data["audio"]["sample_rate"] == 16000
    assert data["audio"]["format"] == "WAV"

def test_analyze_unsupported_format():
    buf = io.BytesIO(b"invalid text payload")
    files = {"file": ("document.txt", buf, "text/plain")}
    response = client.post("/api/v1/analyze", files=files)
    
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == "UNSUPPORTED_AUDIO_FORMAT"

def test_analyze_empty_file():
    buf = io.BytesIO(b"")
    files = {"file": ("empty.wav", buf, "audio/wav")}
    response = client.post("/api/v1/analyze", files=files)
    
    assert response.status_code == 400
    data = response.json()
    assert data["status"] == "error"
    assert data["code"] == "EMPTY_FILE"
