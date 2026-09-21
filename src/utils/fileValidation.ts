import { CONFIG } from '../config';
import type { AnalysisError } from '../types/voiceAnalysis';

/**
 * Centralized audio file validator.
 * Validates format and size against CONFIG limits.
 */
export function validateAudioFile(file: File): AnalysisError | null {
  if (!file) {
    return {
      category: 'INVALID_FILE',
      message: 'No file was provided for analysis.',
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !CONFIG.SUPPORTED_FORMATS.includes(extension)) {
    return {
      category: 'UNSUPPORTED_FORMAT',
      message: `Unsupported format (.${extension || 'unknown'}). Allowed formats: ${CONFIG.SUPPORTED_FORMATS.map((f) => f.toUpperCase()).join(', ')}.`,
    };
  }

  if (file.size > CONFIG.MAX_FILE_SIZE_BYTES) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      category: 'FILE_TOO_LARGE',
      message: `File size exceeds the ${CONFIG.MAX_FILE_SIZE_MB} MB limit (Uploaded: ${fileSizeMB} MB).`,
    };
  }

  return null;
}
