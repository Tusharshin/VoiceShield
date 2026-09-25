import { CONFIG } from '../config';
import { validateAudioFile } from '../utils/fileValidation';
import type { BackendAnalysisResponse, AnalysisError } from '../types/voiceAnalysis';

/**
 * Real VoiceShield Backend API Service.
 *
 * Sends audio file to FastAPI backend at:
 * POST http://127.0.0.1:8001/api/v1/analyze
 * using multipart/form-data with field "file".
 */
export async function analyzeVoice(file: File): Promise<BackendAnalysisResponse> {
  // 1. Validate file locally before sending
  const validationError = validateAudioFile(file);
  if (validationError) {
    throw validationError;
  }

  const baseUrl = CONFIG.API_BASE_URL || 'http://127.0.0.1:8001';
  const url = `${baseUrl}/api/v1/analyze`;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // Ignore JSON parse error
      }

      const err: AnalysisError = {
        category: response.status >= 500 ? 'SERVER_ERROR' : 'PROCESSING_FAILED',
        message: errorMessage,
      };
      throw err;
    }

    const data: BackendAnalysisResponse = await response.json();
    return data;
  } catch (error: any) {
    if (error && error.category) {
      throw error;
    }

    // Unreachable / network connection error
    const unreachableErr: AnalysisError = {
      category: 'UNREACHABLE',
      message: 'VoiceShield backend is not running. Please start the FastAPI server.',
    };
    throw unreachableErr;
  }
}
