"""
VoiceShield AI/ML Pipeline - CNN Baseline Model.

This module defines the baseline 2D Convolutional Neural Network (CNNBaseline)
for binary audio deepfake detection (real vs. fake audio).

Input Shape:
    [batch_size, 1, 128, 251]
    - 1: Audio channel (spectrogram/Mel-spectrogram)
    - 128: Mel frequency bands
    - 251: Time frames (~2.5 seconds of audio at standard hop length)

Output:
    Single unnormalized logit of shape [batch_size, 1].
    Note: Sigmoid is deliberately excluded here for loss computation using BCEWithLogitsLoss.
"""

import torch
import torch.nn as nn


class CNNBaseline(nn.Module):
    """
    VoiceShield baseline 2D CNN architecture for binary audio deepfake classification.
    """

    def __init__(self) -> None:
        super().__init__()

        # Feature Extractor Block 1
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        self.relu1 = nn.ReLU()
        self.pool1 = nn.MaxPool2d(kernel_size=2)

        # Feature Extractor Block 2
        self.conv2 = nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        self.relu2 = nn.ReLU()
        self.pool2 = nn.MaxPool2d(kernel_size=2)

        # Feature Extractor Block 3
        self.conv3 = nn.Conv2d(in_channels=64, out_channels=128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        self.relu3 = nn.ReLU()

        # Global Pooling and Flattening
        self.global_pool = nn.AdaptiveAvgPool2d((1, 1))
        self.flatten = nn.Flatten()

        # Classifier
        self.fc1 = nn.Linear(in_features=128, out_features=64)
        self.relu_fc = nn.ReLU()
        self.dropout = nn.Dropout(p=0.3)
        self.fc2 = nn.Linear(in_features=64, out_features=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass of CNNBaseline.

        Args:
            x (torch.Tensor): Input tensor of shape [batch_size, 1, 128, 251].

        Returns:
            torch.Tensor: Raw logits of shape [batch_size, 1].
        """
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu1(x)
        x = self.pool1(x)

        x = self.conv2(x)
        x = self.bn2(x)
        x = self.relu2(x)
        x = self.pool2(x)

        x = self.conv3(x)
        x = self.bn3(x)
        x = self.relu3(x)

        x = self.global_pool(x)
        x = self.flatten(x)

        x = self.fc1(x)
        x = self.relu_fc(x)
        x = self.dropout(x)
        x = self.fc2(x)

        return x


if __name__ == "__main__":
    print("VoiceShield CNN Baseline Smoke Test")
    print("-" * 35)

    # Instantiate baseline model
    model = CNNBaseline()
    model.eval()

    # Create dummy input tensor with shape [batch_size=2, channel=1, mel_bands=128, time_frames=251]
    dummy_input = torch.randn(2, 1, 128, 251)

    # Run forward pass
    with torch.no_grad():
        output = model(dummy_input)

    # Calculate total trainable parameters
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

    print(f"Input shape: {list(dummy_input.shape)}")
    print(f"Output shape: {list(output.shape)}")
    print(f"Total trainable parameter count: {trainable_params}")
