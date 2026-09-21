from fastapi import Request
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class UnsupportedAudioFormatError(AppError):
    def __init__(self, message: str = "This audio format is not supported."):
        super().__init__(code="UNSUPPORTED_AUDIO_FORMAT", message=message, status_code=400)

class FileTooLargeError(AppError):
    def __init__(self, message: str = "Uploaded file exceeds maximum allowed size."):
        super().__init__(code="FILE_TOO_LARGE", message=message, status_code=400)

class EmptyFileError(AppError):
    def __init__(self, message: str = "The uploaded file is empty."):
        super().__init__(code="EMPTY_FILE", message=message, status_code=400)

class CorruptedAudioError(AppError):
    def __init__(self, message: str = "Failed to process audio. File may be corrupted."):
        super().__init__(code="CORRUPTED_AUDIO", message=message, status_code=422)

class ModelNotLoadedError(AppError):
    def __init__(self, message: str = "AASIST model weights are not loaded."):
        super().__init__(code="MODEL_NOT_LOADED", message=message, status_code=503)

async def app_exception_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "error",
            "code": exc.code,
            "message": exc.message,
        },
    )

async def generic_exception_handler(request: Request, exc: Exception):
    # Hide tracebacks from end-users, log internally
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected server error occurred during audio processing.",
        },
    )
