import httpx
import sys
import uuid

BASE = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

MANAGER_EMAIL = "manager@geotech-hub.ru"
MANAGER_PASSWORD = "manager-password-2026" # User can change this later

def get_token():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        return r.json()["data"]["access_token"]
    except: return None

token = get_token()
if not token:
    print("Login failed")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# 1. Get Admin Role ID
r_roles = httpx.get(f"{BASE}/roles", headers=headers)
admin_role = next((r for r in r_roles.json()["data"] if r["name"] == "Administrator"), None)
if not admin_role:
    print("Admin role not found")
    sys.exit(1)

role_id = admin_role["id"]

# 2. Check if user already exists
r_users = httpx.get(f"{BASE}/users?filter[email][_eq]={MANAGER_EMAIL}", headers=headers)
if r_users.json()["data"]:
    print(f"User {MANAGER_EMAIL} already exists. Updating role...")
    user_id = r_users.json()["data"][0]["id"]
    httpx.patch(f"{BASE}/users/{user_id}", headers=headers, json={"role": role_id})
else:
    print(f"Creating user {MANAGER_EMAIL}...")
    r_create = httpx.post(f"{BASE}/users", headers=headers, json={
        "first_name": "Manager",
        "last_name": "Geotech",
        "email": MANAGER_EMAIL,
        "password": MANAGER_PASSWORD,
        "role": role_id,
        "status": "active"
    })
    if r_create.status_code == 200:
        print("✅ User created successfully")
    else:
        print(f"❌ Failed to create user: {r_create.text}")
