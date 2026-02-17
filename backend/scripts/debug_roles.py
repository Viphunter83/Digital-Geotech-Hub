#!/usr/bin/env python3
import httpx
import sys

DIRECTUS_URL = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def main():
    with httpx.Client(base_url=DIRECTUS_URL) as client:
        res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        if res.status_code != 200:
            print(f"Auth failed: {res.text}")
            return
        token = res.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"

        print("\n--- ROLES ---")
        roles = client.get("/roles").json()["data"]
        for r in roles:
            print(f"Role: {r.get('name')} (ID: {r.get('id')})")

        print("\n--- POLICIES ---")
        try:
            policies = client.get("/policies").json()["data"]
            for p in policies:
                print(f"Policy: {p.get('name')} (ID: {p.get('id')})")
        except:
            print("Failed to fetch policies (maybe old version or no policies)")

if __name__ == "__main__":
    main()
