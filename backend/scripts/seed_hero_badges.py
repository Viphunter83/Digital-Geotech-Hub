#!/usr/bin/env python3
"""
Seed initial badges into hero_badges collection.
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

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

print("\n🚀 SEEDING INITIAL HERO BADGES\n")

# Note: We can't easily upload local files to Directus via simple script without multipart/form-data
# But we can create the items. The images will need to be uploaded manually if they want to replace them.
# For now, I'll create the records with some descriptive names.

badges = [
    {
        "label": "Буровые",
        "href": "/services#drilling",
        "parallax_factor": 0.1,
        "pos_top": "15%",
        "pos_left": "5%",
        "sort": 1
    },
    {
        "label": "Шпунт",
        "href": "/services#catalog",
        "parallax_factor": -0.12,
        "pos_bottom": "20%",
        "pos_right": "8%",
        "sort": 2
    },
    {
        "label": "Спецтехника",
        "href": "/machinery",
        "parallax_factor": 0.08,
        "pos_top": "30%",
        "pos_right": "5%",
        "sort": 3
    }
]

for b in badges:
    r = api("POST", "/items/hero_badges", b)
    if r.status_code in (200, 204):
        print(f"  ✅ Seeded: {b['label']}")
    else:
        print(f"  ❌ Failed: {b['label']} ({r.status_code})")

print("\n✅ Done!")
