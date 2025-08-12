import logging
import sys
import os

from invascanapi.backend.repositories.engine_repository import EngineRepository
from invascanapi.domain.models.detection_response import DetectionResponse
from invascanapi.domain.models.responses.generic_backend_response import GenericBackendResponse

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

import base64
import subprocess
from io import BytesIO

import cv2
import torch
from PIL import Image
from ultralytics import YOLO

class InvascanEngine:
    def __init__(self, engine_repository: EngineRepository):
        #self.base_dir = os.path.dirname(os.path.dirname(__file__))
        self.engine_repository = engine_repository
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_location = os.path.join(self.base_dir, "models", "machinelearning", "best.pt")
        #self.model_location = f"{os.getcwd()}/invascanapi/domain/best.pt"
        self.default_image_size = 640
        self.confidence_threshold_low = 0.5
        self.confidence_threshold_medium = 0.6
        self.confidence_threshold_high = 0.7
        self.model = YOLO(self.model_location)
        logging.info(f"Pyracantha version: {self.model}")
        self.model_classes = self.model.names


    def detect_gpu(self):
        try:
            print("PyTorch version:", torch.__version__)
            print("CUDA available:", torch.cuda.is_available())
            print("GPU name:", torch.cuda.get_device_name(0) if torch.cuda.is_available() else "No GPU")
            subprocess.check_output('nvidia-smi')
            print('Nvidia GPU detected!')
        except Exception as e:
            print(f'No Nvidia GPU in system! :- {e}')
        return



    # response codes:
    #   2000 => success or accurate detection
    #   2001 => score below lowest thresh_hold
    #   2002 => score below highest thresh_hold requiring manual verification
    #   2003 => no detections
    #   2004 => internal error or exception
    def identify_pyracantha(self, image_path:str) -> GenericBackendResponse[DetectionResponse]:
        response = DetectionResponse()
        try:
            logging.info(f"Pyracantha version: {torch.__version__}")

            # Run inference on the source
            predict_result = self.model.predict(image_path, save=False, imgsz=self.default_image_size, conf=self.confidence_threshold_low)[0]

            # Render a detection result (returns list of BGR numpy arrays). This includes bounding boxes, labels, etc.
            predict_result_list = predict_result.plot()

            # Convert to RGB (for PIL compatibility)
            predict_result_image = cv2.cvtColor(predict_result_list, cv2.COLOR_BGR2RGB)

            # Convert to PIL Image
            predict_result_image_pil = Image.fromarray(predict_result_image)

            # Save to buffer in memory as JPEG
            image_buffer_as_jpeg = BytesIO()
            predict_result_image_pil.save(image_buffer_as_jpeg, format="JPEG")

            # Convert the Jpeg bytes to bytearray
            jpeg_bytearray = bytearray(image_buffer_as_jpeg.getvalue())

            # Extract class names with confidence scores
            detections = []

            for box in predict_result.boxes:
                class_id = int(box.cls[0])
                class_name = self.model_classes[class_id]
                confidence = float(box.conf[0])
                detections.append({
                    "label": class_name,
                    "confidence": round(confidence, 2)  # Rounded for readability
                })

            # Print results
            for det in detections:
                print(f"{det['label']}: {det['confidence']}")

            # Encode to base64
            image_as_base64 = base64.b64encode(jpeg_bytearray).decode("utf-8")
            # image_as_base64 = base64.b64encode(image_buffer_as_jpeg.getvalue()).decode("utf-8")
            # jpeg_image_as_base64 = base64.b64encode(jpeg_bytearray).decode("utf-8")

            if detections:
                first_position_detection = detections[0]
                confidence_score = float(first_position_detection['confidence'])
                if confidence_score < self.confidence_threshold_low:
                    print('false detection')
                    response.confidenceScore = confidence_score
                    response.speciesName = first_position_detection['label']
                    response.imageData = image_as_base64
                    # return {"data": response, "message": "no detection"}
                    return GenericBackendResponse(success=True, code = 2001, message="no detection", data= response)

                elif (confidence_score > self.confidence_threshold_low) and (confidence_score < self.confidence_threshold_medium):
                    response.confidenceScore = confidence_score
                    response.speciesName = first_position_detection['label']
                    response.imageData = image_as_base64
                    print('detection requires manual verification, must be recorded into the database')
                    # return {"data": response, "message": "detection requires manual verification"}
                    return GenericBackendResponse(success=True, code = 2002, message="detection requires manual verification", data=response)

                elif confidence_score >= self.confidence_threshold_high:
                    response.confidenceScore = confidence_score
                    response.speciesName = first_position_detection['label']
                    response.imageData = image_as_base64
                    print('detection acceptable and user is notified immediately')
                    return GenericBackendResponse(success=True, code = 2000, message="success", data=response)
                    # return {"data": response, "message": "success"}

                else:
                    print('Unknown internal engine error.')
                    return GenericBackendResponse(success=False, code = 2004, message="Unknown internal engine error", data=None)
                    # return {"data": None, "message": "Unknown internal engine error"}
            else:
                print('no detections found')
                return GenericBackendResponse(success=False, code = 2003, message="no detections found", data=None)
                # return {"data": None, "message": "no detections found"}
        except Exception as e:
            print(e)
            return GenericBackendResponse(success=True, code = 2005, message="error :- {e}", data=None)
            # return {"data": None, "message": f"error :- {e}"}