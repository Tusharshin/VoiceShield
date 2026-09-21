from pydantic import BaseModel, Field
from typing import Optional

class AudioMetadata(BaseModel):
    duration: float = Field(..., description="Audio duration in seconds")
    sample_rate: int = Field(16000, description="Sampling rate in Hz")
    num_samples: int = Field(..., description="Total audio samples")
    format: str = Field(..., description="File extension/format")

class AnalysisResponse(BaseModel):
    status: str = Field(..., description="Analysis status: 'completed', 'model_not_loaded', or 'error'")
    prediction: Optional[str] = Field(None, description="Prediction label: 'real' or 'fake'")
    label: Optional[str] = Field(None, description="Frontend compatible label: 'human' or 'ai_generated'")
    confidence: Optional[float] = Field(None, description="Confidence percentage (0.0 to 100.0)")
    model: str = Field("AASIST", description="Neural model architecture name")
    device: str = Field(..., description="Execution hardware device ('xpu', 'cuda', 'cpu')")
    audio: Optional[AudioMetadata] = Field(None, description="Extracted audio metadata")
    message: Optional[str] = Field(None, description="Informational message or reason")

class ModelHealthResponse(BaseModel):
    status: str = Field(..., description="Model status ('loaded' or 'model_not_loaded')")
    model: str = Field("AASIST", description="Model architecture")
    device: str = Field(..., description="Hardware compute device ('xpu', 'cuda', 'cpu')")
    weights_path: str = Field(..., description="Configured model weights filepath")

class HealthResponse(BaseModel):
    status: str = Field("ok", description="API health status")
    service: str = Field("voiceshield-api", description="Service identifier")
    version: str = Field("1.0.0", description="API version")

class ErrorResponse(BaseModel):
    status: str = "error"
    code: str = Field(..., description="Application error code")
    message: str = Field(..., description="Human readable error message")
