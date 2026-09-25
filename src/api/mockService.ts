import type { BackendAnalysisResponse } from '../types/voiceAnalysis';

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
): Promise<BackendAnalysisResponse> {
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
    status: 'ok',
    prediction: isLikelyAI ? 'DEEPFAKE' : 'REAL',
    label: isLikelyAI ? 'DEEPFAKE' : 'REAL',
    confidence: isLikelyAI ? 92 : 96,
    model: 'AASIST',
    device: 'cpu',
    audio: {
      duration: Math.max(3, Math.min(30, Math.round(file.size / (1024 * 50)))),
      sample_rate: 16000,
      num_samples: 64000,
      format: ext,
    },
    message: 'Analysis completed successfully.',
  };
}
