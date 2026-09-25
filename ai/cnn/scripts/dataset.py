"""
VoiceShield AI/ML Pipeline - Dataset Loading Module.

Provides PyTorch Dataset implementation (VoiceShieldDataset) for loading audio metadata
from CSV and returning preprocessed audio tensors and label tensors for binary
audio deepfake detection.
"""

import os
from pathlib import Path
from typing import Callable, Optional, Tuple, Union

import pandas as pd
import torch
from torch.utils.data import Dataset

try:
    from ai.cnn.scripts.preprocess import preprocess_audio
except ImportError:
    from preprocess import preprocess_audio


# Label mapping dictionary
LABEL_MAP = {
    "bonafide": 0.0,
    "real": 0.0,
    "0": 0.0,
    "0.0": 0.0,
    "spoof": 1.0,
    "fake": 1.0,
    "1": 1.0,
    "1.0": 1.0,
}


def parse_label(label: Union[str, int, float]) -> float:
    """
    Parses string or numeric label into binary float value.

    Args:
        label: Raw label from metadata CSV (e.g. 'bonafide', 'real', 'spoof', 'fake').

    Returns:
        float: 0.0 for bonafide/real, 1.0 for spoof/fake.

    Raises:
        ValueError: If label is not recognized.
    """
    if isinstance(label, (int, float)):
        val = float(label)
        if val in (0.0, 1.0):
            return val

    clean_label = str(label).strip().lower()
    if clean_label in LABEL_MAP:
        return LABEL_MAP[clean_label]

    raise ValueError(
        f"Unknown label '{label}' encountered in CSV metadata. "
        "Expected one of ('bonafide', 'real', 'spoof', 'fake', 0, 1)."
    )


class VoiceShieldDataset(Dataset):
    """
    PyTorch Dataset for VoiceShield audio deepfake detection.

    Reads metadata CSV file containing audio file paths and labels, loads audio files,
    preprocesses them into Mel-spectrogram tensors, and returns (audio_tensor, label_tensor) pairs.
    """

    def __init__(
        self,
        csv_file: Union[str, Path],
        audio_dir: Optional[Union[str, Path]] = None,
        transform: Optional[Callable[[torch.Tensor], torch.Tensor]] = None,
    ) -> None:
        """
        Initialize VoiceShieldDataset.

        Args:
            csv_file (str or Path): Path to metadata CSV file.
            audio_dir (str or Path, optional): Root directory for audio files.
            transform (callable, optional): Optional transform to be applied on audio tensor.

        Raises:
            FileNotFoundError: If CSV file is not found.
            ValueError: If CSV file is missing required columns or has invalid labels.
        """
        self.csv_file = Path(csv_file)
        self.audio_dir = Path(audio_dir) if audio_dir else None
        self.transform = transform

        # Validate CSV file existence
        if not self.csv_file.exists():
            raise FileNotFoundError(f"Metadata CSV file not found at: {self.csv_file}")

        # Load CSV metadata
        self.df = pd.read_csv(self.csv_file)

        # Validate required CSV columns ('file' and 'label')
        required_cols = {"file", "label"}
        missing_cols = required_cols - set(self.df.columns)
        if missing_cols:
            raise ValueError(
                f"Metadata CSV missing required column(s): {sorted(list(missing_cols))}. "
                f"Found columns: {list(self.df.columns)}"
            )

        # Pre-validate all labels in CSV
        self.labels = [parse_label(lbl) for lbl in self.df["label"]]

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Fetch and preprocess sample at given index.

        Args:
            index (int): Index of sample.

        Returns:
            Tuple[torch.Tensor, torch.Tensor]:
                - audio_tensor: Float32 tensor of shape [1, 128, time]
                - label_tensor: Float32 tensor of shape [1]

        Raises:
            FileNotFoundError: If the specified audio file does not exist.
        """
        row = self.df.iloc[index]
        relative_path = str(row["file"]).strip()

        # Resolve full audio file path safely
        if self.audio_dir:
            audio_path = self.audio_dir / relative_path
        else:
            audio_path = Path(relative_path)

        # Validate audio file existence
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio file not found at: {audio_path}")

        # Load & preprocess audio -> returns Float32 tensor [1, 128, time]
        audio_tensor = preprocess_audio(str(audio_path))

        if not isinstance(audio_tensor, torch.Tensor):
            audio_tensor = torch.tensor(audio_tensor, dtype=torch.float32)
        else:
            audio_tensor = audio_tensor.to(dtype=torch.float32)

        # Apply optional transform
        if self.transform is not None:
            audio_tensor = self.transform(audio_tensor)

        # Label tensor with shape [1]
        label_val = self.labels[index]
        label_tensor = torch.tensor([label_val], dtype=torch.float32)

        return audio_tensor, label_tensor


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="VoiceShield Dataset Inspector")
    parser.add_argument("--csv", type=str, help="Path to metadata CSV file to validate")
    parser.add_argument("--audio_dir", type=str, help="Path to audio root directory")
    args = parser.parse_args()

    if args.csv:
        print(f"Validating CSV structure: {args.csv}")
        dataset = VoiceShieldDataset(csv_file=args.csv, audio_dir=args.audio_dir)
        print(f"Successfully loaded metadata with {len(dataset)} records.")
    else:
        print("VoiceShieldDataset module loaded successfully.")
        print("Run with '--csv <path_to_csv>' to validate a dataset metadata file.")
