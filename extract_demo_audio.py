from datasets import load_dataset
import soundfile as sf
import csv
import os

# Output folders
REAL_DIR = "demo_audio/real"
FAKE_DIR = "demo_audio/fake"

os.makedirs(REAL_DIR, exist_ok=True)
os.makedirs(FAKE_DIR, exist_ok=True)

print("Loading DeepVoice dataset...")

ds = load_dataset(
    "SpeechAntiSpoofingBenchmarks/DeepVoice",
    split="test",
    streaming=True
)

label_names = ds.features["label"].names

real_count = 0
fake_count = 0
metadata = []

print("Searching for 3 REAL + 3 FAKE samples...\n")

for sample in ds:

    label_id = sample["label"]
    label = label_names[label_id]

    # REAL = bonafide
    if label == "bonafide" and real_count < 3:
        real_count += 1

        filename = f"real_{real_count:02d}.wav"
        output_path = os.path.join(REAL_DIR, filename)

        audio = sample["audio"]
        sf.write(
            output_path,
            audio["array"],
            audio["sampling_rate"]
        )

        duration = len(audio["array"]) / audio["sampling_rate"]

        metadata.append([
            filename,
            "REAL",
            "SpeechAntiSpoofingBenchmarks/DeepVoice",
            sample["path"],
            audio["sampling_rate"],
            round(duration, 2)
        ])

        print(f"REAL {real_count}/3 → {filename}")
        print(f"   Source: {sample['path']}")
        print(f"   Duration: {duration:.2f}s")

    # FAKE = spoof
    elif label == "spoof" and fake_count < 3:
        fake_count += 1

        filename = f"fake_{fake_count:02d}.wav"
        output_path = os.path.join(FAKE_DIR, filename)

        audio = sample["audio"]
        sf.write(
            output_path,
            audio["array"],
            audio["sampling_rate"]
        )

        duration = len(audio["array"]) / audio["sampling_rate"]

        metadata.append([
            filename,
            "FAKE",
            "SpeechAntiSpoofingBenchmarks/DeepVoice",
            sample["path"],
            audio["sampling_rate"],
            round(duration, 2)
        ])

        print(f"FAKE {fake_count}/3 → {filename}")
        print(f"   Source: {sample['path']}")
        print(f"   Duration: {duration:.2f}s")

    # Stop once we have all 6
    if real_count == 3 and fake_count == 3:
        break


# Save metadata
with open("demo_audio/metadata.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)

    writer.writerow([
        "filename",
        "actual_label",
        "dataset",
        "source_path",
        "sample_rate",
        "duration_seconds"
    ])

    writer.writerows(metadata)

print("\nExtraction complete.")
print(f"REAL samples: {real_count}/3")
print(f"FAKE samples: {fake_count}/3")
print("Metadata: demo_audio/metadata.csv")