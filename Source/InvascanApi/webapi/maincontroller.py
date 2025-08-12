import datetime
import sys
import os


sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import uuid
from webapi.models.IdentifyRequest import IdentifyRequest
from webapi.models.GenericResponse import GenericResponse
from webapi.models.helpers.ImageHelper import ImageHelper
from webapi.services.invascanengineservice import InvascanEngineService
from webapi.data.storagedb import UserRepository
from webapi.entities.UserAccount import UserAccount
from webapi.models.CreateAccount import CreateAccount

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or set specific origins like ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

repo = UserRepository()
engine = InvascanEngineService()

app_directory = os.getcwd()
#images_directory = app_directory + "/data" # "D:/DATA/PRJ371/apidata/images"

#images_directory = "../data/images"
images_directory = f"{app_directory}/webapi/data"


@app.get("/")
def root():
    return {"message": "Hello from FastAPI with HTTPS!"}



#region === USERS APIs ===


@app.post("/users")
def create_account_async(user: CreateAccount):
    result = repo.create_user_account(user)
    return {"message": "Hello from FastAPI with HTTPS!", "result": result}


@app.post("/checkemail")
async def check_email_exists(email: str):
    results = await repo.email_exists_async(email)
    if results:
        return JSONResponse(status_code=400, content="Email already exists")
    else:
        return JSONResponse(status_code=200, content="Email is unique")


#endregion



#region === AI ENGINE APIs ===

@app.post("/identifyasync")
def identifyasync(request: IdentifyRequest):
    try:
        if request.userid == "" or request.imagedata == "":
            return GenericResponse(status = False, statuscode = 400, message = "Invalid request parameters.", img = "", labelname= "", score= 0)
        else:
            fileid = uuid.uuid4()
            print(f"fileid: {fileid}")
            #image_path = f"{default_image_dir}/{request.userid}/{fileid}.jpg"
            image_path = f"{images_directory}/{fileid}.jpg"
            print(f"image path: {image_path}")
            print(f"image path: {image_path}")
            success = ImageHelper.base64_to_image(request.imagedata, image_path)
            if success:
                response = engine.verify(image_path)
                ImageHelper.delete_image(image_path)
                return GenericResponse(status=response.status, statuscode=response.statuscode, message=response.message, img=response.img, labelname= response.labelname, score= response.score)
                #return {response.img}
            else:
                return GenericResponse(status=False, statuscode=204, message="API failed to save image to disk.", img="", labelname= "", score= 0)
    except Exception as e:
        print(e)
        #raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")
        return GenericResponse(status=False, statuscode=400, message=f"Invalid request parameters: {str(e)}.", img="", labelname= "", score= 0)

#endregion