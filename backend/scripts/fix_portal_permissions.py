#!/usr/bin/env python3
"""
Fix Client Portal permissions in Directus.
- Grant public read to project evidence (photos/docs) via directus_files
- Ensure projects are readable
"""
import httpx
import sys

BASE = "http://localhost:8055"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"❌ Failed to login: {e}")
        return None

TOKEN = get_token()
if not TOKEN:
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
PUBLIC_POLICY = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

print("\n🚀 FIXING CLIENT PORTAL PERMISSIONS\n")

# Collections needing public/authenticated read for the dashboard to work
# Note: Since the backend proxy adds an extra layer of security, 
# we can grant read permissions to specific collections used by the dashboard.
colls = ["projects", "audit_history", "projects_machinery", "machinery"]

for coll in colls:
    # Check if permission exists
    check = api("GET", f"/permissions?filter[collection][_eq]={coll}&filter[policy][_eq]={PUBLIC_POLICY}&filter[action][_eq]=read")
    if check.status_code == 200 and check.json().get("data"):
        print(f"  ⏭  {coll}: Permission already exists")
    else:
        r = api("POST", "/permissions", {
            "collection": coll,
            "action": "read",
            "fields": ["*"],
            "policy": PUBLIC_POLICY
        })
        if r.status_code in (200, 201, 204):
            print(f"  ✅ {coll}: Granted read access")
        else:
            print(f"  ❌ {coll}: Failed ({r.status_code})")

# Special case for directus_files: dashboard needs to see project photos and download docs
check_files = api("GET", f"/permissions?filter[collection][_eq]=directus_files&filter[policy][_eq]={PUBLIC_POLICY}&filter[action][_eq]=read")
if check_files.status_code == 200 and check_files.json().get("data"):
    print(f"  ⏭  directus_files: Permission already exists")
else:
    r = api("POST", "/permissions", {
        "collection": "directus_files",
        "action": "read",
        "fields": ["*"],
        "policy": PUBLIC_POLICY
    })
    if r.status_code in (200, 201, 204):
        print(f"  ✅ directus_files: Granted read access")
    else:
        print(f"  ❌ directus_files: Failed ({r.status_code})")

print("\n✅ Done!")
