#!/usr/bin/env python3
import httpx

DIRECTUS_URL = "http://localhost:8055"

def main():
    with httpx.Client(base_url=DIRECTUS_URL) as client:
        # Try fetching hero_configs as public
        print("--- Fetching hero_configs as PUBLIC ---")
        r = client.get("/items/hero_configs")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")

        print("\n--- Fetching machinery_categories as PUBLIC ---")
        r = client.get("/items/machinery_categories")
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text[:200]}")

if __name__ == "__main__":
    main()
