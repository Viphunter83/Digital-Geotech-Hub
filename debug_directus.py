import httpx
import json

BASE = "http://localhost:8055"
TOKEN = "admin-password" 

def debug():
    with httpx.Client(base_url=BASE) as client:
        # Login
        lr = client.post("/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
        if lr.status_code != 200:
            print(f"Login failed: {lr.status_code}")
            return
        token = lr.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"
        # Check collections
        res = client.get("/collections")
        if res.status_code != 200:
            print(f"Error: {res.status_code}")
            return
        
        collections = [c["collection"] for c in res.json()["data"]]
        print(f"Collections: {collections}")
        
        for coll in ["projects", "cases", "cases_machinery", "shpunts"]:
            if coll in collections:
                print(f"\n--- {coll} Fields ---")
                fres = client.get(f"/fields/{coll}")
                if fres.status_code == 200:
                    for f in fres.json()["data"]:
                        print(f" - {f['field']} ({f['type']})")
                
                print(f"\n--- {coll} Sample Data ---")
                dres = client.get(f"/items/{coll}?limit=2&fields=*.*")
                if dres.status_code == 200:
                    data = dres.json()["data"]
                    print(json.dumps(data, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    debug()
