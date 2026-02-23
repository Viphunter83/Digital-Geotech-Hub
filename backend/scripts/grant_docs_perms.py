import httpx
import sys

BASE = "https://terra-expert.ru/directus"
ADMIN_EMAIL = "admin@geotech.io"
ADMIN_PASSWORD = "admin-password"
PUBLIC_POLICY_ID = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        return None

token = get_token()
if not token:
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

for coll in ["projects_documents", "projects_photos"]:
    r = httpx.post(f"{BASE}/permissions", headers=headers, json={
        "collection": coll,
        "action": "read",
        "fields": ["*"],
        "policy": PUBLIC_POLICY_ID
    })
    print(f"Granted read to {coll}: {r.status_code}")
