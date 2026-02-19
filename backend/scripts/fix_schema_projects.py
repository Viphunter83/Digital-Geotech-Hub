import httpx
import sys

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
if not token:
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 1. Delete the ghost field 'used_machinery' from 'projects'
print("Removing ghost field 'used_machinery' from 'projects'...")
r = httpx.delete(f"{BASE}/fields/projects/used_machinery", headers=headers)
if r.status_code in (200, 204):
    print("✅ Deleted used_machinery field")
else:
    print(f"⚠️  Delete failed (maybe already gone): {r.status_code}")

# 2. Check if the relation already exists correctly
print("Checking relations for projects...")
r = httpx.get(f"{BASE}/relations?filter[collection][_eq]=projects_machinery", headers=headers)
relations = r.json().get("data", [])
has_projects_rel = any(rel["field"] == "projects_id" for rel in relations)
has_machinery_rel = any(rel["field"] == "machinery_id" for rel in relations)

if not has_projects_rel:
    print("Creating relation projects_machinery.projects_id -> projects.id")
    httpx.post(f"{BASE}/relations", headers=headers, json={
        "collection": "projects_machinery",
        "field": "projects_id",
        "related_collection": "projects",
        "meta": {
            "one_field": "machinery_used",
            "one_deselect_action": "nullify"
        },
        "schema": {"on_delete": "SET NULL"}
    })

if not has_machinery_rel:
    print("Creating relation projects_machinery.machinery_id -> machinery.id")
    httpx.post(f"{BASE}/relations", headers=headers, json={
        "collection": "projects_machinery",
        "field": "machinery_id",
        "related_collection": "machinery",
        "schema": {"on_delete": "SET NULL"}
    })

# 3. Add the alias field to 'projects' for UI
print("Adding 'machinery_used' alias to 'projects'...")
httpx.post(f"{BASE}/fields/projects", headers=headers, json={
    "field": "machinery_used",
    "type": "alias",
    "schema": None, # CRITICAL: This tells Directus there is no DB column
    "meta": {
        "interface": "list-m2m",
        "special": ["m2m"],
        "options": {
            "template": "{{machinery_id.name}}"
        }
    }
})

print("Schema fix complete.")
