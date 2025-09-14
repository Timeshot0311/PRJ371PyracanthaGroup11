from fastapi import APIRouter, Request

from invascanapi.domain.models.version import version_info, ProjectVersion
from invascanapi.lifespan_handler import scheduler

router = APIRouter(prefix="/api/system", tags=["System"])

@router.get("/version", response_model=ProjectVersion, tags=["System"])
async def get_version():
    return version_info


@router.get("/schedules", summary="All available schedules")
async def get_all_schedules(request: Request):
    scheduler = request.app.state.scheduler
    jobs_info = []
    for job in scheduler.get_jobs():
        jobs_info.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger),
            "paused": job.next_run_time is None
        })

    return {"jobs": jobs_info}


@router.post("/{job_id}/pause", summary="Pause active or running schedules")
async def pause_schedule(job_id: str, request: Request):
    scheduler = request.app.state.scheduler
    scheduler.pause_job(job_id)
    return {"message": f"Job {job_id} paused"}


@router.post("/{job_id}/resume", summary="Start paused schedule")
async def resume_schedule(job_id: str, request: Request):
    scheduler = request.app.state.scheduler
    scheduler.resume_job(job_id)
    return {"message": f"Job {job_id} resumed"}


@router.delete("/{job_id}", summary="delete schedule")
async def delete_schedule(job_id: str, request: Request):
    scheduler = request.app.state.scheduler
    scheduler.remove_job(job_id)
    return {"message": f"Job {job_id} deleted"}