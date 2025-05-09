import subprocess
from ultralytics import YOLO
import torch
import cv2
import base64
from io import BytesIO
from PIL import Image
import numpy as np

imagesize = 640
confidence_threshold = 0.5
try:
    print("PyTorch version:", torch.__version__)
    print("CUDA available:", torch.cuda.is_available())
    print("GPU name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU")

    subprocess.check_output('nvidia-smi')
    print('Nvidia GPU detected!')

    # Load the trained model
    model = YOLO("runs/detect/train/weights/best.pt")
    print('model loaded!')

    # Define path to the image file
    source = "D:/DATA/PRJ371/testdata/PyracanthaImg.jpg"
    sourcesave = "D:/DATA/PRJ371/testdata/results/PyracanthaImg.jpg"
    sourcesaveencoded = "D:/DATA/PRJ371/testdata/results/PyracanthaImgEncoded.txt"
    sourceperson = "D:/DATA/PRJ371/testdata/plantQ2.jpg"
    sourcepersonsave = "D:/DATA/PRJ371/testdata/results/plantQ2.jpg"

    # Run inference on the source
    results = model(source)  # list of Results objects
    # Process results list
    for result in results:
        boxes = result.boxes  # Boxes object for bounding box outputs
        masks = result.masks  # Masks object for segmentation masks outputs
        keypoints = result.keypoints  # Keypoints object for pose outputs
        probs = result.probs  # Probs object for classification outputs
        obb = result.obb  # Oriented boxes object for OBB outputs
        result.show()  # display to screen
        result.save(filename=sourcesave)  # save to disk

    modelResult = results[0]
    # Render detection result (returns list of BGR numpy arrays)
    result_image = modelResult.plot()  # This includes bounding boxes, labels, etc.

    # Convert to RGB (for PIL compatibility)
    rgb_image = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)

    # Convert to PIL Image
    pil_img = Image.fromarray(rgb_image)

    # Save to buffer in memory as JPEG
    buffered = BytesIO()
    pil_img.save(buffered, format="JPEG")

    # Encode to base64
    img_base64 = base64.b64encode(buffered.getvalue())#.decode("utf-8")

    # Save to file
    with open(sourcesaveencoded, "wb") as f:
        f.write(img_base64)


    print('model detection done 1')

    model.predict(source, save=True, imgsz=imagesize, conf=confidence_threshold)
    print('model predict done 1')

    # Run inference on the source
    resultsperson = model(sourceperson)  # list of Results objects
    # Process results list
    for result in resultsperson:
        boxes = result.boxes  # Boxes object for bounding box outputs
        masks = result.masks  # Masks object for segmentation masks outputs
        keypoints = result.keypoints  # Keypoints object for pose outputs
        probs = result.probs  # Probs object for classification outputs
        obb = result.obb  # Oriented boxes object for OBB outputs
        result.show()  # display to screen
        result.save(filename=sourcepersonsave)  # save to disk

    print('model detection done 2')

    model.predict(sourceperson, save=True, imgsz=imagesize, conf=confidence_threshold)
    print('model predict done 2')

except Exception:  # this command not being found can raise quite a few different errors depending on the configuration
    print('No Nvidia GPU in system!')
