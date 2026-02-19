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

def get_physical_fields(url, token, collection):
    headers = {"Authorization": f"Bearer {token}"}
    r = httpx.get(f"{url}/fields/{collection}", headers=headers)
    if r.status_code != 200: return []
    # Only return fields that have a physical schema (actual DB columns)
    return [f["field"] for f in r.json()["data"] if f.get("schema") is not None]

def sync_data():
    l_token = get_token(LOCAL_URL, LOCAL_ADMIN)
    p_token = get_token(PROD_URL, PROD_ADMIN)
    if not l_token or not p_token: return
    
    l_headers = {"Authorization": f"Bearer {l_token}"}
    p_headers = {"Authorization": f"Bearer {p_token}", "Content-Type": "application/json"}

    collections = [
        "clients", "machinery_categories", "machinery",
        "service_features", "services", "faq", "hero_configs", "hero_badges",
        "advantages", "company_stats", "company_values", "company_info",
        "geology_points", "projects", "machinery_specs"
    ]

    for coll in collections:
        print(f"📦 Syncing {coll}...")
        try:
            # Get physical fields to avoid relational 403s
            fields = get_physical_fields(LOCAL_URL, l_token, coll)
            print(f"  Physical fields: {fields}")
            
            l_res = httpx.get(f"{LOCAL_URL}/items/{coll}?limit=-1", headers=l_headers)
            if l_res.status_code != 200:
                print(f"  ❌ Failed to fetch local {coll}: {l_res.status_code}")
                continue
            
            items = l_res.json()["data"]
            if not isinstance(items, list): items = [items]
            
            for item in items:
                iid = item.get("id")
                if iid is None: continue
                
                # Strip non-physical fields
                clean_item = {k: v for k, v in item.items() if k in fields}
                
                # Metadata cleanup
                clean_item.pop("user_created", None)
                clean_item.pop("date_created", None)
                clean_item.pop("user_updated", None)
                clean_item.pop("date_updated", None)

                p_check = httpx.get(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers)
                if p_check.status_code == 200:
                    r = httpx.patch(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers, json=clean_item)
                    print(f"  Updating {coll}:{iid} -> {r.status_code}")
                else:
                    r = httpx.post(f"{PROD_URL}/items/{coll}", headers=p_headers, json=clean_item)
                    print(f"  Creating {coll}:{iid} -> {r.status_code}")
                    if r.status_code not in [200, 204]:
                        print(f"    ❌ Error: {r.text}")
        except Exception as e:
            print(f"  ❌ Error syncing {coll}: {e}")

if __name__ == "__main__":
    sync_data()
