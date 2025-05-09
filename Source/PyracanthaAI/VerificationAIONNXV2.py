import onnxruntime as ort
import numpy as np
import cv2
import os

# Config
onnx_model_path = "runs/detect/train5/weights/best.onnx"
image_path = "D:/DATA/PRJ371/testdata/Pyracantha_angustifolia_1.jpg"
output_path = "D:/DATA/PRJ371/testdata/Pyracantha_angustifolia_1_output.jpg"
input_size = 416
conf_threshold = 0.3
iou_threshold = 0.45
class_names = ['Pyracantha angustifolia']  # Replace with your actual class names

# Preprocess image
image = cv2.imread(image_path)
original_image = image.copy()
img = cv2.resize(image, (input_size, input_size))
img = img.transpose(2, 0, 1)  # HWC to CHW
img = np.expand_dims(img, axis=0).astype(np.float32) / 255.0  # Normalize

# Load ONNX model
session = ort.InferenceSession(onnx_model_path, providers=["CPUExecutionProvider"])
outputs = session.run(None, {"images": img})  # "images" is YOLOv8's input name

# Post-processing
preds = outputs[0][0]  # shape: (num_detections, 6) — x1, y1, x2, y2, conf, class

def nms(boxes, scores, iou_threshold):
    indices = cv2.dnn.NMSBoxes(
        bboxes=boxes,
        scores=scores,
        score_threshold=conf_threshold,
        nms_threshold=iou_threshold
    )
    return indices.flatten() if len(indices) else []

boxes = []
confidences = []
class_ids = []

for det in preds:
    x1, y1, x2, y2 = det[:4]
    objectness = det[4]
    class_scores = det[5:]
    print("Sample prediction:", det)

    class_id = np.argmax(class_scores)
    class_conf = class_scores[class_id]
    conf = objectness * class_conf
    if conf < conf_threshold:
        continue
    boxes.append([int(x1), int(y1), int(x2 - x1), int(y2 - y1)])
    confidences.append(float(conf))
    class_ids.append(int(class_id))

indices = nms(boxes, confidences, iou_threshold)

# Draw boxes
for i in indices:
    x, y, w, h = boxes[i]

    class_id = class_ids[i]
    conf = confidences[i]

    # Fallback for unexpected class_id
    if class_id >= len(class_names):
        class_name = f"class_{class_id}"
    else:
        class_name = class_names[class_id]

    label = f"{class_name} {conf:.2f}"
    #label = f"{class_names[class_ids[i]]} {confidences[i]:.2f}"
    cv2.rectangle(original_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.putText(original_image, label, (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

# Save result
cv2.imwrite(output_path, original_image)
print(f"✅ Output saved to: {output_path}")
