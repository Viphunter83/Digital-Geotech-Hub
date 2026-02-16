#!/usr/bin/env python3
"""
Add dynamic visual fields to hero_configs collection in Directus.
"""
import httpx
import sys

BASE = "http://localhost:8055"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"❌ Failed to login: {e}")
        return None

TOKEN = get_token()
if not TOKEN:
    sys.exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

def add_field(collection, field_name, field_def):
    check = api("GET", f"/fields/{collection}/{field_name}")
    if check.status_code == 200:
        print(f"  ⏭  {collection}.{field_name}: already exists")
        return True
    r = api("POST", f"/fields/{collection}", field_def)
    if r.status_code in (200, 204):
        print(f"  ✅ {collection}.{field_name}: added")
        return True
    else:
        print(f"  ❌ {collection}.{field_name}: failed ({r.status_code})")
        print(f"     {r.text}")
    return False

print("\n🚀 ADDING DYNAMIC VISUAL FIELDS TO HERO_CONFIGS\n")

# 1. Background Image Field (M2O to directus_files)
add_field("hero_configs", "background_image", {
    "field": "background_image",
    "type": "uuid",
    "meta": {
        "interface": "file",
        "note": "Фоновое изображение для этого региона (8K wide рекомендовано)",
        "width": "half",
        "sort": 10,
    },
    "schema": {
        "foreign_key_table": "directus_files",
        "foreign_key_column": "id",
    },
})

# 2. Image Opacity Field (Integer 0-100)
add_field("hero_configs", "image_opacity", {
    "field": "image_opacity",
    "type": "integer",
    "meta": {
        "interface": "slider",
        "options": {
            "min": 0,
            "max": 100,
            "step": 5,
        },
        "note": "Прозрачность фонового изображения (0-100%). Рекомендуется 40-70%.",
        "width": "half",
        "sort": 11,
        "validation_message": "Значение должно быть от 0 до 100",
    },
    "schema": {
        "default_value": 60,
    }
})

# 3. Add relation for background_image
print("\n🔗 Adding relation hero_configs.background_image → directus_files:")
api("POST", "/relations", {
    "collection": "hero_configs",
    "field": "background_image",
    "related_collection": "directus_files",
    "meta": {},
    "schema": {}
})

print("\n✅ Done! Now you can manage Hero visuals in Directus.")
