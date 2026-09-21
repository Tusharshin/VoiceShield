# VoiceShield FastAPI Backend API

Production-quality FastAPI backend foundation for VoiceShield AI Voice Authenticity and Deepfake Detection.

## Architecture

- **Framework**: FastAPI (Python 3.11)
- **ASGI Server**: Uvicorn
- **Audio Preprocessing**: SoundFile, Librosa, NumPy (16 kHz mono resampling, amplitude normalization)
- **Model Hardware Detection**: Intel XPU, NVIDIA CUDA, CPU fallback
- **Target Model Architecture**: AASIST (Audio Anti-Spoofing Integration with Spectro-Temporal Graph Attention)

## Directory Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization & CORS
│   ├── core/
│   │   └── config.py        # Settings & environment variables
│   ├── api/
│   │   └── routes/
│   │       ├── health.py    # /health and /health/model endpoints
│   │       └── analyze.py   # /analyze audio POST endpoint
│   ├── schemas/
│   │   └── analysis.py      # Pydantic request/response models
│   ├── services/
│   │   ├── audio_service.py # Audio validation, decoding, 16kHz mono resampling
│   │   └── model_service.py # Device detection & AASIST model inference loader
│   └── utils/
│       └── errors.py        # Centralized exception handlers & error codes
├── models/                  # AASIST weight files (aasist.pth)
├── uploads/                 # Temporary file uploads (purged automatically)
├── requirements.txt
├── .env.example
└── README.md
```

## Setup & Running Locally

### 1. Create Virtual Environment
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Backend
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API Endpoints

- **Swagger Documentation**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`
- **Health Check**: `GET /api/v1/health`
- **Model Status**: `GET /api/v1/health/model`
- **Analyze Audio**: `POST /api/v1/analyze` (multipart/form-data field `file` or `audio`)

## Model Status Behavior

When no model weights are loaded (`models/aasist.pth` missing), `/api/v1/health/model` and `/api/v1/analyze` return status `"model_not_loaded"` with no fake prediction data generated. Placing trained model weights in `models/aasist.pth` enables full production inference.
