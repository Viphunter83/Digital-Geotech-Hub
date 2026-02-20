import asyncio
import httpx
import sys
import os

DIRECTUS_URL = os.getenv("DIRECTUS_URL", "http://155.212.209.113:8055")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@geotech.io")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin-password")

async def seed_data():
    print(f"Connecting to Directus at {DIRECTUS_URL}...")
    
    async with httpx.AsyncClient(base_url=DIRECTUS_URL, timeout=30.0) as client:
        # Authenticate
        try:
             auth_res = await client.post("/auth/login", json={
                 "email": ADMIN_EMAIL,
                 "password": ADMIN_PASSWORD
             })
             if auth_res.status_code != 200:
                 print(f"Login failed: {auth_res.text}")
                 return
             
             token = auth_res.json()["data"]["access_token"]
             client.headers["Authorization"] = f"Bearer {token}"
             print("✅ Authenticated")
        except Exception as e:
            print(f"Auth error: {e}")
            return

        async def upsert(collection, item, lookup_field='id'):
            lookup_value = item.get(lookup_field)
            try:
                res = await client.get(f"/items/{collection}", params={f"filter[{lookup_field}][_eq]": lookup_value})
                if res.status_code == 200 and res.json()['data']:
                    existing_item = res.json()['data'][0]
                    existing_id = existing_item['id']
                    res = await client.patch(f"/items/{collection}/{existing_id}", json=item)
                    return existing_id
                
                res = await client.post(f"/items/{collection}", json=item)
                if res.status_code in [200, 201]:
                    return res.json()['data']['id']
                else:
                    print(f"  ❌ Error creating {collection} ({lookup_value}): {res.text}")
            except Exception as e:
                print(f"  ❌ Exception in {collection} ({lookup_value}): {e}")
            return None

        async def upsert_singleton(collection, data):
            print(f"  Processing singleton {collection}...")
            try:
                # Directus singletons: try patching first
                res = await client.patch(f"/items/{collection}", json=data)
                if res.status_code in [200, 204]:
                    print(f"    ✅ Updated singleton {collection}")
                    return True
                
                # If patch fails (possibly empty), try POST
                res = await client.post(f"/items/{collection}", json=data)
                if res.status_code in [200, 201, 204]:
                    print(f"    ✅ Initialized singleton {collection}")
                    return True
                print(f"    ❌ Error with singleton {collection}: {res.text}")
            except Exception as e:
                print(f"    ❌ Exception in singleton {collection}: {e}")
            return False

        # 1. Site Settings
        print("\n[1/7] Seeding Site Settings...")
        await upsert_singleton("site_settings", {
            "meta_title": "Terra Expert | B2B Инженерные решения",
            "meta_description": "B2B-платформа для строительной компании Terra Expert. Погружение шпунта, аренда спецтехники, AI-расчет смет."
        })

        # 2. About Page
        print("[2/7] Seeding About Page...")
        await upsert_singleton("about_page", {
            "mission_title": "Наша миссия — Превосходить ожидания рынка",
            "mission_text": "<p>За 15 лет работы мы прошли путь от небольшой подрядной организации до одного из лидеров отрасли шпунтовых и свайных работ в России.</p>",
            "history_text": "Основанная экспертами в области геотехники, наша компания объединила передовой мировой опыт."
        })

        # 3. Company Info
        print("[3/7] Seeding Company Info...")
        await upsert_singleton("company_info", {
            "phone": "+7 (921) 884-44-03",
            "email": "drilling.rigs.info@yandex.ru",
            "address": "Санкт-Петербург, тер. промзона Парнас",
            "work_hours": "Пн-Пт: 09:00 - 20:00 (МСК)",
            "map_link": "https://yandex.ru/maps/?text=60.062108,30.375741"
        })

        # 4. Project Tags
        print("[4/7] Seeding Project Tags...")
        tags = ["Giken", "Статическое вдавливание", "Шпунт Ларсена", "Геомониторинг", "Сваи-оболочки", "PVE", "Junttan", "Берегоукрепление", "Bauer BG", "Kelly бурение", "Москва-Сити", "Свайный фундамент"]
        for t in tags:
            await upsert('project_tags', {"tag": t}, 'tag')

        # 5. Project Technologies
        print("[5/7] Seeding Project Technologies...")
        techs = [
            {"name": "Giken Silent Piler F201", "type": "Оборудование", "description": "Установка статического вдавливания."},
            {"name": "Шпунт Ларсена AZ 48", "type": "Материал", "description": "Высокопрочный стальной шпунт."},
            {"name": "PVE 2316 VM", "type": "Оборудование", "description": "Высокочастотный вибропогружатель."},
            {"name": "Junttan PM 25", "type": "Оборудование", "description": "Универсальный копер."},
            {"name": "Bauer BG 28", "type": "Оборудование", "description": "Буровая установка."},
            {"name": "Kelly-бурение", "type": "Технология", "description": "Метод циклического бурения."},
            {"name": "Лидерное бурение", "type": "Метод", "description": "Предварительное бурение."},
            {"name": "Берегоукрепление", "type": "Технология", "description": "Защита береговой линии."}
        ]
        for t in techs:
            await upsert('project_technologies', t, 'name')

        # 6. Project Stats
        print("[6/7] Seeding Project Stats...")
        stats_data = [
            {"label": "Глубина", "value": "24 м", "sort": 1},
            {"label": "Шпунт", "value": "1250 тонн", "sort": 2},
            {"label": "Срок", "value": "6 мес.", "sort": 3},
            {"label": "Точность", "value": "±5 мм", "sort": 4},
            {"label": "Диаметр", "value": "1420 мм", "sort": 5},
            {"label": "Кол-во свай", "value": "450 шт.", "sort": 6},
            {"label": "Бетон", "value": "12500 м³", "sort": 7}
        ]
        for s in stats_data:
            await upsert('project_stats', s, 'label')

        # 7. Cases
        print("[7/7] Seeding Cases...")
        cases = [
            {
                "title": "МФК «Лахта Центр 2»",
                "slug": "lakhta-2",
                "date_completed": "2024-06-01",
                "latitude": 59.9871,
                "longitude": 30.1776,
                "geo_location": {
                    "type": "Point",
                    "coordinates": [30.1776, 59.9871]
                }
            },
            {
                "title": "Портовый комплекс в Усть-Луге",
                "slug": "ust-luga",
                "date_completed": "2023-10-15",
                "latitude": 59.6833,
                "longitude": 28.4333,
                "geo_location": {
                    "type": "Point",
                    "coordinates": [28.4333, 59.6833]
                }
            }
        ]
        for c in cases:
            await upsert('cases', c, 'slug')

        print("\n✅ PHASE 2 RESTORATION COMPLETE!")

if __name__ == "__main__":
    asyncio.run(seed_data())
