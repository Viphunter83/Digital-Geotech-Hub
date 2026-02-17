import httpx

DIRECTUS_URL = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"

def run():
    with httpx.Client(base_url=DIRECTUS_URL) as client:
        # Auth
        res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        token = res.json()["data"]["access_token"]
        client.headers["Authorization"] = f"Bearer {token}"

        # 1. Update site_settings singleton
        client.patch("/items/site_settings", json={
            "site_name": "Digital Geotech Hub",
            "meta_title": "Digital Geotech Hub | B2B Инженерные решения",
            "meta_description": "B2B-платформа для строительной компании ГеоТехнологии. Погружение шпунта, аренда спецтехники, AI-расчет смет."
        })
        print("✅ Seeded site_settings")

        # 2. Update about_page singleton
        client.patch("/items/about_page", json={
            "mission_title": "Превосходить ожидания рынка",
            "mission_text": "Наша специализация — сложные проекты в условиях сверхплотной городской застройки, где требуются исключительная точность и деликатность.",
            "history_text": "За 15 лет работы мы прошли путь от небольшой подрядной организации до одного из лидеров отрасли шпунтовых и свайных работ в России."
        })
        print("✅ Seeded about_page")

        # 3. Mark featured services
        services = client.get("/items/services").json().get("data", [])
        for s in services[:4]: # Mark first 4 as featured
            client.patch(f"/items/services/{s['id']}", json={"featured": True})
        print("✅ Updated featured services")

        # 4. Mark machinery for home
        machines = client.get("/items/machinery").json().get("data", [])
        for m in machines[:3]: # Mark first 3 for home
            client.patch(f"/items/machinery/{m['id']}", json={"show_on_home": True})
        print("✅ Updated home machinery")

if __name__ == "__main__":
    run()
