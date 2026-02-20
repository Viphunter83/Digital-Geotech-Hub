import asyncio
import httpx
import sys
import os

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://155.212.209.113:8055")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@geotech.io")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin-password")

async def fix_fields():
    print(f"Connecting to Directus at {DIRECTUS_URL}...")
    
    async with httpx.AsyncClient(base_url=DIRECTUS_URL, timeout=30.0) as client:
        # Authenticate
        try:
             auth_res = await client.post("/auth/login", json={
                 "email": ADMIN_EMAIL,
                 "password": ADMIN_PASSWORD
             })
             if auth_res.status_code != 200:
                 print(f"Login failed: {auth_res.text}")
                 return
             
             token = auth_res.json()["data"]["access_token"]
             client.headers["Authorization"] = f"Bearer {token}"
             print("✅ Authenticated")
        except Exception as e:
            print(f"Auth error: {e}")
            return

        async def create_field(collection, field_data):
            field_name = field_data['field']
            print(f"  Creating field {collection}.{field_name}...")
            try:
                # Check if exists
                res = await client.get(f"/fields/{collection}/{field_name}")
                if res.status_code == 200:
                    print(f"    ✅ Field already exists")
                    return
                
                # Create
                res = await client.post(f"/fields/{collection}", json=field_data)
                if res.status_code in [200, 201]:
                    print(f"    ✅ Created successfully")
                else:
                    print(f"    ❌ Error: {res.text}")
            except Exception as e:
                print(f"    ❌ Exception: {e}")

        # 1. Site Settings Fields
        print("\nFixing site_settings schema...")
        await create_field("site_settings", {
            "field": "meta_title",
            "type": "string",
            "meta": { "interface": "input", "width": "full", "note": "SEO Заголовок" }
        })
        await create_field("site_settings", {
            "field": "meta_description",
            "type": "text",
            "meta": { "interface": "textarea", "width": "full", "note": "SEO Описание" }
        })

        # 2. About Page Fields
        print("\nFixing about_page schema...")
        await create_field("about_page", {
            "field": "mission_title",
            "type": "string",
            "meta": { "interface": "input", "width": "full" }
        })
        await create_field("about_page", {
            "field": "mission_text",
            "type": "text",
            "meta": { "interface": "input-rich-text-html", "width": "full" }
        })
        await create_field("about_page", {
            "field": "history_text",
            "type": "text",
            "meta": { "interface": "textarea", "width": "full" }
        })

    print("\n✅ SCHEMA FIX COMPLETE!")

if __name__ == "__main__":
    asyncio.run(fix_fields())
