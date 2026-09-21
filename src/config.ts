/**
 * Centralized VoiceShield Application Configuration
 */
export const CONFIG = {
  // Backend API URL (Empty by default, uses mock demo mode until FastAPI endpoint is set)
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  
  // Toggle for Demo / Mock mode
  USE_MOCK: import.meta.env.VITE_USE_MOCK !== 'false',

  // Audio Limits
  MAX_FILE_SIZE_MB: 50,
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
  SUPPORTED_FORMATS: ['mp3', 'wav', 'm4a', 'flac'],

  // Default Model Metadata Label for Demo Mode
  DEFAULT_MODEL_LABEL: 'Demo Analysis',
};
