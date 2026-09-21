import type { VoiceAnalysisResponse } from '../types/voiceAnalysis';

export const PROCESSING_STAGES = [
  'Uploading audio',
  'Preparing audio',
  'Analyzing acoustic patterns',
  'Running AI detection',
  'Preparing result',
];

/**
 * Isolated Mock Analysis Service for Frontend Testing.
 * Easy to replace when the FastAPI + PyTorch backend is connected.
 */
export async function mockAnalyzeVoice(
  file: File,
  onStageChange?: (stageIndex: number) => void
): Promise<VoiceAnalysisResponse> {
  const totalStages = PROCESSING_STAGES.length;

  for (let i = 0; i < totalStages; i++) {
    if (onStageChange) {
      onStageChange(i);
    }
    // Simulate stage latency
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const name = file.name.toLowerCase();
  const isLikelyAI = name.includes('ai') || name.includes('clone') || name.includes('synthetic');
  const ext = file.name.split('.').pop()?.toUpperCase() || 'WAV';

  return {
    label: isLikelyAI ? 'ai_generated' : 'human',
    confidence: isLikelyAI ? 92 : 96,
    duration: Math.max(3, Math.min(30, Math.round(file.size / (1024 * 50)))),
    language: 'Auto-Detected (Hindi / EN)',
    format: ext,
    sampleRate: '16 kHz',
    model: 'Demo Analysis',
    explanation: isLikelyAI
      ? 'VoiceShield detected acoustic patterns that may be associated with synthetic speech.'
      : 'VoiceShield detected natural pitch variation and continuous acoustic characteristics consistent with human speech.',
    isDemo: true,
  };
}
