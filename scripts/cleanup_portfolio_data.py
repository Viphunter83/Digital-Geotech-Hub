import httpx
import json
import os
from collections import defaultdict

# --- Configuration ---
BASE_URL = "https://terra-expert.ru/directus"
ADMIN_TOKEN = "backend-admin-token-qW2eR3tY4"
DRY_RUN = False  # SET TO FALSE TO APPLY CHANGES

headers = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}

def check_status(response, msg):
    if response.status_code >= 200 and response.status_code < 300:
        return True
    print(f"❌ ERROR: {msg} (Status: {response.status_code}, Resp: {response.text})")
    return False

def backup_data():
    print("--- 📦 Backing up data ---")
    projects = httpx.get(f"{BASE_URL}/items/projects?limit=-1", headers=headers).json()
    files = httpx.get(f"{BASE_URL}/files?limit=-1", headers=headers).json()
    
    with open("projects_backup.json", "w") as f:
        json.dump(projects, f, indent=2)
    with open("files_backup.json", "w") as f:
        json.dump(files, f, indent=2)
    print("✅ Backup complete.")

def deduplicate_media():
    print("\n--- 🖼️ Deduplicating Media ---")
    files_resp = httpx.get(f"{BASE_URL}/files?limit=-1", headers=headers).json()
    files = files_resp.get("data", [])
    
    # 1. Group by filename and size
    file_map = defaultdict(list)
    for f in files:
        key = (f["filename_download"], f["filesize"])
        file_map[key].append(f)
    
    duplicates = {k: v for k, v in file_map.items() if len(v) > 1}
    print(f"Found {len(duplicates)} duplicate file groups.")
    
    canonical_map = {} # old_id -> canonical_id
    id_to_canonical = {} # To use for project/machinery updates
    
    for key, group in duplicates.items():
        # Sort by date created or ID to pick the "oldest" as canonical
        group.sort(key=lambda x: x["id"])
        canonical = group[0]
        to_delete = group[1:]
        
        print(f"  Group {key}: Canonical={canonical['id']}, Duplicates={[f['id'] for f in to_delete]}")
        for dup in to_delete:
            id_to_canonical[dup["id"]] = canonical["id"]

    if not id_to_canonical:
        print("No file duplicates found to merge.")
        return

    # 2. Update references in other collections
    # - machinery (image)
    # - projects (cover image if any, M2M photos/documents)
    # - services (image/icon)
    
    # Machinery
    print("  Checking Machinery references...")
    machinery = httpx.get(f"{BASE_URL}/items/machinery", headers=headers).json().get("data", [])
    for m in machinery:
        img_id = m.get("image")
        if img_id in id_to_canonical:
            new_id = id_to_canonical[img_id]
            print(f"    [PATCH] Machinery '{m['name']}': {img_id} -> {new_id}")
            if not DRY_RUN:
                httpx.patch(f"{BASE_URL}/items/machinery/{m['id']}", headers=headers, json={"image": new_id})

    # Projects (not M2M yet, just direct fields if any)
    # Note: Projects seem to use M2M for photos/docs mostly.
    
    # Junction Tables: projects_photos, projects_documents
    for junction in ["projects_photos", "projects_documents"]:
        print(f"  Checking {junction} references...")
        items = httpx.get(f"{BASE_URL}/items/{junction}", headers=headers).json().get("data", [])
        for item in items:
            file_id = item.get("directus_files_id")
            if file_id in id_to_canonical:
                new_id = id_to_canonical[file_id]
                print(f"    [PATCH] {junction} ID {item['id']}: {file_id} -> {new_id}")
                if not DRY_RUN:
                    httpx.patch(f"{BASE_URL}/items/{junction}/{item['id']}", headers=headers, json={"directus_files_id": new_id})

    # 3. Delete duplicates
    if not DRY_RUN:
        print("  Deleting duplicate file records...")
        for old_id in id_to_canonical.keys():
            httpx.delete(f"{BASE_URL}/files/{old_id}", headers=headers)
    else:
        print("  [DRY RUN] Would delete duplicates.")

def deduplicate_projects():
    print("\n--- 🏗️ Deduplicating Projects ---")
    projects = httpx.get(f"{BASE_URL}/items/projects?fields=id,title,region,description&limit=-1", headers=headers).json().get("data", [])
    
    # Identify Lakhta Center 2 specifically (ID 1 vs 4)
    # 1: title: "МФК Лахта Центр 2", region: null (msk in UI logic maybe), desc: short
    # 4: title: "МФК «Лахта Центр 2»", region: "spb", desc: long/full
    
    duplicates_to_remove = []
    
    # Manual check for Lakhta
    lakhta_1 = next((p for p in projects if p["id"] == 1), None)
    lakhta_4 = next((p for p in projects if p["id"] == 4), None)
    
    if lakhta_1 and lakhta_4:
        print(f"  Found Lakhta duplication: ID 1 and ID 4.")
        print(f"  Recommended survivor: ID 4 (SPB, detailed data).")
        duplicates_to_remove.append(1)

    # General fuzzy match (optional, but let's be safe and only do confirmed ones)
    
    if not duplicates_to_remove:
        print("No project duplicates found to merge.")
        return

    for pid in duplicates_to_remove:
        print(f"  [DELETE] Project ID {pid}")
        if not DRY_RUN:
            httpx.delete(f"{BASE_URL}/items/projects/{pid}", headers=headers)
        else:
            print("  [DRY RUN] Would delete project.")

def main():
    print(f"🚀 Starting Portfolio Cleanup (DRY_RUN={DRY_RUN})")
    backup_data()
    deduplicate_media()
    deduplicate_projects()
    print("\n✅ Cleanup process finished.")

if __name__ == "__main__":
    main()
