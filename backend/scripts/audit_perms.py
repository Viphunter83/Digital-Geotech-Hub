#!/usr/bin/env python3
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://localhost:8055")
ADMIN_EMAIL = os.getenv("DIRECTUS_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("DIRECTUS_ADMIN_PASSWORD", "admin-password")

def main():
    with httpx.Client(base_url=DIRECTUS_URL) as client:
        res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = res.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"

        collections = ["hero_configs", "machinery_categories"]
        for c in collections:
            print(f"\n--- Checking {c} ---")
            r = client.get(f"/collections/{c}")
            if r.status_code == 200:
                data = r.json()["data"]
                print(f"Collection: {data.get('collection')}")
                print(f"Meta: {data.get('meta')}")
            else:
                print(f"Error fetching collection {c}: {r.status_code}")

            print(f"--- Permissions for {c} ---")
            rp = client.get("/permissions", params={"filter[collection][_eq]": c})
            perms = rp.json()["data"]
            for p in perms:
                print(f"Action: {p.get('action')}, Role: {p.get('role')}, Policy: {p.get('policy')}")

if __name__ == "__main__":
    main()
