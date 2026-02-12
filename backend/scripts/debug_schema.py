import asyncio
import httpx
import sys
import os
import json

# Add backend directory to path to import settings
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings

async def debug_schema():
    print(f"Connecting to Directus at {settings.DIRECTUS_URL}...")
    
    async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL) as client:
        # Authenticate
        try:
             auth_res = await client.post("/auth/login", json={
                 "email": settings.ADMIN_EMAIL,
                 "password": settings.ADMIN_PASSWORD
             })
             if auth_res.status_code != 200:
                 print(f"Login failed: {auth_res.text}")
                 return
             
             token = auth_res.json()["data"]["access_token"]
             client.headers["Authorization"] = f"Bearer {token}"
        except Exception as e:
            print(f"Auth error: {e}")
            return

        # Inspect Machinery Fields
        try:
            res = await client.get("/fields/machinery")
            if res.status_code == 200:
                fields = res.json()["data"]
                print("Machinery Fields:")
                for f in fields:
                    print(f" - {f['field']} ({f['type']})")
                    if f['field'] == 'category':
                        print(f"   Details: {json.dumps(f)}")
            else:
                print(f"Failed to get fields: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_schema())
