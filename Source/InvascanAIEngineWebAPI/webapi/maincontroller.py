import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import uuid
from webapi.models.IdentifyRequest import IdentifyRequest
from webapi.models.GenericResponse import GenericResponse
from webapi.models.helpers.ImageHelper import ImageHelper
from webapi.services.AIEngineService import AIEngineService

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app_directory = os.getcwd()
#images_directory = app_directory + "/data" # "D:/DATA/PRJ371/apidata/images"

#images_directory = "../data/images"
images_directory = f"{app_directory}/webapi/data"

@app.get("/")
def root():
    return {"message": "Hello from FastAPI with HTTPS!"}


@app.post("/identifyasync")
def identifyasync(request: IdentifyRequest):
    try:
        if request.userid == "" or request.imagedata == "":
            return GenericResponse(status = False, statuscode = 400, message = "Invalid request parameters.", img = "")
        else:
            fileid = uuid.uuid4()
            print(f"fileid: {fileid}")
            #image_path = f"{default_image_dir}/{request.userid}/{fileid}.jpg"
            image_path = f"{images_directory}/{fileid}.jpg"
            print(f"image path: {image_path}")
            print(f"image path: {image_path}")
            success = ImageHelper.base64_to_image(request.imagedata, image_path)
            if success:
                response = AIEngineService.verify(image_path)
                ImageHelper.delete_image(image_path)
                return GenericResponse(status=response.status, statuscode=response.statuscode, message=response.message, img=response.img)
                #return {response.img}
            else:
                return GenericResponse(status=False, statuscode=204, message="API failed to save image to disk.", img="")
    except Exception as e:
        print(e)
        #raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        return GenericResponse(status=False, statuscode=400, message=f"Invalid request parameters: {str(e)}.", img="")