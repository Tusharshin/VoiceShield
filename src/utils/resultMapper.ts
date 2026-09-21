import type { VoiceAnalysisResponse, UIAnalysisResult, AnalysisLabel } from '../types/voiceAnalysis';
import { CONFIG } from '../config';

/**
 * Maps raw backend/API response into safe, user-facing UI result structure.
 * Enforces probabilistic, neutral language.
 */
export function mapResultToUI(response: VoiceAnalysisResponse, fileName: string): UIAnalysisResult {
  const labelMap: Record<AnalysisLabel, string> = {
    human: 'Likely Human Voice',
    ai_generated: 'Likely AI-generated',
    uncertain: 'Unable to determine confidently',
  };

  const summaryLabel = labelMap[response.label] || 'Unable to determine confidently';
  const ext = fileName.split('.').pop()?.toUpperCase() || 'WAV';

  const defaultExplanation =
    response.label === 'ai_generated'
      ? 'VoiceShield detected acoustic patterns that may be associated with synthetic speech.'
      : response.label === 'human'
      ? 'VoiceShield detected natural pitch variation and continuous acoustic characteristics consistent with human speech.'
      : 'Acoustic patterns exhibit mixed signals that cannot be definitively classified.';

  return {
    summaryLabel,
    label: response.label,
    confidence: response.confidence,
    duration: response.duration || 10,
    language: response.language || 'Auto-Detected (Hindi / EN)',
    format: response.format || ext,
    sampleRate: response.sampleRate || '16 kHz',
    modelName: response.model || CONFIG.DEFAULT_MODEL_LABEL,
    explanation: response.explanation || defaultExplanation,
    modelDetails:
      'Detailed model signals will appear here once the production inference engine is connected.',
    limitations:
      'Voice detection is probabilistic and should not be treated as absolute proof of authenticity.',
    isDemo: response.isDemo ?? true,
  };
}
