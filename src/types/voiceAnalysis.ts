export type AnalysisLabel = 'human' | 'ai_generated' | 'uncertain';

export type AnalysisStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export type ErrorCategory =
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'PROCESSING_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface VoiceAnalysisRequest {
  file: File;
}

export interface VoiceAnalysisResponse {
  label: AnalysisLabel;
  confidence: number; // Percentage integer 0 - 100
  duration?: number; // seconds
  language?: string;
  model?: string;
  explanation?: string;
  format?: string;
  sampleRate?: string;
  isDemo?: boolean;
}

export interface AnalysisError {
  category: ErrorCategory;
  message: string;
}

export interface UIAnalysisResult {
  summaryLabel: string;
  label: AnalysisLabel;
  confidence: number;
  duration: number;
  language: string;
  format: string;
  sampleRate: string;
  modelName: string;
  explanation: string;
  modelDetails: string;
  limitations: string;
  isDemo: boolean;
}
