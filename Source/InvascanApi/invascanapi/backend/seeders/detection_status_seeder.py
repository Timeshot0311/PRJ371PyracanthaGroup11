import uuid

from sqlalchemy import select, insert, update

from invascanapi.backend.entities.detection_status_table import DetectionStatus


async def seed_detection_status(db):
    detection_statuses = [
        {"Id": uuid.UUID("8B721BD2-5A32-4F85-B5E4-D0979A5A82AF"), "Description": "PENDING"},
        {"Id": uuid.UUID("AEFA556C-A285-4838-B54C-0CD8A50A3D37"), "Description": "CONFIRMED"},
        {"Id": uuid.UUID("3041ADFC-400B-4FE0-B209-47FE75DEDB0C"), "Description": "REJECTED"},
        {"Id": uuid.UUID("585B6A2E-0A37-45C5-B347-6F2B9860F1CE"), "Description": "VALIDATION"},
    ]

    for status in detection_statuses:
        stmt = (select(DetectionStatus).where(DetectionStatus.Id == status["Id"]))
        result = await db.execute(stmt)
        existing = result.first()
        print(f"\n\n=======================================================================")
        print(f"query :- {stmt}")
        print(f"new status :- {status}")
        print(f"db status :- {existing}")
        print("Type of existing:", type(existing))
        print(f"=======================================================================\n\n")

        if existing:
            # Update if description has changed
            if existing.Description != status["Description"]:
                await db.execute(
                    update(DetectionStatus)
                    .where(DetectionStatus.Id == status["Id"])
                    .values(Description=status["Description"])
                )
        else:
            # Insert new status
            await db.execute(insert(DetectionStatus).values(**status))