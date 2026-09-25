import type { BackendAnalysisResponse, UIAnalysisResult } from '../types/voiceAnalysis';

/**
 * Maps real FastAPI AASIST backend response into UI Analysis Result format.
 */
export function mapResultToUI(response: BackendAnalysisResponse, fallbackFileName: string): UIAnalysisResult {
  const rawPred = (response.prediction || response.label || '').toUpperCase();
  const isDeepfake = rawPred === 'DEEPFAKE' || rawPred === 'FAKE' || rawPred === 'AI_GENERATED';

  const summaryLabel = isDeepfake ? 'Likely AI-Generated Voice' : 'Likely Human Voice';

  const ext = response.audio?.format || fallbackFileName.split('.').pop()?.toUpperCase() || 'WAV';

  return {
    isDeepfake,
    summaryLabel,
    confidence: typeof response.confidence === 'number' ? response.confidence : 0,
    modelName: response.model || 'AASIST',
    device: response.device || 'N/A',
    duration: response.audio?.duration ?? 0,
    sampleRate: response.audio?.sample_rate ?? 16000,
    numSamples: response.audio?.num_samples,
    format: ext,
    message: response.message || 'Analysis completed successfully.',
  };
}
