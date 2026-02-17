#!/usr/bin/env python3
"""
Ultimate Directus Permissions Fix
Attempts to grant read access to Public policy.
"""

import httpx
import os
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def main():
    print(f"🚀 Granting Public Permissions on {DIRECTUS_URL}...")
    
    with httpx.Client(base_url=DIRECTUS_URL, timeout=30.0) as client:
        # Auth
        try:
            res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
            token = res.json()["data"]["access_token"]
            client.headers["Authorization"] = f"Bearer {token}"
            print("✅ Authenticated as Admin")
        except:
            print("❌ Auth failed. Please check credentials.")
            return

        # 1. Identify the Public Policy
        policies = client.get("/policies").json()["data"]
        public_policy = next((p for p in policies if p.get('name') == '$t:public_label'), None)
        if not public_policy:
            # Try to find any policy with null role
            res = client.get("/permissions", params={"filter[role][_null]": "true"})
            perms = res.json().get("data", [])
            if perms:
                policy_id = perms[0].get('policy')
                print(f"✅ Found Public Policy via permissions: {policy_id}")
            else:
                print("❌ Could not identify Public Policy")
                return
        else:
            policy_id = public_policy['id']
            print(f"✅ Found Public Policy: {policy_id}")

        # 2. Collections to grant read access
        collections = client.get("/collections").json()["data"]
        target_collections = [c["collection"] for c in collections] # All collections
        
        # System collections usually need explicit access too
        target_collections += ["directus_files", "directus_fields", "directus_collections", "directus_relations"]

        # 3. Apply Permissions
        res = client.get("/permissions", params={"filter[policy][_eq]": policy_id, "limit": -1})
        existing_perms = {p["collection"]: p for p in res.json().get("data", []) if p["action"] == "read"}

        for col in set(target_collections):
            payload = {
                "collection": col,
                "action": "read",
                "fields": ["*"],
                "policy": policy_id,
                "permissions": {},
                "validation": {}
            }
            if col in existing_perms:
                client.patch(f"/permissions/{existing_perms[col]['id']}", json=payload)
            else:
                client.post("/permissions", json=payload)
            
        # 4. Allow Creates on Leads
        lead_create = next((p for p in res.json().get("data", []) if p["collection"] == "leads" and p["action"] == "create"), None)
        lead_create_payload = {
            "collection": "leads",
            "action": "create",
            "fields": ["*"],
            "policy": policy_id,
            "permissions": {},
            "validation": {}
        }
        if lead_create:
            client.patch(f"/permissions/{lead_create['id']}", json=lead_create_payload)
        else:
            client.post("/permissions", json=lead_create_payload)

    print("\n🎉 Permissions ensured for Public Policy!")

if __name__ == "__main__":
    main()
