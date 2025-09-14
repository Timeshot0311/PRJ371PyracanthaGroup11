import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import base64
import subprocess
from io import BytesIO

import cv2
import torch
from PIL import Image
from ultralytics import YOLO
from webapi.models.GenericResponse import GenericResponse


class AIEngineService:


    def detectGPU(self):
        try:
            print("PyTorch version:", torch.__version__)
            print("CUDA available:", torch.cuda.is_available())
            print("GPU name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU")
            subprocess.check_output('nvidia-smi')
            print('Nvidia GPU detected!')
        except Exception:
            print('No Nvidia GPU in system!')
        return



    def verify(image_path:str):
        #from webapi.models.GenericResponse import GenericResponse
        response = GenericResponse
        defaultImageSize = 640
        confidenceThreshold = 0.5
        model_path = f"{os.getcwd()}/webapi/tools/yolov8nmodel_7.pt"
        print(f"yolo model path: {model_path}")
        #model_location = os.getcwd() + '/tools/yolomodel.pt' #"D:/DATA/PRJ371/apidata/trainedmodel/best.pt"
        model_location = model_path #"../tools/yolomodel.pt"
        try:
            model = YOLO(model_location)
            print('model loaded!')

            # Get class name mapping
            class_names = model.names

            # Run inference on the source
            #model_result = model(image_path)[0]  # list of Results objects
            model_result = model.predict(image_path, save=False, imgsz=defaultImageSize, conf=confidenceThreshold)[0]

            # Render detection result (returns list of BGR numpy arrays)
            result_image = model_result.plot()  # This includes bounding boxes, labels, etc.

            # Convert to RGB (for PIL compatibility)
            rgb_image = cv2.cvtColor(result_image, cv2.COLOR_BGR2RGB)

            # Convert to PIL Image
            pil_img = Image.fromarray(rgb_image)

            # Save to buffer in memory as JPEG
            buffered = BytesIO()
            pil_img.save(buffered, format="JPEG")

            # Extract class names with confidence scores
            detections = []
            for box in model_result.boxes:
                class_id = int(box.cls[0])
                class_name = class_names[class_id]
                confidence = float(box.conf[0])
                detections.append({
                    "label": class_name,
                    "confidence": round(confidence, 4)  # Rounded for readability
                })

            # Print results
            for det in detections:
                print(f"{det['label']}: {det['confidence']}")

            if detections:
                first = detections[0]
                label = first['label']
                score = first['confidence']
                response.labelname = first['label']
                response.score = round(float(first['confidence']),2)

                print(f"Label: {label}")
                print(f"Score: {score}")
            else:
                print("No detections found.")
                response.labelname = ""
                response.score = 0

            # Encode to base64
            base64_encoded_image = base64.b64encode(buffered.getvalue()).decode("utf-8")
            response.status = True
            response.statuscode = 200
            response.img = base64_encoded_image
            response.message = "Successfully processed image."
            return GenericResponse(status=response.status, statuscode=response.statuscode, message=response.message, img=response.img, labelname= response.labelname, score= response.score)

        except Exception as ex:
            print('No Nvidia GPU in system!')
            response.status = False
            response.statuscode = 500
            response.img = ""
            response.message = f"AI Engine failed to run inference on the image: {str(ex)}"
            return GenericResponse(status=response.status, statuscode=response.statuscode, message=response.message, img=response.img)

