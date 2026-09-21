from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, analyze
from app.utils.errors import AppError, app_exception_handler, generic_exception_handler

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="VoiceShield AI Voice Authenticity Detection Backend API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
origins = list(settings.ALLOWED_ORIGINS)
if settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(AppError, app_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Register API v1 Routers
app.include_router(health.router, prefix=settings.API_PREFIX, tags=["Health"])
app.include_router(analyze.router, prefix=settings.API_PREFIX, tags=["Analyze"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
