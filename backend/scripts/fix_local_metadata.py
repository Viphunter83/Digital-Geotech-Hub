import httpx
import sys

BASE = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        return r.json()["data"]["access_token"]
    except: return None

token = get_token()
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def fix_field(collection, field, special_type):
    print(f"🔧 Fixing {collection}.{field}...")
    # 1. Delete if exists
    httpx.delete(f"{BASE}/fields/{collection}/{field}", headers=headers)
    # 2. Re-create as pure alias
    r = httpx.post(f"{BASE}/fields/{collection}", headers=headers, json={
        "field": field,
        "type": "alias",
        "schema": None,
        "meta": {
            "special": [special_type],
            "interface": f"list-{special_type}"
        }
    })
    if r.status_code in (200, 204):
        print(f"  ✅ {field} fixed")
    else:
        print(f"  ❌ Failed to fix {field}: {r.text}")

# Fix projects
fix_field("projects", "machinery_used", "m2m")
# Fix services
fix_field("services", "features", "m2m")

print("Done.")
