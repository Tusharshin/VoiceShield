from fastapi import APIRouter, File, UploadFile
from typing import Optional
from app.schemas.analysis import AnalysisResponse, AudioMetadata
from app.services.audio_service import AudioService
from app.services.model_service import model_service
from app.utils.errors import EmptyFileError

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None)
):
    """
    POST /api/v1/analyze
    Accepts multipart/form-data field 'file' or 'audio'.
    Validates payload, preprocesses audio to 16 kHz mono waveform,
    and returns structured analysis response.
    """
    upload_file = file or audio
    if not upload_file:
        raise EmptyFileError("No audio file was uploaded in request (expected form field 'file' or 'audio').")

    # Read uploaded audio content
    content = await upload_file.read()
    filename = upload_file.filename or "uploaded_audio.wav"

    # 1. Validate file metadata
    AudioService.validate_file_metadata(filename, len(content))

    # 2. Preprocess audio payload
    audio_meta = AudioService.preprocess_audio(content, filename)

    # 3. Model inference check
    inference_res = model_service.predict(
        waveform=audio_meta["waveform"],
        sample_rate=audio_meta["sample_rate"]
    )

    metadata_obj = AudioMetadata(
        duration=audio_meta["duration"],
        sample_rate=audio_meta["sample_rate"],
        num_samples=audio_meta["num_samples"],
        format=audio_meta["format"]
    )

    return AnalysisResponse(
        status=inference_res["status"],
        prediction=inference_res.get("prediction"),
        label=inference_res.get("label"),
        confidence=inference_res.get("confidence"),
        model=inference_res.get("model", "AASIST"),
        device=inference_res.get("device", model_service.device),
        audio=metadata_obj,
        message=inference_res.get("message")
    )
