import httpx

# Config
LOCAL_URL = "http://localhost:8055"
PROD_URL = "https://terra-expert.ru/directus"
LOCAL_ADMIN = {"email": "admin@example.com", "password": "admin-password"}
PROD_ADMIN = {"email": "manager@geotech-hub.ru", "password": "admin-password"}

def get_token(url, creds):
    try:
        r = httpx.post(f"{url}/auth/login", json=creds, timeout=10)
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"Error getting token for {url}: {e}")
        return None

def sync_data():
    l_token = get_token(LOCAL_URL, LOCAL_ADMIN)
    p_token = get_token(PROD_URL, PROD_ADMIN)
    if not l_token or not p_token: return
    
    l_headers = {"Authorization": f"Bearer {l_token}"}
    p_headers = {"Authorization": f"Bearer {p_token}", "Content-Type": "application/json"}

    collections = [
        "article_categories", "articles", "machinery_categories", "machinery",
        "service_features", "services", "faq", "hero_configs", "hero_badges",
        "advantages", "company_stats", "company_values", "company_info",
        "geology_points", "projects"
    ]

    for coll in collections:
        print(f"📦 Syncing {coll}...")
        try:
            l_res = httpx.get(f"{LOCAL_URL}/items/{coll}?limit=-1", headers=l_headers)
            if l_res.status_code != 200:
                print(f"  ❌ Failed to fetch local {coll}: {l_res.status_code}")
                continue
            
            items = l_res.json()["data"]
            if not isinstance(items, list): items = [items]
            
            print(f"  Found {len(items)} items locally.")
            for item in items:
                iid = item.get("id")
                if not iid: continue
                
                # Cleanup
                item.pop("user_created", None)
                item.pop("date_created", None)
                item.pop("user_updated", None)
                item.pop("date_updated", None)

                # Special handling for machinery status mismatch
                if coll == "machinery":
                    status = item.get("status", "").lower()
                    if status not in ["available", "rented", "maintenance"]:
                        item["status"] = "available"

                p_check = httpx.get(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers)
                if p_check.status_code == 200:
                    r = httpx.patch(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers, json=item)
                    print(f"  Updating {coll}:{iid} -> {r.status_code}")
                else:
                    # Try with ID first
                    r = httpx.post(f"{PROD_URL}/items/{coll}", headers=p_headers, json=item)
                    if r.status_code == 403:
                        # Try without ID if 403 (Directus might forbid manual IDs)
                        print(f"  ⚠️ Restricted ID {iid}, trying without ID...")
                        item_no_id = item.copy()
                        item_no_id.pop("id", None)
                        r = httpx.post(f"{PROD_URL}/items/{coll}", headers=p_headers, json=item_no_id)
                    
                    print(f"  Creating {coll}:{iid} -> {r.status_code}")
                    if r.status_code not in [200, 204]:
                        print(f"    ❌ Error: {r.text}")
        except Exception as e:
            print(f"  ❌ Error syncing {coll}: {e}")

if __name__ == "__main__":
    sync_data()
