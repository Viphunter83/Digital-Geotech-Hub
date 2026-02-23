import requests
import json
import os
from dotenv import load_dotenv

load_dotenv('../../.env')

DIRECTUS_URL = "https://terra-expert.ru/directus"
email = os.getenv('ADMIN_EMAIL', 'admin@geotech.io')
password = os.getenv('ADMIN_PASSWORD', 'admin-password')
PUBLIC_POLICY_ID = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"

def get_token():
    res = requests.post(f"{DIRECTUS_URL}/auth/login", json={"email": email, "password": password})
    if not res.ok: raise Exception(f"Login failed: {res.text}")
    return res.json()['data']['access_token']

def secure_permissions(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # Needs to be secured (API should not allow public reads)
    sensitive = ['clients', 'leads', 'audit_history']
    
    # 1. Get all public permissions
    res = requests.get(f"{DIRECTUS_URL}/permissions?filter[policy][_eq]={PUBLIC_POLICY_ID}&limit=-1", headers=headers)
    perms = res.json().get("data", [])
    
    for p in perms:
        if p["collection"] in sensitive and p["action"] == "read":
            print(f"Revoking PUBLIC READ access for {p['collection']} (Perm ID: {p['id']})")
            del_res = requests.delete(f"{DIRECTUS_URL}/permissions/{p['id']}", headers=headers)
            if del_res.ok:
                print("  => Successfully revoked.")
            else:
                print("  => Failed to revoke:", del_res.text)

if __name__ == "__main__":
    token = get_token()
    secure_permissions(token)
    print("Security audit fixes applied!")
