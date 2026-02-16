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
if not TOKEN: sys.exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    return r

print("\n🚀 SYNCING MACHINERY DATA TO DIRECTUS\n")

# Missing Items to Seed
missing_machinery = [
    {
        "id": "giken-silent-piler",
        "name": "Giken Silent Piler",
        "category": 3,  # Auxiliary / Vibro
        "category_label": "Вдавливающая установка",
        "description": "Бесшумное погружение шпунта Ларсена. Работает по принципу реактивного усилия, не создавая вибраций.",
        "accent_color": "green",
        "specs": [
            {"label": "Усилие", "value": "1500 кН", "icon": "zap"},
            {"label": "Масса", "value": "12.5 тонн", "icon": "weight"},
            {"label": "Шумность", "value": "68 дБ(А)", "icon": "ruler"}
        ]
    },
    {
        "id": "pve-2316",
        "name": "PVE 2316 VM",
        "category": 3,
        "category_label": "Вибропогружатель",
        "description": "Высокочастотный вибропогружатель с переменным статическим моментом. Безопасен для городской застройки.",
        "accent_color": "purple",
        "specs": [
            {"label": "Стат. момент", "value": "0-23 кгм", "icon": "zap"},
            {"label": "Центроб. сила", "value": "1150 кН", "icon": "weight"},
            {"label": "Амплитуда", "value": "16 мм", "icon": "ruler"}
        ]
    },
    {
        "id": "manitowoc-222",
        "name": "Manitowoc 222",
        "category": 3,
        "category_label": "Гусеничный кран",
        "description": "Надежный гусеничный кран для вспомогательных работ на стройплощадке и погружения шпунта с вибропогружателем.",
        "accent_color": "teal",
        "specs": [
            {"label": "Грузоподъем.", "value": "100 тонн", "icon": "weight"},
            {"label": "Длина стрелы", "value": "61 метр", "icon": "ruler"},
            {"label": "Скорость", "value": "1.5 км/ч", "icon": "zap"}
        ]
    },
    {
        "id": "inteco-e6050",
        "name": "Inteco E6050",
        "category": 1, # Drilling
        "category_label": "Буровая установка",
        "description": "Компактная и мощная буровая установка итальянского производства для работы в ограниченном пространстве.",
        "accent_color": "indigo",
        "specs": [
            {"label": "Крутящий момент", "value": "60 кНм", "icon": "zap"},
            {"label": "Масса", "value": "18.5 тонн", "icon": "weight"},
            {"label": "Ширина базы", "value": "2.3 м", "icon": "ruler"}
        ]
    }
]

for item in missing_machinery:
    # Check if item exists (by name to be safe since ids might be numeric in DB)
    check = api("GET", f"/items/machinery?filter[name][_eq]={item['name']}")
    if check.status_code == 200 and check.json().get("data"):
        print(f"  ⏭  Item '{item['name']}' already exists")
        continue

    # 1. Create specs first and collect their IDs
    spec_ids = []
    for spec in item["specs"]:
        s_res = api("POST", "/items/machinery_specs", spec)
        if s_res.status_code in (200, 201):
            spec_ids.append(s_res.json()["data"]["id"])
        else:
            print(f"  ❌ Failed to create spec: {spec['label']}")

    # 2. Create Machinery Item
    m_data = {
        "name": item["name"],
        "category": item["category"],
        "category_label": item["category_label"],
        "description": item["description"],
        "accent_color": item["accent_color"],
        "specs": spec_ids
    }
    m_res = api("POST", "/items/machinery", m_data)
    if m_res.status_code in (200, 201):
        print(f"  ✅ Created Machinery: {item['name']}")
    else:
        print(f"  ❌ Failed Machinery: {item['name']} - {m_res.text}")

print("\n✅ Seeding complete!")
