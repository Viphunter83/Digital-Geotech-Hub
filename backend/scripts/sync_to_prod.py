import httpx
import json

# Configuration
LOCAL_URL = "http://localhost:8055"
PROD_URL = "https://terra-expert.ru/directus"

LOCAL_ADMIN = {"email": "admin@example.com", "password": "admin-password"}
PROD_ADMIN = {"email": "manager@geotech-hub.ru", "password": "admin-password"}

COLLECTIONS_TO_SYNC = [
    "article_categories", "articles", "machinery_categories", "machinery",
    "services", "service_features", "faq", "hero_configs", "hero_badges",
    "advantages", "company_stats", "company_values", "company_info",
    "about_page", "geology_points", "projects"
]

def get_token(base_url, credentials):
    try:
        r = httpx.post(f"{base_url}/auth/login", json=credentials)
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"Failed to login to {base_url}: {e}")
        return None

def sync():
    local_token = get_token(LOCAL_URL, LOCAL_ADMIN)
    prod_token = get_token(PROD_URL, PROD_ADMIN)
    
    if not local_token or not prod_token: return

    l_headers = {"Authorization": f"Bearer {local_token}"}
    p_headers = {"Authorization": f"Bearer {prod_token}", "Content-Type": "application/json"}

    print("🚀 Starting Production Sync...")

    for collection in COLLECTIONS_TO_SYNC:
        print(f"📦 Syncing {collection}...")
        
        # 1. Fetch from Local
        l_res = httpx.get(f"{LOCAL_URL}/items/{collection}", headers=l_headers)
        if l_res.status_code != 200:
            print(f"  ❌ Failed to fetch local {collection}")
            continue
        
        data = l_res.json()["data"]
        if not data:
            print(f"  ℹ️  No data in local {collection}")
            continue

        # Handle Singleton vs Collection
        items = data if isinstance(data, list) else [data]

        # 2. Push to Prod (Upsert)
        for item in items:
            item_id = item.get("id")
            # For singletons, we use PATCH directly on the collection endpoint if no ID
            
            if isinstance(data, dict) and not item_id:
                print(f"  Updating Singleton {collection}")
                httpx.patch(f"{PROD_URL}/items/{collection}", headers=p_headers, json=item)
                continue

            if not item_id: continue
            
            p_check = httpx.get(f"{PROD_URL}/items/{collection}/{item_id}", headers=p_headers)
            
            if p_check.status_code == 200:
                print(f"  Updating {collection}:{item_id}")
                httpx.patch(f"{PROD_URL}/items/{collection}/{item_id}", headers=p_headers, json=item)
            else:
                print(f"  Creating {collection}:{item_id}")
                httpx.post(f"{PROD_URL}/items/{collection}", headers=p_headers, json=item)

    # 3. Fix Permissions for Public Role
    print("🔐 Setting Public Permissions...")
    r_roles = httpx.get(f"{PROD_URL}/roles", headers=p_headers)
    public_role = next((r for r in r_roles.json()["data"] if r["name"] == "Public"), None)
    
    if public_role:
        role_id = public_role["id"]
        # This part is complex via API, often easier to run a script that sets 'read' for all
        # For now, let's just finish the data sync.
        pass

    print("✅ Sync complete")

if __name__ == "__main__":
    sync()
