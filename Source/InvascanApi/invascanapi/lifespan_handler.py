from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from starlette.datastructures import State

from invascanapi.backend.entities import detection_status_table, user_roles_table
from invascanapi.backend.entities import users_table, user_details_table
from invascanapi.backend.entities import detections_table, geo_data_table, images_table, validations_table, user_feedback_table, user_feedback_comment_table
from invascanapi.backend.entities.base import Base
from invascanapi.backend.repositories.data_sync_repository import DataSyncRepository
from invascanapi.backend.scripts.insert_detections_stored_procedure import create_stored_procedure

from invascanapi.backend.scripts.insert_geodata_stored_procedure import insert_geodata_stored_procedure
from invascanapi.backend.scripts.insert_images_stored_procedure import insert_images_stored_procedure
from invascanapi.backend.seeders.detection_status_seeder import seed_detection_status
from invascanapi.backend.seeders.user_roles_seeder import seed_user_roles
from invascanapi.backend.seeders.users_seeder import seed_admin_user, seed_admin_user_details
from invascanapi.backend.database import engine, create_database_if_not_exists, AsyncSessionLocal
from invascanapi.domain.services.data_sync_service import DataSyncService

scheduler: BackgroundScheduler | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # let the type checker know FastAPI has .state
    app.state: State

    create_database_if_not_exists()
    global scheduler

    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await seed_detection_status(conn)
        await seed_user_roles(conn)
        await seed_admin_user(conn)
        await seed_admin_user_details(conn)
        await create_stored_procedure(conn)
        await insert_images_stored_procedure(conn)
        await insert_geodata_stored_procedure(conn)

    sync_service = DataSyncService(DataSyncRepository(AsyncSessionLocal))
    scheduler = sync_service.start_scheduler()

    # attach scheduler to state
    app.state.scheduler = scheduler

    yield

    # Shutdown (if needed)
    if scheduler:
        scheduler.shutdown(wait=False)
        print("🛑 APScheduler stopped")


    # await something_cleanup()
