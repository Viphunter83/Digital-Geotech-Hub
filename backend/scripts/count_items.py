import httpx
import json

BASE = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        return None

token = get_token()
if token:
    headers = {"Authorization": f"Bearer {token}"}
    r = httpx.get(f"{BASE}/collections", headers=headers)
    if r.status_code == 200:
        colls = [c["collection"] for c in r.json()["data"] if not c["collection"].startswith("directus_")]
        print(f"{'Collection':<30} | {'Count':<5}")
        print("-" * 38)
        for c in colls:
            try:
                res = httpx.get(f"{BASE}/items/{c}?limit=0&meta=total_count", headers=headers)
                if res.status_code == 200:
                    count = res.json().get("meta", {}).get("total_count", 0)
                    print(f"{c:<30} | {count:<5}")
                else:
                    print(f"{c:<30} | Error {res.status_code}")
            except Exception as e:
                print(f"{c:<30} | Error: {e}")
    else:
        print(f"Failed to fetch collections: {r.status_code}")
