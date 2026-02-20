import httpx
import os
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = "https://terra-expert.ru/directus"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = "PeRpWu52*f%X" # Fallback to provided pass if not in env

async def add_fields():
    async with httpx.AsyncClient() as client:
        # 1. Login
        login_res = await client.post(f"{DIRECTUS_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        fields = [
            {"field": "rate_piling", "type": "float", "meta": {"interface": "input-number", "display": "formatted-value", "options": {"suffix": " руб/т"}}},
            {"field": "rate_vibration", "type": "float", "meta": {"interface": "input-number", "display": "formatted-value", "options": {"suffix": " руб/т"}}},
            {"field": "rate_drilling", "type": "float", "meta": {"interface": "input-number", "display": "formatted-value", "options": {"suffix": " руб/м"}}},
            {"field": "rate_extraction", "type": "float", "meta": {"interface": "input-number", "display": "formatted-value", "options": {"suffix": " руб/т"}}},
            {"field": "rate_excavation", "type": "float", "meta": {"interface": "input-number", "display": "formatted-value", "options": {"suffix": " руб/м3"}}},
        ]

        for f in fields:
            print(f"Adding field {f['field']}...")
            res = await client.post(f"{DIRECTUS_URL}/fields/site_settings", json=f, headers=headers)
            if res.status_code == 200:
                print(f"✅ Field {f['field']} added")
            else:
                print(f"❌ Failed to add {f['field']}: {res.text}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(add_fields())
