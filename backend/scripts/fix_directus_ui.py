import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('../../.env')

DIRECTUS_URL = "https://terra-expert.ru/directus"
email = os.getenv('ADMIN_EMAIL', 'admin@geotech.io')
password = os.getenv('ADMIN_PASSWORD', 'admin-password')

def get_token():
    res = requests.post(f"{DIRECTUS_URL}/auth/login", json={"email": email, "password": password})
    if not res.ok: raise Exception(f"Login failed: {res.text}")
    return res.json()['data']['access_token']

def fix_slugs(headers):
    # Mapping of collection -> property to use for slug
    slug_targets = {
        'article_categories': 'name',
        'articles': 'title',
        'cases': 'title',
        'machinery': 'name',
        'services': 'title'
    }
    
    for collection, target_field in slug_targets.items():
        # Update the field meta
        payload = {
            "meta": {
                "interface": "input",
                "options": {
                    "slug": True,
                    "trim": True,
                    "template": f"{{{{{target_field}}}}}"  # e.g. {{title}}
                },
                "readonly": False,
                "note": "Автоматически генерируется из заголовка/названия. Можно редактировать вручную."
            }
        }
        res = requests.patch(f"{DIRECTUS_URL}/fields/{collection}/slug", headers=headers, json=payload)
        if res.ok:
            print(f"[FIXED SLUG] {collection} -> auto-generates from {target_field}")
        else:
            print(f"[ERROR SLUG] {collection}: {res.text}")

def fix_collections(headers):
    # Common mappings
    display_targets = {
        'advantages': 'title',
        'company_stats': 'label',
        'company_values': 'title',
        'geology_points': 'name',
        'hero_badges': 'label',
        'hero_configs': 'title',
        'machinery_specs': 'label',
        'project_stats': 'label',
        'project_tags': 'tag',
        'project_technologies': 'name',
        'projects_machinery': 'id', # association table
        'service_features': 'title',
        'sheet_pile_series': 'name',
        'sheet_piles': 'name'
    }
    
    for coll, target in display_targets.items():
        payload = {
            "meta": {
                "display_template": f"{{{{{target}}}}}"
            }
        }
        # Special case: projects_machinery mapping
        if coll == "projects_machinery":
            payload["meta"]["display_template"] = "{{projects_id.title}} - {{machinery_id.name}}"
            
        res = requests.patch(f"{DIRECTUS_URL}/collections/{coll}", headers=headers, json=payload)
        if res.ok:
            print(f"[FIXED DISPLAY TEMPLATE] {coll} -> {payload['meta']['display_template']}")
        else:
            print(f"[ERROR DISPLAY TEMPLATE] {coll}: {res.text}")
            
    # Add beautiful notes where missing
    notes = {
        'advantages': 'Главные преимущества компании (блок на главной)',
        'article_categories': 'Категории для блога/статей',
        'articles': 'Статьи и новости блога компании',
        'cases': 'Кейсы (старый формат, использовать projects)',
        'company_stats': 'Статистика компании в цифрах',
        'company_values': 'Корпоративные ценности Terra Expert',
        'faq': 'Часто задаваемые вопросы',
        'hero_configs': 'Настройки главного экрана (заголовки, текст)',
        'machinery_categories': 'Категории спецтехники',
        'machinery_specs': 'Характеристики конкретной техники',
        'project_stats': 'Ключевые показатели проекта',
        'project_tags': 'Теги для проектов',
        'project_technologies': 'Технологии, применяемые в проектах',
        'service_features': 'Уникальные особенности услуги',
        'sheet_pile_series': 'Серии шпунта (Ларсен)',
        'sheet_piles': 'Конкретные профили шпунта',
        'shpunts': 'Каталог продаваемого шпунта'
    }
    
    for coll, note in notes.items():
        payload = {"meta": {"note": note}}
        res = requests.patch(f"{DIRECTUS_URL}/collections/{coll}", headers=headers, json=payload)
        if res.ok:
            print(f"[FIXED NOTE] {coll} -> {note}")
        else:
            print(f"[ERROR NOTE] {coll}: {res.text}")

if __name__ == "__main__":
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    fix_slugs(headers)
    fix_collections(headers)
    print("Done!")
