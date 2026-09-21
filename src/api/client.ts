import { CONFIG } from '../config';
import type { AnalysisError } from '../types/voiceAnalysis';

/**
 * Standardized HTTP client for future backend FastAPI requests.
 */
export async function postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
  const url = `${CONFIG.API_BASE_URL}${endpoint}`;

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
        // Ignore JSON parse error for error response
      }

      const err: AnalysisError = {
        category: response.status >= 500 ? 'SERVER_ERROR' : 'PROCESSING_FAILED',
        message: errorMessage,
      };
      throw err;
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error.category) {
      throw error;
    }
    const networkErr: AnalysisError = {
      category: 'NETWORK_ERROR',
      message: 'Unable to connect to VoiceShield processing server. Please check your network connection.',
    };
    throw networkErr;
  }
}
