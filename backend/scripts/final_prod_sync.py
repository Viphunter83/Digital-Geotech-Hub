import httpx

# Config
LOCAL_URL = "http://localhost:8055"
PROD_URL = "https://terra-expert.ru/directus"
LOCAL_ADMIN = {"email": "admin@example.com", "password": "admin-password"}
PROD_ADMIN = {"email": "manager@geotech-hub.ru", "password": "admin-password"}

def get_token(url, creds):
    r = httpx.post(f"{url}/auth/login", json=creds)
    return r.json()["data"]["access_token"]

def fix_metadata(url, token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    print(f"🔧 Fixing metadata at {url}...")
    
    # Fix Projects
    httpx.delete(f"{url}/fields/projects/machinery_used", headers=headers)
    httpx.delete(f"{url}/fields/projects/used_machinery", headers=headers)
    httpx.post(f"{url}/fields/projects", headers=headers, json={
        "field": "used_machinery",
        "type": "alias",
        "schema": None,
        "meta": {"interface": "list-m2m", "special": ["m2m"]}
    })
    
    # Fix Services
    httpx.delete(f"{url}/fields/services/features", headers=headers)
    httpx.post(f"{url}/fields/services", headers=headers, json={
        "field": "features",
        "type": "alias",
        "schema": None,
        "meta": {"interface": "list-m2m", "special": ["m2m"]}
    })

def sync_data():
    l_token = get_token(LOCAL_URL, LOCAL_ADMIN)
    p_token = get_token(PROD_URL, PROD_ADMIN)
    l_headers = {"Authorization": f"Bearer {l_token}"}
    p_headers = {"Authorization": f"Bearer {p_token}", "Content-Type": "application/json"}

    collections = [
        "article_categories", "articles", "machinery_categories", "machinery",
        "services", "service_features", "faq", "hero_configs", "hero_badges",
        "advantages", "company_stats", "company_values", "company_info",
        "geology_points", "projects"
    ]

    for coll in collections:
        print(f"📦 Syncing {coll}...")
        l_res = httpx.get(f"{LOCAL_URL}/items/{coll}", headers=l_headers)
        if l_res.status_code != 200: continue
        items = l_res.json()["data"]
        if not isinstance(items, list): items = [items]
        
        for item in items:
            iid = item.get("id")
            if not iid: continue
            
            p_check = httpx.get(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers)
            if p_check.status_code == 200:
                httpx.patch(f"{PROD_URL}/items/{coll}/{iid}", headers=p_headers, json=item)
            else:
                httpx.post(f"{PROD_URL}/items/{coll}", headers=p_headers, json=item)

if __name__ == "__main__":
    l_token = get_token(LOCAL_URL, LOCAL_ADMIN)
    p_token = get_token(PROD_URL, PROD_ADMIN)
    fix_metadata(LOCAL_URL, l_token)
    fix_metadata(PROD_URL, p_token)
    sync_data()
    print("🚀 All fixes and sync complete!")
