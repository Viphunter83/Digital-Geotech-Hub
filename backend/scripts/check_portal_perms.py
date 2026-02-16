import httpx
import json

BASE = "http://localhost:8055"

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
        r.raise_for_status()
        return r.json()["data"]["access_token"]
    except: return None

TOKEN = get_token()
if not TOKEN:
    print("Could not login")
else:
    headers = {"Authorization": f"Bearer {TOKEN}"}
    r = httpx.get(f"{BASE}/permissions", headers=headers)
    if r.status_code == 200:
        perms = r.json()["data"]
        policy_id = "abf8a154-5b1c-4a46-ac9c-7300570f4f17" # Public policy from fix script
        
        print(f"Permissions for Public Policy ({policy_id}):")
        for p in perms:
            if p.get("policy") == policy_id and p.get("action") == "read":
                print(f"  ✅ {p['collection']}: read")
                
        # Specifically check our portal collections
        portal_colls = ["clients", "projects", "audit_history"]
        active_perms = [p["collection"] for p in perms if p.get("policy") == policy_id and p.get("action") == "read"]
        for pc in portal_colls:
            if pc not in active_perms:
                print(f"  ❌ {pc}: PERMISSION MISSING")
    else:
        print(f"Error: {r.status_code}")
