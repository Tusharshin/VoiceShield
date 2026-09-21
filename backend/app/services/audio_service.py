import os
import tempfile
import numpy as np
import soundfile as sf
import librosa
from app.core.config import settings
from app.utils.errors import (
    UnsupportedAudioFormatError,
    FileTooLargeError,
    EmptyFileError,
    CorruptedAudioError,
)

class AudioService:
    @staticmethod
    def validate_file_metadata(filename: str, file_size: int):
        if not filename:
            raise EmptyFileError("No filename provided.")
        
        if file_size <= 0:
            raise EmptyFileError("The uploaded file is empty (0 bytes).")
        
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.SUPPORTED_EXTENSIONS:
            raise UnsupportedAudioFormatError(
                f"Unsupported audio format '{ext}'. Allowed formats: {', '.join(settings.SUPPORTED_EXTENSIONS)}"
            )
        
        max_bytes = settings.MAX_AUDIO_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            raise FileTooLargeError(
                f"File size ({(file_size / (1024 * 1024)):.1f} MB) exceeds maximum allowed limit of {settings.MAX_AUDIO_SIZE_MB} MB."
            )

    @staticmethod
    def preprocess_audio(file_bytes: bytes, filename: str) -> dict:
        """
        Loads audio bytes, converts to mono, resamples to target 16 kHz,
        normalizes signal safely, and returns numpy waveform + metadata.
        Temporary processing files are safely cleaned up post-processing.
        """
        ext = os.path.splitext(filename)[1].lower()
        if not ext:
            ext = ".wav"

        # Temporary file with automatic cleanup
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name

        try:
            # Try soundfile read first, fallback to librosa
            try:
                data, sr = sf.read(tmp_path)
            except Exception:
                try:
                    data, sr = librosa.load(tmp_path, sr=None, mono=False)
                    if data.ndim > 1:
                        data = data.T
                except Exception as e:
                    raise CorruptedAudioError(f"Failed to decode audio content: {str(e)}")

            if data is None or len(data) == 0:
                raise CorruptedAudioError("Decoded audio waveform is empty.")

            # Convert stereo / multi-channel to mono
            if data.ndim > 1:
                data = np.mean(data, axis=1)

            # Resample to target sample rate (16000 Hz) if required
            target_sr = settings.TARGET_SAMPLE_RATE
            if sr != target_sr:
                data = librosa.resample(y=data, orig_sr=sr, target_sr=target_sr)
                sr = target_sr

            # Safe amplitude normalization
            max_val = np.max(np.abs(data))
            if max_val > 0:
                data = data / max_val

            duration = float(len(data) / sr)

            return {
                "waveform": data,
                "sample_rate": sr,
                "duration": round(duration, 2),
                "num_samples": len(data),
                "format": ext.replace(".", "").upper(),
            }
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
