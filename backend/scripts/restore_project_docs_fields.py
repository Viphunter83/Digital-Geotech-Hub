import httpx
import os
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

def create_m2m_file_relation(alias_name, junction_collection, label):
    print(f"\n--- Setting up '{alias_name}' ({label}) ---")
    
    # 1. Create junction collection
    print(f"1. Creating junction collection '{junction_collection}'...")
    r = httpx.post(f"{BASE}/collections", headers=headers, json={
        "collection": junction_collection,
        "meta": {
            "hidden": True,
            "icon": "import_export"
        },
        "schema": {}
    })
    
    # 2. Add projects_id field to junction
    print(f"2. Adding 'projects_id' to '{junction_collection}'...")
    httpx.post(f"{BASE}/fields/{junction_collection}", headers=headers, json={
        "field": "projects_id",
        "type": "integer",
        "meta": {"hidden": True},
        "schema": {"is_primary_key": False}
    })
    
    # 3. Add directus_files_id field to junction
    print(f"3. Adding 'directus_files_id' to '{junction_collection}'...")
    httpx.post(f"{BASE}/fields/{junction_collection}", headers=headers, json={
        "field": "directus_files_id",
        "type": "uuid",
        "meta": {"hidden": True},
        "schema": {"is_primary_key": False}
    })
    
    # 4. Create relations
    print("4. Creating relations...")
    httpx.post(f"{BASE}/relations", headers=headers, json={
        "collection": junction_collection,
        "field": "projects_id",
        "related_collection": "projects",
        "meta": {
            "one_field": alias_name,
            "junction_field": "directus_files_id"
        },
        "schema": {"on_delete": "CASCADE"}
    })
    
    httpx.post(f"{BASE}/relations", headers=headers, json={
        "collection": junction_collection,
        "field": "directus_files_id",
        "related_collection": "directus_files",
        "meta": {
            "one_field": None,
            "junction_field": "projects_id"
        },
        "schema": {"on_delete": "CASCADE"}
    })

    # 5. Create alias field on projects (If relation creation didn't auto-create the perfect meta)
    print(f"5. Configuring alias field '{alias_name}' on 'projects'...")
    # Update the alias field with correct interface
    httpx.patch(f"{BASE}/fields/projects/{alias_name}", headers=headers, json={
        "meta": {
            "interface": "files",
            "special": ["files"],
            "display": "related-values",
            "options": {},
            "translations": [
                {"language": "en-US", "translation": label},
                {"language": "ru-RU", "translation": label}
            ],
            "note": f"Загрузите {label} сюда"
        }
    })

create_m2m_file_relation("documents", "projects_documents", "Документы (КС-2, КС-3, Отчеты)")
create_m2m_file_relation("photos", "projects_photos", "Фотоотчеты")

print("\n✅ M2M File fields successfully recreated!")
