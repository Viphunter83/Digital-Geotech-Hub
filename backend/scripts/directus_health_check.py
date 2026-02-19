import httpx
import json

BASE = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        return r.json()["data"]["access_token"]
    except: return None

token = get_token()
headers = {"Authorization": f"Bearer {token}"} if token else {}

def check_public_access(collection):
    try:
        r = httpx.get(f"{BASE}/items/{collection}?limit=1")
        return r.status_code == 200
    except: return False

def get_collection_meta(collection):
    try:
        r = httpx.get(f"{BASE}/collections/{collection}", headers=headers)
        return r.json().get("data", {}).get("meta", {})
    except: return {}

collections = [
    "articles", "machinery", "projects", "services", "faq", 
    "hero_configs", "company_info", "advantages", "company_stats", "company_values"
]

print(f"{'Collection':<20} | {'Public Access':<15} | {'Singleton':<10} | {'Icon':<10}")
print("-" * 65)

for c in collections:
    public = "✅ YES" if check_public_access(c) else "❌ NO"
    meta = get_collection_meta(c)
    singleton = "YES" if meta.get("singleton") else "NO"
    icon = meta.get("icon", "N/A")
    print(f"{c:<20} | {public:<15} | {singleton:<10} | {icon:<10}")

# Check specific crucial relations
print("\n🔍 RELATION AUDIT:")
rels = ["projects.machinery_used", "machinery.specs", "services.features"]
for rel in rels:
    coll, field = rel.split(".")
    r = httpx.get(f"{BASE}/fields/{coll}/{field}", headers=headers)
    if r.status_code == 200:
        data = r.json()["data"]
        print(f"✅ {rel}: Type={data.get('type')}, Interface={data.get('meta', {}).get('interface')}")
    else:
        print(f"❌ {rel}: MISSING or ERROR {r.status_code}")
