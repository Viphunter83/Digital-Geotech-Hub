import asyncio
import httpx
import sys
import os
import json

# Add backend directory to path to import settings
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings

async def debug_relations():
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

        # 1. List Collections
        try:
            res = await client.get("/collections")
            if res.status_code == 200:
                cols = res.json()["data"]
                print("Collections:")
                for c in cols:
                    if not c['collection'].startswith('directus_'):
                        print(f" - {c['collection']}")
            else:
                print(f"Failed to get collections: {res.text}")
        except Exception as e:
            print(f"Error getting collections: {e}")

        # 2. List Relations
        try:
            res = await client.get("/relations")
            if res.status_code == 200:
                rels = res.json()["data"]
                print("\nRelations involving machinery:")
                for r in rels:
                    if r['collection'] == 'machinery' or r['related_collection'] == 'machinery':
                         print(f" - {r['collection']}.{r['field']} -> {r['related_collection']}")
            else:
                print(f"Failed to get relations: {res.text}")
        except Exception as e:
             print(f"Error getting relations: {e}")

if __name__ == "__main__":
    asyncio.run(debug_relations())
