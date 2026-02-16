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
if not TOKEN:
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

print("\n🚀 LINKING PROJECTS TO MACHINERY (M2M)\n")

# 1. Create Junction Collection
r = api("POST", "/collections", {
    "collection": "projects_machinery",
    "meta": {
        "hidden": True,
        "icon": "import_export",
        "note": "Связующая таблица для Проектов и Техники"
    },
    "schema": {}
})

if r.status_code == 200:
    print("  ✅ Junction Collection Created")
else:
    print(f"  ⏭  Junction stats: {r.status_code}")

# 2. Add Fields to Junction
api("POST", "/fields/projects_machinery", {"field": "id", "type": "integer", "schema": {"has_auto_increment": True}})
api("POST", "/fields/projects_machinery", {"field": "projects_id", "type": "integer"})
api("POST", "/fields/projects_machinery", {"field": "machinery_id", "type": "integer"})

# 3. Add M2M Field to Projects
r_m2m = api("POST", "/fields/projects", {
    "field": "machinery_used",
    "type": "alias",
    "meta": {
        "interface": "list-m2m",
        "options": {
            "template": "{{machinery_id.name}}"
        },
        "display": "related-values",
        "display_options": {
            "template": "{{machinery_id.name}}"
        },
        "width": "full"
    }
})
if r_m2m.status_code in (200, 201):
    print("  ✅ Field 'machinery_used' added to Projects")
else:
    print(f"  ❌ Failed to add field to Projects: {r_m2m.status_code} {r_m2m.text}")

# 4. Create Relations
# Relation 1: Junction -> Projects
api("POST", "/relations", {
    "collection": "projects_machinery",
    "field": "projects_id",
    "related_collection": "projects",
    "meta": {
        "one_field": "machinery_used",
        "junction_field": "machinery_id"
    }
})

# Relation 2: Junction -> Machinery
api("POST", "/relations", {
    "collection": "projects_machinery",
    "field": "machinery_id",
    "related_collection": "machinery",
    "meta": {
        "one_field": None
    }
})

print("\n✅ M2M Relationship established!")
