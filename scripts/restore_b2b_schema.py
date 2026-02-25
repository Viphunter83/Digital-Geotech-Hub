import httpx
import sys
import os

# Configuration
BASE = "https://terra-expert.ru/directus"
TOKEN = "backend-admin-token-qW2eR3tY4"
headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def check_status(response, message):
    if response.status_code in [200, 204]:
        print(f"SUCCESS: {message}")
    elif response.status_code == 422:
        print(f"INFO: {message} (Already exists or invalid)")
    else:
        print(f"ERROR: {message} | {response.status_code} | {response.text}")

def restore_b2b():
    print("--- 🚀 Starting B2B Schema Restoration ---")

    # 1. Add manager fields to 'clients' if missing
    print("\n1. Checking 'clients' fields...")
    manager_fields = [
        {
            "field": "manager_name",
            "type": "string",
            "meta": {"interface": "input", "width": "half", "translations": [{"language": "ru-RU", "translation": "Имя менеджера"}]}
        },
        {
            "field": "manager_contact",
            "type": "string",
            "meta": {"interface": "input", "width": "half", "translations": [{"language": "ru-RU", "translation": "Контакт менеджера"}]}
        }
    ]
    for field in manager_fields:
        res = httpx.post(f"{BASE}/fields/clients", headers=headers, json=field)
        check_status(res, f"Field '{field['field']}' in 'clients'")

    # 2. Create M2M collections
    print("\n2. Creating M2M collections...")
    m2m_collections = ["projects_documents", "projects_photos"]
    for coll in m2m_collections:
        res = httpx.post(f"{BASE}/collections", headers=headers, json={
            "collection": coll,
            "meta": {"hidden": True},
            "schema": {}
        })
        check_status(res, f"Collection '{coll}'")

        # Basic fields for junction
        for f in ["projects_id", "directus_files_id"]:
            httpx.post(f"{BASE}/fields/{coll}", headers=headers, json={
                "field": f,
                "type": "integer" if f == "projects_id" else "uuid"
            })

    # 3. Create/Configure Relations
    print("\n3. Configuring Relations...")
    relations = [
        # projects_documents -> projects
        {
            "collection": "projects_documents", "field": "projects_id", "related_collection": "projects",
            "meta": {"one_field": "documents", "junction_field": "directus_files_id"}
        },
        # projects_documents -> directus_files
        {
            "collection": "projects_documents", "field": "directus_files_id", "related_collection": "directus_files",
            "meta": {"junction_field": "projects_id"}
        },
        # projects_photos -> projects
        {
            "collection": "projects_photos", "field": "projects_id", "related_collection": "projects",
            "meta": {"one_field": "photos", "junction_field": "directus_files_id"}
        },
        # projects_photos -> directus_files
        {
            "collection": "projects_photos", "field": "directus_files_id", "related_collection": "directus_files",
            "meta": {"junction_field": "projects_id"}
        }
    ]
    for rel in relations:
        res = httpx.post(f"{BASE}/relations", headers=headers, json=rel)
        check_status(res, f"Relation {rel['collection']}.{rel['field']}")

    # 4. Set UI Interface for projects (M2M 'files')
    print("\n4. Setting UI interfaces in 'projects'...")
    interfaces = [
        {"field": "documents", "label": "Документы (КС-2, КС-3, Отчеты)"},
        {"field": "photos", "label": "Фотоотчеты"}
    ]
    for item in interfaces:
        res = httpx.patch(f"{BASE}/fields/projects/{item['field']}", headers=headers, json={
            "meta": {
                "interface": "files",
                "special": ["files"],
                "translations": [{"language": "ru-RU", "translation": item['label']}]
            }
        })
        check_status(res, f"UI Interface for projects.{item['field']}")

    print("\n--- ✅ Restoration Complete ---")

if __name__ == "__main__":
    restore_b2b()
