import asyncio
import httpx
import sys
import os

# Add backend directory to path to import settings
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.config import settings

async def seed_data():
    print(f"Connecting to Directus at {settings.DIRECTUS_URL}...")
    
    async with httpx.AsyncClient(base_url=settings.DIRECTUS_URL) as client:
        # Authenticate
        try:
             auth_res = await client.post("/auth/login", json={
                 "email": settings.ADMIN_EMAIL,
                 "password": settings.ADMIN_PASSWORD
             })
             if auth_res.status_code != 200:
                 print(f"Login failed: {auth_res.text}")
                 return
             
             token = auth_res.json()["data"]["access_token"]
             client.headers["Authorization"] = f"Bearer {token}"
        except Exception as e:
            print(f"Auth error: {e}")
            return

        # ---------------------------------------------------------
        # 1. Shpunts (Simple collection)
        # ---------------------------------------------------------
        shpunts = [
            {"name": "Л5-УМ", "price": 155000, "stock_quantity": 1200, "profile": "L5-UM"},
            {"name": "Л4", "price": 142000, "stock_quantity": 800, "profile": "L4"},
            {"name": "AZ-18-700", "price": 185000, "stock_quantity": 450, "profile": "AZ-18"},
            {"name": "VL606A", "price": 160000, "stock_quantity": 300, "profile": "VL606"},
        ]
        
        print("\nSeeding Shpunts...")
        for item in shpunts:
            try:
                res = await client.get("/items/shpunts", params={"filter[name][_eq]": item["name"]})
                if res.status_code == 200 and len(res.json()['data']) > 0:
                     print(f"  Skipping {item['name']} (already exists)")
                else:
                    await client.post("/items/shpunts", json=item)
                    print(f"  Created {item['name']}")
            except Exception as e:
                print(f"  Error creating {item['name']}: {e}")

        # ---------------------------------------------------------
        # 2. Machinery Categories (Relation Reference)
        # ---------------------------------------------------------
        categories = ["Буровые установки", "Копровые установки", "Вибропогружатели"]
        category_map = {} # Name -> ID

        print("\nSeeding Machinery Categories...")
        for cat_name in categories:
            try:
                # Assuming collection name is 'machinery_categories' and field is 'name'
                # We need to verify field name, usually it is 'name' or 'title'. 
                # Let's try 'name'.
                res = await client.get("/items/machinery_categories", params={"filter[name][_eq]": cat_name})
                
                cat_id = None
                if res.status_code == 200 and len(res.json()['data']) > 0:
                     cat_data = res.json()['data'][0]
                     cat_id = cat_data['id']
                     print(f"  Found category {cat_name} (ID: {cat_id})")
                else:
                    # Create
                    post_res = await client.post("/items/machinery_categories", json={"name": cat_name})
                    if post_res.status_code in [200, 201]:
                        cat_data = post_res.json()['data']
                        cat_id = cat_data['id']
                        print(f"  Created category {cat_name} (ID: {cat_id})")
                    else:
                        print(f"  Failed to create category {cat_name}: {post_res.text}")
                
                if cat_id:
                    category_map[cat_name] = cat_id
            except Exception as e:
                print(f"  Error processing category {cat_name}: {e}")

        # ---------------------------------------------------------
        # 3. Machinery (Uses Category IDs)
        # ---------------------------------------------------------
        machinery = [
            {"name": "Bauer BG 28", "category": "Буровые установки", "status": "Available", "description": "Роторная буровая установка для свай больших диаметров"},
            {"name": "Casagrande B125", "category": "Буровые установки", "status": "In Use", "description": "Компактная установка для стесненных условий"},
            {"name": "Liebherr LRB 355", "category": "Копровые установки", "status": "Available", "description": "Универсальная машина для забивки и вибропогружения"},
            {"name": "Movax SG-75", "category": "Вибропогружатели", "status": "Available", "description": "Боковой захват для экскаватора"},
        ]
        
        print("\nSeeding Machinery...")
        for item in machinery:
             cat_name = item.pop("category")
             cat_id = category_map.get(cat_name)
             
             if not cat_id:
                 print(f"  Skipping {item['name']}: Category '{cat_name}' not found/created.")
                 continue
             
             item["category"] = cat_id

             try:
                res = await client.get("/items/machinery", params={"filter[name][_eq]": item["name"]})
                if res.status_code == 200 and len(res.json()['data']) > 0:
                     print(f"  Skipping {item['name']} (already exists)")
                else:
                    post_res = await client.post("/items/machinery", json=item)
                    if post_res.status_code in [200, 201]:
                        print(f"  Created {item['name']}")
                    else:
                        print(f"  Failed to create {item['name']}: {post_res.text}")
             except Exception as e:
                print(f"  Error creating {item['name']}: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
