#!/usr/bin/env python3
import httpx
import sys

DIRECTUS_URL = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def main():
    with httpx.Client(base_url=DIRECTUS_URL) as client:
        # Auth
        res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = res.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"

        print("\n--- ALL COLLECTIONS ---")
        cols = client.get("/collections").json()["data"]
        for c in cols:
            print(f"Collection: {c['collection']}, Note: {c.get('meta', {}).get('note')}")

        print("\n--- PUBLIC PERMISSIONS (Full Dump) ---")
        # In Directus v11+, policies are used. Let's see all permissions and their details.
        perms = client.get("/permissions", params={"limit": -1}).json()["data"]
        for p in perms:
            # Look for permissions with role=null or policy that looks like public
            if p.get('role') is None or p.get('policy') == "abf8a154-5b1c-4a46-ac9c-7300570f4f17":
                print(f"[{p.get('action')}] {p.get('collection')} | Role: {p.get('role')} | Policy: {p.get('policy')}")

if __name__ == "__main__":
    main()
