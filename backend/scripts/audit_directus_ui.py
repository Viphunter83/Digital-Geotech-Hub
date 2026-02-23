import requests
import json
import os

DIRECTUS_URL = "http://localhost:8055"
TOKEN = "test_token_if_needed"  # Use admin credentials if needed, but we can bypass if we hit DB directly, or use directus static API. Wait, I can just use the DB directly for reading directus schemas.

import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    # Use standard docker env or localhost proxy if running on host
    # Host port for postgres in geotech_db is not exposed.
    pass

# Directus is exposed at 8055. Let's try to authenticate or use public if available.
# We don't have the admin password in the script easily. Let's read from .env
from dotenv import load_dotenv
load_dotenv('../../.env')

email = os.getenv('ADMIN_EMAIL', 'admin@terra-expert.ru')
password = os.getenv('ADMIN_PASSWORD', 'admin')

def audit():
    try:
        res = requests.post(f"{DIRECTUS_URL}/auth/login", json={"email": email, "password": password})
        if not res.ok:
            print("Login failed:", res.text)
            return
        token = res.json()['data']['access_token']
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch collections
        col_res = requests.get(f"{DIRECTUS_URL}/collections", headers=headers).json()['data']
        # Fetch fields
        fld_res = requests.get(f"{DIRECTUS_URL}/fields", headers=headers).json()['data']
        
        print("=== DIRECTUS UX AUDIT REPORT ===")
        print("\n--- 1. SLUG AUTOMATION CHECK ---")
        for f in fld_res:
            if f['field'] == 'slug':
                collection = f['collection']
                meta = f.get('meta') or {}
                options = meta.get('options') or {}
                template = options.get('template')
                if not template:
                    print(f"[WARNING] Collection '{collection}' has a 'slug' field, but no auto-generation template is set!")
                else:
                    print(f"[OK] Collection '{collection}' slug auto-generates from: {template}")
                if meta.get('interface') != 'input':
                    print(f"[WARNING] Collection '{collection}' slug field does not use the standard 'input' interface.")
                
        
        print("\n--- 2. COLLECTION UX CONFIGURATION ---")
        system_collections = [c['collection'] for c in col_res if c['collection'].startswith('directus_')]
        for c in col_res:
            name = c['collection']
            if name in system_collections: continue
            meta = c.get('meta') or {}
            
            issues = []
            if not meta.get('icon'):
                issues.append("Missing Icon")
            if not meta.get('note'):
                issues.append("Missing Description (Note)")
            if not meta.get('display_template'):
                issues.append("Missing Display Template (Items will show as IDs in relations)")
            
            if issues:
                print(f"[ISSUE] Collection '{name}': {', '.join(issues)}")
            else:
                print(f"[OK] Collection '{name}' looks well-configured.")
                
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    audit()
