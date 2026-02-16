#!/usr/bin/env python3
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

print("\n🚀 CREATING LEADS COLLECTION\n")

# 1. Create Collection
r = api("POST", "/collections", {
    "collection": "leads",
    "meta": {
        "icon": "contact_mail",
        "note": "Сбор заявок с сайта и через AI-консультанта",
        "display_template": "{{name}} ({{company}})"
    },
    "schema": {}
})

if r.status_code == 200:
    print("  ✅ Collection Created")
else:
    print(f"  ❌ Failed: {r.status_code} {r.text}")

# 2. Add Fields
fields = [
    {"field": "name", "type": "string", "meta": {"interface": "input", "options": {"placeholder": "Имя"}, "width": "half"}},
    {"field": "phone", "type": "string", "meta": {"interface": "input", "options": {"placeholder": "+7..."}, "width": "half"}},
    {"field": "email", "type": "string", "meta": {"interface": "input", "options": {"placeholder": "email@example.com"}, "width": "half"}},
    {"field": "company", "type": "string", "meta": {"interface": "input", "options": {"placeholder": "Компания"}, "width": "half"}},
    {"field": "status", "type": "string", "schema": {"default_value": "new"}, "meta": {
        "interface": "select-dropdown", 
        "options": {
            "choices": [
                {"text": "Новая", "value": "new"},
                {"text": "В обработке", "value": "processing"},
                {"text": "Завершена", "value": "done"},
                {"text": "Отказ", "value": "rejected"}
            ]
        }
    }},
    {"field": "audit_data", "type": "json", "meta": {"interface": "json-editor", "note": "Технические данные из аудита"}},
    {"field": "date_created", "type": "timestamp", "meta": {"interface": "datetime", "readonly": True, "special": ["date-created"]}}
]

for f in fields:
    r = api("POST", "/fields/leads", f)
    if r.status_code == 200:
        print(f"  ✅ Field '{f['field']}' added")
    else:
        print(f"  ❌ Failed field '{f['field']}': {r.status_code}")

print("\n✅ Done!")
