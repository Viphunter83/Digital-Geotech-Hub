#!/usr/bin/env python3
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
if not TOKEN: sys.exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

print("\n🚀 SEEDING PROJECT-MACHINERY LINKS\n")

# Get projects
projects = api("GET", "/items/projects").json().get("data", [])
# Get machinery
machinery = api("GET", "/items/machinery").json().get("data", [])

if projects and machinery:
    # Link first machinery to first project
    p_id = projects[0]["id"]
    m_id = machinery[0]["id"]
    
    # Check if link exists
    check = api("GET", f"/items/projects_machinery?filter[projects_id][_eq]={p_id}&filter[machinery_id][_eq]={m_id}")
    if check.status_code == 200 and check.json().get("data"):
        print(f"  ⏭  Link already exists for Project {p_id}")
    else:
        r = api("POST", "/items/projects_machinery", {
            "projects_id": p_id,
            "machinery_id": m_id
        })
        if r.status_code in (200, 201):
            print(f"  ✅ Linked Machinery {m_id} to Project {p_id}")
        else:
            print(f"  ❌ Failed: {r.status_code} {r.text}")
else:
    print("  ❌ No projects or machinery found to link")

print("\n✅ Done!")
