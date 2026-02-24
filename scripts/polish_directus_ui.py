import httpx
import json

BASE = "https://terra-expert.ru/directus"
TOKEN = "backend-admin-token-qW2eR3tY4"
headers = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

COLLECTIONS_CONFIG = {
    # CONTENT Group
    "hero_configs": {"name": "Контент: Слайдер Hero", "icon": "view_carousel", "group": "content"},
    "about_page": {"name": "Контент: О компании", "icon": "info", "group": "content"},
    "advantages": {"name": "Контент: Преимущества", "icon": "star", "group": "content"},
    "faq": {"name": "Контент: FAQ", "icon": "help", "group": "content"},
    "articles": {"name": "Контент: Статьи", "icon": "article", "group": "content"},
    "hero_badges": {"name": "Контент: Значки Hero", "icon": "diamond", "group": "content"},
    
    # CATALOG Group
    "services": {"name": "Каталог: Услуги", "icon": "handyman", "group": "catalog"},
    "service_features": {"name": "Каталог: Особенности услуг", "icon": "list", "group": "catalog"},
    "machinery": {"name": "Каталог: Спецтехника", "icon": "precision_manufacturing", "group": "catalog"},
    "machinery_categories": {"name": "Каталог: Категории техники", "icon": "folder", "group": "catalog"},
    "sheet_pile_series": {"name": "Каталог: Серии шпунтов", "icon": "inventory_2", "group": "catalog"},
    "sheet_piles": {"name": "Каталог: Модели шпунтов", "icon": "format_list_bulleted", "group": "catalog"},
    
    # CRM Group
    "projects": {"name": "CRM: Проекты", "icon": "business_center", "group": "crm"},
    "clients": {"name": "CRM: Клиенты B2B", "icon": "people", "group": "crm"},
    "leads": {"name": "CRM: Заявки (Лиды)", "icon": "contact_mail", "group": "crm"},
    "audit_history": {"name": "CRM: История Аудитов", "icon": "restore", "group": "crm"},
    
    # SYSTEM Group
    "site_settings": {"name": "Настройки сайта", "icon": "settings", "group": "system"},
    "shpunts": {"name": "Склад и Цены (AI)", "icon": "storage", "group": "system"},
}

GROUPS = {
    "content": "[КОНТЕНТ] Наполнение сайта",
    "catalog": "[КАТАЛОГ] Оборудование и услуги",
    "crm": "[БИЗНЕС] Проекты и Заявки",
    "system": "[СИСТЕМА] Настройки",
}

def apply_ui():
    # 1. Create Folders (Groups)
    for group_id, group_name in GROUPS.items():
        print(f"Checking folder {group_id}...")
        payload = {
            "collection": group_id,
            "meta": {
                "icon": "folder",
                "translations": [{"language": "ru-RU", "translation": group_name}],
                "hidden": False
            },
            "schema": None
        }
        # Try to create, if exists it might fail (that's fine)
        httpx.post(f"{BASE}/collections", headers=headers, json=payload)
    
    # 2. Update collections
    for coll, config in COLLECTIONS_CONFIG.items():
        print(f"Updating {coll}...")
        payload = {
            "meta": {
                "translations": [{"language": "ru-RU", "translation": config["name"]}],
                "icon": config["icon"],
                "group": config["group"]
            }
        }
        res = httpx.patch(f"{BASE}/collections/{coll}", headers=headers, json=payload)
        if res.status_code == 200:
            print(f"✅ {coll} updated.")
        else:
            print(f"❌ {coll} failed: {res.status_code} {res.text}")

if __name__ == "__main__":
    apply_ui()
