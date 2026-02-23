import httpx
import sys

BASE = "https://terra-expert.ru/directus"
ADMIN_EMAIL = "admin@geotech.io"
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

def restore_client_projects():
    print("--- Restoring 'projects' One-to-Many field on 'clients' ---")
    
    # Check if the relational link exists in directus_relations
    # Sometimes the relation exists but the field meta is missing.
    print("Checking relations...")
    r = httpx.get(f"{BASE}/relations/projects/client_id", headers=headers)
    
    if r.status_code == 200:
        rel = r.json().get("data", {})
        print("Relation projects.client_id exists. Updating one_field...")
        metas = rel.get("meta") or {}
        metas["one_field"] = "projects"
        
        r_patch = httpx.patch(f"{BASE}/relations/projects/client_id", headers=headers, json={
            "meta": metas
        })
        print(f"Patched relation: {r_patch.status_code}")
    else:
        print("Relation not found. Creating it...")
        r_post = httpx.post(f"{BASE}/relations", headers=headers, json={
            "collection": "projects",
            "field": "client_id",
            "related_collection": "clients",
            "meta": {
                "one_field": "projects"
            }
        })
        print(f"Created relation: {r_post.status_code}")

    # Create/Update the alias field on clients
    print("Configuring 'projects' field on 'clients' collection...")
    field_payload = {
        "field": "projects",
        "type": "alias",
        "meta": {
            "interface": "list-o2m",
            "special": ["o2m"],
            "display": "related-values",
            "display_options": {
                "template": "{{title}} ({{status}})"
            },
            "readonly": False,
            "hidden": False,
            "translations": [
                {"language": "ru-RU", "translation": "Проекты клиента"}
            ],
            "note": "Список всех проектов, привязанных к этому клиенту."
        }
    }
    
    # Try patching first
    r_field = httpx.patch(f"{BASE}/fields/clients/projects", headers=headers, json=field_payload)
    if r_field.status_code == 200:
        print("✅ Field updated successfully.")
    else:
        # If patching fails, try creating
        print("Field might not exist, attempting to create...")
        r_field_post = httpx.post(f"{BASE}/fields/clients", headers=headers, json=field_payload)
        if r_field_post.status_code in (200, 204):
            print("✅ Field created successfully.")
        else:
            print(f"❌ Failed to create/update field: {r_field_post.text}")

if __name__ == "__main__":
    restore_client_projects()
