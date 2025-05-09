import onnxruntime as ort
import numpy as np
import cv2
import os


# Load ONNX model
session = ort.InferenceSession("runs/detect/train5/weights/best.onnx", providers=["CPUExecutionProvider"])

# Load and preprocess image
image_path = "D:/DATA/PRJ371/testdata/Pyracantha_angustifolia_1.jpg"
image = cv2.imread(image_path)
img_resized = cv2.resize(image, (416, 416))  # match training size
img_input = img_resized.transpose(2, 0, 1) / 255.0  # CHW and normalize
img_input = np.expand_dims(img_input, axis=0).astype(np.float32)


# Run inference
outputs = session.run(None, {"images": img_input})  # 'images' is input name used by YOLOv8

# Output will be an array of detections
print("✅ Inference output shape:", outputs[0].shape)
print(outputs[0])
