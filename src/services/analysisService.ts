export interface AnalysisResult {
  label: 'ai_generated' | 'human';
  confidence: number; // percentage integer, e.g., 92
  duration: number; // in seconds
  language: string;
  format: string;
  sampleRate: string;
  isDemo: boolean;
  explanation: string;
  summary: string;
  modelDetails: string;
  limitations: string;
}

export const ANALYSIS_STAGES = [
  'Uploading audio',
  'Preparing audio',
  'Analyzing acoustic patterns',
  'Running AI detection',
  'Preparing result',
];

/**
 * Backend-ready mock analysis service.
 * Simulates POST /api/analyze flow for the AASIST FastAPI backend integration.
 */
export async function analyzeAudio(
  fileOrBlob: File | Blob,
  fileName?: string,
  onStageChange?: (stageIndex: number) => void
): Promise<AnalysisResult> {
  const totalStages = ANALYSIS_STAGES.length;

  for (let i = 0; i < totalStages; i++) {
    if (onStageChange) {
      onStageChange(i);
    }
    // Simulate processing latency per stage
    await new Promise((resolve) => setTimeout(resolve, 600));
  }

  // Determine file properties
  const name = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'recorded_voice.wav');
  const size = fileOrBlob.size;
  const isLikelyAI = name.toLowerCase().includes('ai') || name.toLowerCase().includes('clone') || name.toLowerCase().includes('synthetic');
  const ext = name.split('.').pop()?.toUpperCase() || 'WAV';

  // Standardized AASIST backend response schema simulation
  return {
    label: isLikelyAI ? 'ai_generated' : 'human',
    confidence: isLikelyAI ? 92 : 96,
    duration: Math.max(3, Math.min(30, Math.round(size / (1024 * 50)))),
    language: 'Auto-Detected (Hindi / EN)',
    format: ext,
    sampleRate: '16 kHz',
    isDemo: true,
    explanation: isLikelyAI
      ? 'VoiceShield detected acoustic patterns that may be associated with synthetic speech.'
      : 'VoiceShield detected natural vocal variation and continuous acoustic characteristics consistent with human speech.',
    summary: isLikelyAI ? 'Likely AI-generated' : 'Likely Human Voice',
    modelDetails:
      'Detailed model signals will appear here once the production inference engine is connected.',
    limitations:
      'Voice detection is probabilistic and should not be treated as absolute proof of authenticity.',
  };
}
