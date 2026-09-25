export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

export type ErrorCategory =
  | 'INVALID_FILE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'PROCESSING_FAILED'
  | 'NETWORK_ERROR'
  | 'SERVER_ERROR'
  | 'UNREACHABLE'
  | 'UNKNOWN_ERROR';

export interface AudioMetadata {
  duration: number;
  sample_rate: number;
  num_samples: number;
  format: string;
}

export interface BackendAnalysisResponse {
  status: string;
  prediction?: string; // "DEEPFAKE" | "REAL" | "fake" | "real"
  label?: string;      // "DEEPFAKE" | "REAL" | "ai_generated" | "human"
  confidence?: number; // percentage float, e.g. 100.0
  model: string;       // "AASIST"
  device: string;      // "xpu" | "cuda" | "cpu"
  audio?: AudioMetadata;
  message?: string;
}

export interface AnalysisError {
  category: ErrorCategory;
  message: string;
}

export interface UIAnalysisResult {
  isDeepfake: boolean;
  summaryLabel: string;
  confidence: number;
  modelName: string;
  device: string;
  duration: number;
  sampleRate: number;
  numSamples?: number;
  format: string;
  message?: string;
}
