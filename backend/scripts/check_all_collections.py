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
    r = httpx.get(f"{BASE}/collections", headers=headers)
    if r.status_code == 200:
        colls = [c["collection"] for c in r.json()["data"] if not c["collection"].startswith("directus_")]
        print("Collections:", ", ".join(colls))
        
        # Check specific collections
        for c in ["clients", "projects", "audit_history"]:
            if c in colls:
                fr = httpx.get(f"{BASE}/fields/{c}", headers=headers)
                fields = [f["field"] for f in fr.json()["data"]] if fr.status_code == 200 else []
                print(f"  Field {c}:", ", ".join(fields))
            else:
                print(f"  Collection {c} is MISSING")
    else:
        print(f"Error: {r.status_code}")
