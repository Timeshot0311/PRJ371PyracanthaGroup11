import uuid

from sqlalchemy import select, insert, update

from invascanapi.backend.entities.user_roles_table import UserRoles

async def seed_user_roles(db):
    roles = [
        {"Id": uuid.UUID(f'0183C0ED-AA36-48D8-829B-893B9D2ABE86'), "Description": "FARMER"},
        {"Id": uuid.UUID(f'6A5FBA39-E25E-47DF-944F-C776F3D9B8A9'), "Description": "SME"},
        {"Id": uuid.UUID(f'25232844-4158-4F87-963F-B5F68F98826F'), "Description": "ADMIN"},
    ]

    for role in roles:
        try:
            stmt = (select(UserRoles).where(UserRoles.Id == role["Id"]))
            result = await db.execute(stmt)
            existing = result.first()
            print(f"\n\n=======================================================================")
            print(f"query :- {stmt}")
            print(f"new role :- {role}")
            print(f"db role :- {existing}")
            print("Type of existing:", type(existing))
            print(f"=======================================================================\n\n")

            if existing:
                # Update if description has changed
                if existing.Description != role["Description"]:
                    await db.execute(
                        update(UserRoles)
                        .where(UserRoles.Id == role["Id"])
                        .values(Description=role["Description"])
                    )
            else:
                # Insert new status
                await db.execute(insert(UserRoles).values(**role))
        except Exception as e:
            print(f"seed_user_roles error :- {e}")
