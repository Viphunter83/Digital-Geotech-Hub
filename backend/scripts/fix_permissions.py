#!/usr/bin/env python3
"""
Aggressive Directus Permissions Fix
Grants broad read access to Public policy.
"""

import httpx
import os
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://localhost:8055")
ADMIN_EMAIL = os.getenv("DIRECTUS_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("DIRECTUS_ADMIN_PASSWORD", "admin-password")
PUBLIC_POLICY_ID = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"

def main():
    print(f"🚀 Broad Permissions Fix on {DIRECTUS_URL}...")
    
    with httpx.Client(base_url=DIRECTUS_URL, timeout=30.0) as client:
        # Auth
        res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = res.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"

        # 1. Get all collections
        collections = client.get("/collections").json()["data"]
        
        # 2. Get existing permissions for Public policy
        res = client.get("/permissions", params={"filter[policy][_eq]": PUBLIC_POLICY_ID, "limit": -1})
        existing_permissions = res.json().get("data", [])
        existing_read_map = {p["collection"]: p["id"] for p in existing_permissions if p["action"] == "read"}

        # 3. Grant/Update Read for all relevant collections
        system_collections = ["directus_files", "directus_users", "directus_roles", "directus_settings", "directus_fields"]
        user_collections = [c["collection"] for c in collections if not c["collection"].startswith("directus_")]
        
        target_collections = user_collections + system_collections

        for collection in target_collections:
            payload = {
                "collection": collection,
                "action": "read",
                "fields": ["*"],
                "policy": PUBLIC_POLICY_ID,
                "permissions": {},
                "validation": {}
            }
            
            if collection in existing_read_map:
                perm_id = existing_read_map[collection]
                print(f"  🔄 Updating permission for '{collection}' (ID: {perm_id})")
                r = client.patch(f"/permissions/{perm_id}", json=payload)
            else:
                print(f"  ✨ Creating permission for '{collection}'")
                r = client.post("/permissions", json=payload)
            
            if r.status_code not in [200, 201, 204]:
                print(f"  ❌ Failed for '{collection}': {r.status_code} - {r.text[:100]}")

        # 4. Special: Leads Create
        lead_create_id = next((p["id"] for p in existing_permissions if p["collection"] == "leads" and p["action"] == "create"), None)
        lead_payload = {
            "collection": "leads",
            "action": "create",
            "fields": ["*"],
            "policy": PUBLIC_POLICY_ID,
            "permissions": {},
            "validation": {}
        }
        if lead_create_id:
            client.patch(f"/permissions/{lead_create_id}", json=lead_payload)
        else:
            client.post("/permissions", json=lead_payload)
        print("  ✅ Lead Creation permission ensured.")

    print("\n🎉 Broad permissions applied!")

if __name__ == "__main__":
    main()
