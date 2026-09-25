import numpy as np
import librosa
import torch


SAMPLE_RATE = 16000
DURATION = 4
NUM_SAMPLES = SAMPLE_RATE * DURATION

N_MELS = 128
N_FFT = 1024
HOP_LENGTH = 256


def preprocess_audio(audio_path):
    """
    Load an audio file and convert it into a normalized
    4-second Mel-Spectrogram suitable for CNN input.
    """

    # 1. Load audio as mono at 16 kHz
    waveform, _ = librosa.load(
        audio_path,
        sr=SAMPLE_RATE,
        mono=True
    )

    # 2. Peak normalization
    peak = np.max(np.abs(waveform))

    if peak > 0:
        waveform = waveform / peak

    # 3. Fix audio length to exactly 4 seconds
    if len(waveform) < NUM_SAMPLES:
        waveform = np.pad(
            waveform,
            (0, NUM_SAMPLES - len(waveform))
        )
    else:
        waveform = waveform[:NUM_SAMPLES]

    # 4. Convert waveform → Mel-Spectrogram
    mel = librosa.feature.melspectrogram(
        y=waveform,
        sr=SAMPLE_RATE,
        n_fft=N_FFT,
        hop_length=HOP_LENGTH,
        n_mels=N_MELS,
        power=2.0
    )

    # 5. Convert power spectrogram → decibel scale
    mel_db = librosa.power_to_db(
        mel,
        ref=np.max
    )

    # 6. Normalize spectrogram
    mel_db = (
        mel_db - np.mean(mel_db)
    ) / (np.std(mel_db) + 1e-8)

    # 7. Convert to PyTorch tensor
    # Shape: [1, 128, time]
    tensor = torch.tensor(
        mel_db,
        dtype=torch.float32
    ).unsqueeze(0)

    return tensor


if __name__ == "__main__":
    print("VoiceShield CNN audio preprocessing module")
    print(f"Sample rate: {SAMPLE_RATE} Hz")
    print(f"Duration: {DURATION} seconds")
    print(f"Mel bands: {N_MELS}")
    print("Expected CNN input shape: [1, 128, time]")