import httpx
import json

BASE = "http://localhost:8055"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except: return None

TOKEN = get_token()
if not TOKEN:
    print("Could not login")
else:
    headers = {"Authorization": f"Bearer {TOKEN}"}
    for c in ["clients", "projects", "audit_history"]:
        r = httpx.get(f"{BASE}/items/{c}", headers=headers)
        if r.status_code == 200:
            data = r.json().get("data", [])
            print(f"Collection {c}: {len(data)} items")
            if data:
                print(f"  Sample {c}: {data[0]}")
        else:
            print(f"Error reading {c}: {r.status_code}")
