from fastapi import APIRouter
from app.schemas.analysis import HealthResponse, ModelHealthResponse
from app.services.model_service import model_service

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    """
    GET /api/v1/health
    Returns service health status.
    """
    return HealthResponse(
        status="ok",
        service="voiceshield-api",
        version="1.0.0"
    )

@router.get("/health/model", response_model=ModelHealthResponse)
def get_model_health():
    """
    GET /api/v1/health/model
    Reports model status, device, and weights path without claiming an un-loaded model is active.
    """
    is_loaded = model_service.is_model_loaded()
    return ModelHealthResponse(
        status="loaded" if is_loaded else "model_not_loaded",
        model="AASIST",
        device=model_service.device,
        weights_path=model_service.model_path
    )
