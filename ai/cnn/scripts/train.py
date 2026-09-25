"""
VoiceShield AI/ML Pipeline - CNN Baseline Training Script.

This script trains the baseline 2D Convolutional Neural Network (CNNBaseline)
for binary audio deepfake detection (bonafide vs. spoof).

Binary Classification Labels:
    - Label 0.0: Bonafide / Real audio
    - Label 1.0: Spoof / Fake audio

Key Technical Details:
    - Model returns single unnormalized logit per sample.
    - Loss function: BCEWithLogitsLoss (numerically stable binary cross-entropy with implicit sigmoid).
    - Device support: Priority selection (Intel XPU > NVIDIA CUDA > Apple MPS > CPU).
    - Best model checkpointing based on validation loss.
"""

import argparse
import sys
from pathlib import Path
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

# Add project root and module directories to sys.path to allow execution from any directory
FILE_PATH = Path(__file__).resolve()
PROJECT_ROOT = FILE_PATH.parents[3]  # e:\confiance
MODELS_DIR = FILE_PATH.parents[1] / "models"  # e:\confiance\ai\cnn\models
SCRIPTS_DIR = FILE_PATH.parent  # e:\confiance\ai\cnn\scripts

for p in [str(PROJECT_ROOT), str(MODELS_DIR), str(SCRIPTS_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from ai.cnn.scripts.dataset import VoiceShieldDataset
    from ai.cnn.models.cnn_baseline import CNNBaseline
except ImportError:
    from dataset import VoiceShieldDataset
    from cnn_baseline import CNNBaseline


def get_device() -> torch.device:
    """
    Detects and returns the best available compute device for training.

    Device selection priority:
        1. Intel XPU
        2. NVIDIA CUDA
        3. Apple MPS
        4. CPU
    """
    if hasattr(torch, "xpu") and torch.xpu.is_available():
        device = torch.device("xpu")
        device_name = torch.xpu.get_device_name(0) if hasattr(torch.xpu, "get_device_name") else "Intel XPU"
        print(f"[Device Selection] Using Intel XPU device: {device_name}")
    elif torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"[Device Selection] Using NVIDIA CUDA device: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = torch.device("mps")
        print("[Device Selection] Using Apple MPS device")
    else:
        device = torch.device("cpu")
        print("[Device Selection] Using CPU device")

    return device


def parse_args() -> argparse.Namespace:
    """
    Parses command-line arguments for training CNNBaseline.
    """
    parser = argparse.ArgumentParser(
        description="VoiceShield CNN Baseline Training Script for Binary Audio Deepfake Detection."
    )

    parser.add_argument(
        "--train-csv",
        type=str,
        required=True,
        help="Path to the training metadata CSV file (must contain 'file' and 'label' columns).",
    )
    parser.add_argument(
        "--val-csv",
        type=str,
        required=True,
        help="Path to the validation metadata CSV file (must contain 'file' and 'label' columns).",
    )
    parser.add_argument(
        "--audio-dir",
        type=str,
        default=None,
        help="Root directory containing audio files (optional if paths in CSV are absolute).",
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=10,
        help="Number of training epochs (default: 10).",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=32,
        help="Batch size for training and validation (default: 32).",
    )
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=1e-3,
        help="Learning rate for AdamW optimizer (default: 0.001).",
    )
    parser.add_argument(
        "--num-workers",
        type=int,
        default=0,
        help="Number of subprocesses for data loading (default: 0 for safe cross-platform execution).",
    )
    parser.add_argument(
        "--checkpoint-dir",
        type=str,
        default="ai/cnn/checkpoints",
        help="Directory to save model checkpoints (default: 'ai/cnn/checkpoints').",
    )

    return parser.parse_args()


def validate_paths(train_csv: str, val_csv: str, audio_dir: str | None = None) -> None:
    """
    Validates existence of input CSV files and audio directory.
    """
    train_path = Path(train_csv)
    if not train_path.exists():
        raise FileNotFoundError(f"Training metadata CSV not found: {train_path.resolve()}")

    val_path = Path(val_csv)
    if not val_path.exists():
        raise FileNotFoundError(f"Validation metadata CSV not found: {val_path.resolve()}")

    if audio_dir:
        audio_path = Path(audio_dir)
        if not audio_path.exists():
            raise FileNotFoundError(f"Audio root directory not found: {audio_path.resolve()}")


def train_one_epoch(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    optimizer: optim.Optimizer,
    device: torch.device,
) -> float:
    """
    Executes one training epoch.
    """
    model.train()
    running_loss = 0.0
    total_samples = 0

    for audio_batch, label_batch in dataloader:
        audio_batch = audio_batch.to(device)
        label_batch = label_batch.to(device)

        optimizer.zero_grad()
        outputs = model(audio_batch)
        loss = criterion(outputs, label_batch)
        loss.backward()
        optimizer.step()

        batch_size = audio_batch.size(0)
        running_loss += loss.item() * batch_size
        total_samples += batch_size

    return running_loss / total_samples if total_samples > 0 else 0.0


def validate(
    model: nn.Module,
    dataloader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> tuple:
    """
    Executes evaluation on validation dataset.

    Returns:
        tuple[float, float]: (average_validation_loss, validation_accuracy_percentage)
    """
    model.eval()
    running_loss = 0.0
    correct_predictions = 0
    total_samples = 0

    with torch.no_grad():
        for audio_batch, label_batch in dataloader:
            audio_batch = audio_batch.to(device)
            label_batch = label_batch.to(device)

            outputs = model(audio_batch)
            loss = criterion(outputs, label_batch)

            batch_size = audio_batch.size(0)
            running_loss += loss.item() * batch_size
            total_samples += batch_size

            # Sigmoid activation on raw logits for binary prediction threshold (0.5)
            probabilities = torch.sigmoid(outputs)
            predictions = (probabilities >= 0.5).float()
            correct_predictions += (predictions == label_batch).sum().item()

    if total_samples == 0:
        return 0.0, 0.0

    avg_loss = running_loss / total_samples
    accuracy = (correct_predictions / total_samples) * 100.0
    return avg_loss, accuracy


def main() -> None:
    args = parse_args()

    # 1. Validate file paths
    validate_paths(train_csv=args.train_csv, val_csv=args.val_csv, audio_dir=args.audio_dir)

    # 2. Select compute device (Intel XPU > CUDA > MPS > CPU)
    device = get_device()

    # 3. Create datasets and data loaders
    print(f"Loading training dataset from: {args.train_csv}")
    train_dataset = VoiceShieldDataset(csv_file=args.train_csv, audio_dir=args.audio_dir)
    train_loader = DataLoader(
        train_dataset,
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=args.num_workers,
    )

    print(f"Loading validation dataset from: {args.val_csv}")
    val_dataset = VoiceShieldDataset(csv_file=args.val_csv, audio_dir=args.audio_dir)
    val_loader = DataLoader(
        val_dataset,
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=args.num_workers,
    )

    # 4. Instantiate model, loss, and optimizer
    model = CNNBaseline().to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.AdamW(model.parameters(), lr=args.learning_rate)

    print(
        f"\nInitialized CNNBaseline on device [{device}] with "
        f"{sum(p.numel() for p in model.parameters() if p.requires_grad):,} parameters."
    )
    print(f"Training parameters: Epochs={args.epochs}, Batch Size={args.batch_size}, LR={args.learning_rate}\n")

    # Prepare checkpoint directory
    checkpoint_dir = Path(args.checkpoint_dir)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    best_checkpoint_path = checkpoint_dir / "cnn_baseline_best.pt"

    best_val_loss = float("inf")

    # 5. Training loop
    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)

        print(f"Epoch {epoch}/{args.epochs}")
        print(f"  Train Loss: {train_loss:.4f}")
        print(f"  Val Loss:   {val_loss:.4f}")
        print(f"  Val Acc:    {val_acc:.2f}%")

        # Save best model checkpoint based on validation loss
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            checkpoint_data = {
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "train_loss": train_loss,
                "val_loss": val_loss,
                "val_accuracy": val_acc,
                "device": str(device),
            }
            torch.save(checkpoint_data, best_checkpoint_path)
            print(f"  --> Saved new best checkpoint to: {best_checkpoint_path}")

        print("-" * 40)

    print("\nTraining complete!")
    print(f"Best Validation Loss: {best_val_loss:.4f}")
    print(f"Best checkpoint saved at: {best_checkpoint_path.resolve()}")


if __name__ == "__main__":
    main()
