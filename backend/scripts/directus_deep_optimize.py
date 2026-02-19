import httpx
import sys

BASE = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        return r.json()["data"]["access_token"]
    except: return None

token = get_token()
if not token: sys.exit(1)
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def api(method, path, data=None):
    return httpx.request(method, f"{BASE}{path}", headers=headers, json=data)

# 1. FIX SERVICES <-> FEATURES (O2M)
print("Fixing services <-> features relation...")
# Add 'service' field to service_features
api("POST", "/fields/service_features", {
    "field": "service",
    "type": "string",
    "meta": {
        "interface": "select-dropdown-m2o",
        "width": "half",
        "sort": 4
    }
})

# Add 'features' alias to services
api("POST", "/fields/services", {
    "field": "features",
    "type": "alias",
    "meta": {
        "interface": "list-o2m",
        "special": ["o2m"],
        "options": {
            "template": "{{text}}"
        },
        "sort": 10
    }
})

# Create relation
api("POST", "/relations", {
    "collection": "service_features",
    "field": "service",
    "related_collection": "services",
    "meta": {
        "one_field": "features",
        "one_deselect_action": "nullify"
    }
})

# 2. ENHANCE MACHINERY CATEGORIES
print("Enhancing machinery categories...")
# Add 'icon' to machinery_categories
api("POST", "/fields/machinery_categories", {
    "field": "icon",
    "type": "string",
    "meta": {
        "interface": "select-dropdown",
        "options": {
            "choices": [
                {"text": "Drill", "value": "drill"},
                {"text": "Hammer", "value": "hammer"},
                {"text": "Crane", "value": "crane"},
                {"text": "Layers", "value": "layers"}
            ]
        },
        "width": "half"
    }
})

# 3. FIX SINGLETONS UI
print("Polishing singletons UI...")
singletons = ["company_info", "about_page", "site_settings"]
for s in singletons:
    api("PATCH", f"/collections/{s}", {
        "meta": {"singleton": True, "display_template": "{{site_name}}"}
    })

# 4. GRANT PERMISSIONS (Double check)
print("Verifying permissions...")
policy_id = "abf8a154-5b1c-4a46-ac9c-7300570f4f17" # Public Role Policy
all_colls = ["articles", "machinery", "projects", "services", "faq", "hero_configs", 
             "company_info", "advantages", "company_stats", "company_values", 
             "machinery_categories", "machinery_specs", "service_features", 
             "project_tags", "project_stats", "project_technologies"]

for coll in all_colls:
    api("POST", "/permissions", {
        "collection": coll,
        "action": "read",
        "fields": ["*"],
        "policy": policy_id
    })

print("Deep optimization complete.")
