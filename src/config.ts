/**
 * Centralized VoiceShield Application Configuration
 */
export const CONFIG = {
  // Backend API URL (Default to 127.0.0.1:8001)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001',
  
  // Toggle for Demo / Mock mode (Always false to ensure real AASIST backend usage)
  USE_MOCK: false,

  // Audio Limits
  MAX_FILE_SIZE_MB: 50,
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
  SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a', 'flac', 'mp4', 'webm', 'ogg'],

  // Default Model Metadata Label
  DEFAULT_MODEL_LABEL: 'AASIST',
};
