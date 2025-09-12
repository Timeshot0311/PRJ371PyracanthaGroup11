import uuid
from datetime import datetime, timezone, time, timedelta

from apscheduler.triggers.cron import CronTrigger
import asyncio

from sqlalchemy.testing.util import total_size

from invascanapi.backend.repositories.data_sync_repository import DataSyncRepository
from invascanapi.backend.utilz.datetime_extensions import gmt2_now

# --- Import your Pyracantha downloader ---
from invascanapi.domain.services.pyracantha_task import download_pyracantha_detections
from invascanapi.domain.utils.maps_utilz import get_province


class DataSyncService:
    def __init__(self, repository: DataSyncRepository):
        self.container = "DataSyncService"
        self.schedule_name = "DATASYNC_DAILY_SCHEDULE"
        self.schedule_hour = 20
        self.schedule_minutes = 0
        self.schedule_seconds = 0
        self.repository = repository
        self.scheduler = None


    async def pyracantha_job(self):
        """Job that downloads Pyracantha detections and saves them to a JSON file."""
        print(f"[{datetime.now()}] Running Pyracantha download task...")
        try:
            results = download_pyracantha_detections(per_page=50, place_id=6986)
            if results:
                results_size = len(results)
                print(f"found {results_size} detections...saving to database")
                results_counter = 1
                for detection_result in results:
                    status_id = uuid.UUID("AEFA556C-A285-4838-B54C-0CD8A50A3D37")
                    user_id = uuid.UUID("E17258B9-4287-45EE-8CC5-68752AC607E3")
                    time_observed_raw = detection_result.get("time_observed")
                    if time_observed_raw is not None and isinstance(time_observed_raw, str) and time_observed_raw.strip():
                        time_observed = datetime.fromisoformat(time_observed_raw)
                    elif time_observed_raw is not None and isinstance(time_observed_raw, datetime):
                        time_observed = time_observed_raw
                    else:
                        time_observed = datetime.now(timezone(timedelta(hours=2)))

                    # time_observed = (
                    #     datetime.fromisoformat(detection_result["time_observed"])
                    #     if "time_observed" in detection_result
                    #     else gmt2_now
                    # )
                    province = "Unallocated"
                    if detection_result["latitude"] != 0.0 and detection_result["longitude"] != 0.0:
                        province = await get_province(latitude=detection_result["latitude"], longitude=detection_result["longitude"])
                    detections = {
                        "id": detection_result["uuid"],
                        "speciesName": detection_result["species_guess"],
                        "commonName": detection_result["species"],
                        "confidenceScore": 9.0,
                        "dataSource": "Inaturalist",
                        "userId": user_id,
                        "statusId": status_id,
                        "nativeRegion": province,
                        "detectedAt": time_observed
                    }

                    response = await self.repository.generic_import_process(stored_proc_name="dbo.sp_invascan_add_detections", parameters=detections)
                    if response.success:
                        locations = {
                            "detectionId": detection_result["uuid"],
                            "latitude": detection_result["latitude"],
                            "longitude": detection_result["longitude"],
                            "province": province,
                            "placename": detection_result["place_guess"],
                            "createdAt": time_observed,
                        }
                        response = await self.repository.generic_import_process(stored_proc_name="dbo.sp_invascan_add_geodata",
                                                                     parameters=locations)

                        photos = detection_result.get("photos",[])
                        if photos:
                            for photo in photos:
                                images = {
                                    "detectionId": detection_result["uuid"],
                                    "imageUrl": photo,
                                    "imageData": None,
                                }
                                response = await self.repository.generic_import_process(
                                    stored_proc_name="dbo.sp_invascan_add_images",
                                    parameters=images)

                    print(f"\n============================================")
                    print(f"processing {results_counter}/{results_size}")
                    print(f"============================================\n")
                    results_counter += 1

        except Exception as e:
            print(f"❌ Error in data sync job: {e}")


    def start_scheduler(self):
        from apscheduler.schedulers.asyncio import AsyncIOScheduler

        scheduler = AsyncIOScheduler()
        self.scheduler = scheduler

        # Schedule the daily 10PM job
        schedule_trigger = CronTrigger(hour=self.schedule_hour, minute=self.schedule_minutes, second=0,
                                       timezone=timezone(timedelta(hours=2)))
        scheduler.add_job(
            self.pyracantha_job,
            trigger=schedule_trigger,
            id=self.schedule_name,
            name="INaturalist Data Sync Job",
            max_instances=1,
            coalesce=True  # merge missed runs
        )
        # scheduler.add_job(self.pyracantha_job, "cron", hour=5, minute=0)

        # --- Determine if we should run immediately ---
        now = datetime.now(timezone(timedelta(hours=2)))  # local GMT+2
        scheduled_time = time(hour=self.schedule_hour, minute=self.schedule_minutes, second=0)

        # if now.time() > scheduled_time:
        #     scheduler.add_job(
        #         self.pyracantha_job,
        #         trigger="date",
        #         id="DATASYNC_ONETIME_SCHEDULE",
        #         name="One time schedule",
        #         run_date=datetime.now() + timedelta(seconds=1))

        scheduler.start()
        print(f"⏳ APScheduler started (job runs daily at {self.schedule_hour:02}:{self.schedule_minutes:02}:{self.schedule_seconds:02})")
        return scheduler