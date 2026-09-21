import { CONFIG } from '../config';
import { postFormData } from './client';
import { mockAnalyzeVoice } from './mockService';
import { validateAudioFile } from '../utils/fileValidation';
import type { VoiceAnalysisResponse } from '../types/voiceAnalysis';

/**
 * Main Frontend Voice Analysis Entry Point.
 * 
 * Flow:
 * UI (/detect) -> analyzeVoice(file) -> API layer -> (Mock or FastAPI endpoint) -> Response
 */
export async function analyzeVoice(
  file: File,
  onStageChange?: (stageIndex: number) => void
): Promise<VoiceAnalysisResponse> {
  // 1. Centralized File Validation
  const validationError = validateAudioFile(file);
  if (validationError) {
    throw validationError;
  }

  // 2. Delegate to Mock if in Demo mode or if API_BASE_URL is not configured
  if (CONFIG.USE_MOCK || !CONFIG.API_BASE_URL) {
    return await mockAnalyzeVoice(file, onStageChange);
  }

  // 3. Real Backend API Request (POST /api/v1/analyze)
  const formData = new FormData();
  formData.append('audio', file);

  if (onStageChange) onStageChange(1); // Uploading/Preparing

  const response = await postFormData<VoiceAnalysisResponse>('/api/v1/analyze', formData);

  if (onStageChange) onStageChange(4); // Preparing result

  return response;
}
