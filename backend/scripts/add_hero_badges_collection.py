#!/usr/bin/env python3
"""
Create hero_badges collection in Directus with proper schema.
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

print("\n🚀 CREATING HERO_BADGES COLLECTION (WITH SCHEMA)\n")

# 1. Create Collection with PK
r = api("POST", "/collections", {
    "collection": "hero_badges",
    "schema": {}, # Forces creation of a database table
    "meta": {
        "icon": "auto_awesome",
        "note": "Технические бейджи (плавающие иконки) на главном экране",
    },
    "fields": [
        {
            "field": "id",
            "type": "integer",
            "meta": {"hidden": True},
            "schema": {"is_primary_key": True, "has_auto_increment": True}
        }
    ]
})
if r.status_code in (200, 204):
    print("  ✅ hero_badges: collection created with PK")
else:
    print(f"  ❌ hero_badges: {r.status_code}")
    print(f"     {r.text}")
    sys.exit(1)

# 2. Add Fields
fields = [
    {"field": "label", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Подпись иконки (напр. 'Буровые')"}},
    {"field": "href", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Ссылка при клике (напр. '/services#drilling')"}},
    {"field": "image", "type": "uuid", "meta": {"interface": "file", "width": "half", "note": "Изображение (3D ассет на прозрачном фоне)"}, "schema": {"foreign_key_table": "directus_files", "foreign_key_column": "id"}},
    {"field": "parallax_factor", "type": "float", "meta": {"interface": "input", "width": "half", "note": "Коэффициент параллакса (напр. 0.1 или -0.12)"}, "schema": {"default_value": 0.1}},
    {"field": "pos_top", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Позиция сверху (напр. '15%')"}},
    {"field": "pos_left", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Позиция слева (напр. '5%')"}},
    {"field": "pos_right", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Позиция справа (напр. '5%')"}},
    {"field": "pos_bottom", "type": "string", "meta": {"interface": "input", "width": "half", "note": "Позиция снизу (напр. '20%')"}},
    {"field": "sort", "type": "integer", "meta": {"interface": "input", "width": "half", "note": "Порядок отображения"}},
]

for fd in fields:
    fn = fd["field"]
    r = api("POST", "/fields/hero_badges", fd)
    if r.status_code in (200, 204):
        print(f"  ✅ hero_badges.{fn}: added")
    else:
        print(f"  ❌ hero_badges.{fn}: failed ({r.status_code})")

# 3. Add relation for image
print("\n🔗 Adding relation hero_badges.image → directus_files:")
api("POST", "/relations", {
    "collection": "hero_badges",
    "field": "image",
    "related_collection": "directus_files",
    "meta": {},
    "schema": {}
})

# 4. Grant Permissions
print("\n🔓 Granting public read permissions:")
policy_id = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"
api("POST", "/permissions", {
    "collection": "hero_badges",
    "action": "read",
    "fields": ["*"],
    "policy": policy_id,
})

print("\n✅ Done!")
