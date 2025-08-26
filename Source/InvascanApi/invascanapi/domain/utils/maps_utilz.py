import aiohttp
import asyncio


async def get_province(latitude, longitude):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?lat={latitude}&lon={longitude}&format=json&addressdetails=1"
        headers = {"User-Agent": "geoapi-invascan"}  # Required by Nominatim
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers, timeout=5) as resp:
                response = await resp.json()

        address = response.get("address", {})
        province = address.get("state")

        print(f"\n\n=======================================================================")
        print(f"get_province")
        print(f"response \t:\t {response}")
        print(f"address \t:\t {address}")
        print(f"state \t:\t {province}")
        print(f"=======================================================================\n\n")

        return province if province else "Unallocated"
    except Exception as e:
        print(f"\n\n=======================================================================")
        print(f"get_province error :- {e}")
        print(f"=======================================================================\n\n")
        return "Unallocated"
