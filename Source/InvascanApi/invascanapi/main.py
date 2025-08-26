import uvicorn
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from invascanapi.lifespan_handler import lifespan
from invascanapi.routers.user_router import router as user_router
from invascanapi.routers.engine_router import router as engine_router
from invascanapi.routers.version_router import router as version_router

app = FastAPI(
    lifespan=lifespan,
    title = "Invascan AI Engine API",
    description = "API for user registration, plant detection, and system interaction in the Invascan project.",
    version = "1.0.0",
    contact = {
        "name": "Invascan",
        "email": "invascan@gmail.com",
        "url": "https://www.invascan.com",
    },
    license_info = {
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url = "/docs",             # Swagger UI
    redoc_url = "/redoc",           # ReDoc UI
    openapi_url = "/openapi.json"   # OpenAPI spec path
)

# Allow everything 🚨 (use only for dev!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_methods=["*"],  # allow GET, POST, PUT, DELETE
    allow_headers=["*"],  # allow all headers
)

#
# @app.on_event("startup")
# async def on_startup():
#     async with engine.begin() as conn:
#         print(f'running {conn.info}')
#         await conn.run_sync(Base.metadata.create_all)
#         await seed_detection_status(conn)
#         await seed_roles(conn)
#         await seed_account_status(conn)
#         await seed_user_account(conn)



app.mount("/images", StaticFiles(directory="invascanapi/domain/images"), name="images")

app.include_router(user_router)

app.include_router(engine_router)

app.include_router(version_router)


# if __name__ == "__main__":
#     uvicorn.run("invascanapi.main:app", host="0.0.0.0", port=8086, reload=True)