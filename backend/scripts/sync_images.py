import httpx
import os

# Config
PROD_URL = "https://terra-expert.ru/directus"
PROD_ADMIN = {"email": "manager@geotech-hub.ru", "password": "admin-password"}

# Base paths
BASE_MACHINERY = "/Users/apple/Terra Expert/frontend/public/images/machinery"
BASE_ASSETS = "/Users/apple/Terra Expert/frontend/public/assets"

# Mapping: Prod Machine Name -> Local File Path
m_mapping = {
    "Bauer BG 28": f"{BASE_MACHINERY}/bauer_bg28.png",
    "Casagrande B125": f"{BASE_ASSETS}/machinery-casagrande.png",
    "Liebherr LRB 355": f"{BASE_MACHINERY}/enteco_e400.png", # Fallback
    "Movax SG-75": f"{BASE_ASSETS}/machinery-movax.png",
    "Giken Silent Piler": f"{BASE_MACHINERY}/giken_silent_piler.png",
    "PVE 2316 VM": f"{BASE_MACHINERY}/pve_2316.png",
    "Manitowoc 222": f"{BASE_MACHINERY}/manitowoc_222.png",
    "Inteco E6050": f"{BASE_MACHINERY}/inteco_e6050.png"
}

def get_token(url, creds):
    try:
        r = httpx.post(f"{url}/auth/login", json=creds, timeout=10)
        return r.json()["data"]["access_token"]
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def upload_file(url, token, file_path):
    if not os.path.exists(file_path):
        print(f"  ⚠️ File not found: {file_path}")
        return None
    
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": (os.path.basename(file_path), open(file_path, "rb"), "image/png")}
    
    try:
        r = httpx.post(f"{url}/files", headers=headers, files=files, timeout=30)
        if r.status_code == 200:
            return r.json()["data"]["id"]
        else:
            print(f"  ❌ Upload failed: {r.status_code} {r.text}")
            return None
    except Exception as e:
        print(f"  ❌ Error uploading: {e}")
        return None

def sync_images():
    token = get_token(PROD_URL, PROD_ADMIN)
    if not token: return
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    # Get machinery from production
    res = httpx.get(f"{PROD_URL}/items/machinery", headers=headers)
    items = res.json()["data"]

    for i in items:
        name = i["name"]
        if name in m_mapping:
            print(f"🖼️ Syncing image for {name}...")
            file_path = m_mapping[name]
            file_id = upload_file(PROD_URL, token, file_path)
            
            if file_id:
                upd = httpx.patch(f"{PROD_URL}/items/machinery/{i['id']}", headers=headers, json={"image": file_id})
                print(f"  ✅ Updated item {i['id']} with file {file_id} -> {upd.status_code}")
            else:
                print(f"  ❌ No file ID for {name}")
        else:
            print(f"  ⚠️ No mapping for {name}")

if __name__ == "__main__":
    sync_images()
