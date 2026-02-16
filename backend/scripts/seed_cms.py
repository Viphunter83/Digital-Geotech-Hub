#!/usr/bin/env python3
"""
Comprehensive CMS Seed Script
Creates all Directus collections and seeds fallback data.
Run: python3 backend/scripts/seed_cms.py
"""

import httpx
import json
import sys
import time

DIRECTUS_URL = "http://localhost:8055"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin-password"


def auth(client: httpx.Client) -> str:
    """Authenticate and return access token."""
    res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if res.status_code != 200:
        print(f"❌ Auth failed: {res.text}")
        sys.exit(1)
    token = res.json()["data"]["access_token"]
    client.headers["Authorization"] = f"Bearer {token}"
    print("✅ Authenticated")
    return token


def collection_exists(client: httpx.Client, name: str) -> bool:
    """Check if a collection exists."""
    res = client.get(f"/collections/{name}")
    return res.status_code == 200


def create_collection(client: httpx.Client, name: str, fields: list, meta: dict = None):
    """Create a collection with fields if it doesn't exist."""
    if collection_exists(client, name):
        print(f"  ⏭️  Collection '{name}' already exists")
        return

    payload = {
        "collection": name,
        "meta": meta or {"icon": "box", "note": None, "singleton": False},
        "schema": {},
        "fields": [
            {"field": "id", "type": "integer", "schema": {"is_primary_key": True, "has_auto_increment": True}, "meta": {"hidden": True}},
            *fields
        ]
    }
    res = client.post("/collections", json=payload)
    if res.status_code in [200, 201]:
        print(f"  ✅ Created collection '{name}'")
    else:
        print(f"  ❌ Failed to create '{name}': {res.status_code} — {res.text[:200]}")


def create_collection_string_pk(client: httpx.Client, name: str, fields: list, meta: dict = None):
    """Create a collection with a string primary key."""
    if collection_exists(client, name):
        print(f"  ⏭️  Collection '{name}' already exists")
        return

    payload = {
        "collection": name,
        "meta": meta or {"icon": "box"},
        "schema": {},
        "fields": [
            {"field": "id", "type": "string", "schema": {"is_primary_key": True}, "meta": {"width": "half", "interface": "input"}},
            *fields
        ]
    }
    res = client.post("/collections", json=payload)
    if res.status_code in [200, 201]:
        print(f"  ✅ Created collection '{name}' (string PK)")
    else:
        print(f"  ❌ Failed to create '{name}': {res.status_code} — {res.text[:200]}")


def create_singleton(client: httpx.Client, name: str, fields: list):
    """Create a singleton collection."""
    if collection_exists(client, name):
        print(f"  ⏭️  Singleton '{name}' already exists")
        return

    payload = {
        "collection": name,
        "meta": {"icon": "settings", "singleton": True},
        "schema": {},
        "fields": [
            {"field": "id", "type": "integer", "schema": {"is_primary_key": True, "has_auto_increment": True}, "meta": {"hidden": True}},
            *fields
        ]
    }
    res = client.post("/collections", json=payload)
    if res.status_code in [200, 201]:
        print(f"  ✅ Created singleton '{name}'")
    else:
        print(f"  ❌ Failed to create singleton '{name}': {res.status_code} — {res.text[:200]}")


def seed_items(client: httpx.Client, collection: str, items: list, unique_field: str = None):
    """Seed items into a collection, skipping duplicates if unique_field is specified."""
    created = 0
    skipped = 0
    for item in items:
        try:
            if unique_field and unique_field in item:
                check = client.get(f"/items/{collection}", params={f"filter[{unique_field}][_eq]": item[unique_field]})
                if check.status_code == 200 and len(check.json().get("data", [])) > 0:
                    skipped += 1
                    continue

            res = client.post(f"/items/{collection}", json=item)
            if res.status_code in [200, 201]:
                created += 1
            else:
                print(f"    ⚠️  Failed to seed into {collection}: {res.status_code} — {res.text[:150]}")
        except Exception as e:
            print(f"    ⚠️  Error: {e}")

    print(f"  📦 {collection}: {created} created, {skipped} skipped")


# ═══════════════════════════════════════════════
# Field Helpers
# ═══════════════════════════════════════════════

def f_string(name, note=None, width="full", interface="input", required=False):
    return {"field": name, "type": "string", "meta": {"interface": interface, "width": width, "note": note, "required": required}, "schema": {}}

def f_text(name, note=None, interface="input-multiline"):
    return {"field": name, "type": "text", "meta": {"interface": interface, "note": note}, "schema": {}}

def f_wysiwyg(name, note=None):
    return {"field": name, "type": "text", "meta": {"interface": "input-rich-text-html", "note": note}, "schema": {}}

def f_integer(name, note=None, width="half"):
    return {"field": name, "type": "integer", "meta": {"interface": "input", "width": width, "note": note}, "schema": {}}

def f_float(name, note=None, width="half"):
    return {"field": name, "type": "float", "meta": {"interface": "input", "width": width, "note": note}, "schema": {}}

def f_status():
    return {"field": "status", "type": "string", "meta": {"interface": "select-dropdown", "options": {"choices": [{"text": "Draft", "value": "draft"}, {"text": "Published", "value": "published"}]}, "width": "half"}, "schema": {"default_value": "draft"}}

def f_sort():
    return {"field": "sort", "type": "integer", "meta": {"interface": "input", "hidden": True, "width": "half"}, "schema": {}}

def f_image(name="image", note=None):
    return {"field": name, "type": "uuid", "meta": {"interface": "file-image", "note": note, "special": ["file"]}, "schema": {}}

def f_datetime(name, note=None):
    return {"field": name, "type": "timestamp", "meta": {"interface": "datetime", "note": note, "width": "half"}, "schema": {}}

def f_dropdown(name, choices: list, note=None, width="half"):
    return {"field": name, "type": "string", "meta": {"interface": "select-dropdown", "width": width, "note": note, "options": {"choices": [{"text": c, "value": c.lower()} for c in choices]}}, "schema": {}}


# ═══════════════════════════════════════════════
# PHASE 1: Journal
# ═══════════════════════════════════════════════

def create_journal_collections(client):
    print("\n📰 Phase 1: Journal Collections")

    create_collection(client, "article_categories", [
        f_string("name", "Название категории", required=True),
        f_string("slug", "URL slug"),
        f_sort(),
    ], {"icon": "category", "sort_field": "sort"})

    create_collection(client, "articles", [
        f_status(),
        f_string("title", "Заголовок статьи", required=True),
        f_string("slug", "URL статьи", required=True),
        f_text("excerpt", "Краткое описание"),
        f_wysiwyg("content", "Текст статьи (WYSIWYG)"),
        f_image("image", "Обложка статьи"),
        f_string("author", "Автор", width="half"),
        f_string("read_time", "Время чтения", width="half"),
        f_datetime("date_published", "Дата публикации"),
        f_string("seo_title", "SEO заголовок"),
        f_text("seo_description", "SEO описание"),
        f_sort(),
    ], {"icon": "article", "sort_field": "sort"})


def seed_journal(client):
    print("\n📰 Seeding Journal...")

    categories = [
        {"name": "Технологии", "slug": "technologies", "sort": 1},
        {"name": "Кейсы", "slug": "cases", "sort": 2},
        {"name": "Аналитика", "slug": "analytics", "sort": 3},
    ]
    seed_items(client, "article_categories", categories, "slug")

    articles = [
        {
            "status": "published",
            "title": "Статическое вдавливание шпунта: полный гайд для инженеров",
            "slug": "static-pressing-foundation",
            "excerpt": "Разбираем технологию Silent Piler от GIKEN: принцип работы, преимущества перед вибропогружением, область применения в условиях плотной городской застройки Санкт-Петербурга.",
            "content": "<h2>Принцип работы технологии Silent Piler</h2><p>Статическое вдавливание — метод погружения шпунта и свай без вибраций и ударов. Оборудование GIKEN использует реакцию от уже погружённых элементов для вдавливания следующих секций.</p>",
            "author": "Алексей Иванов",
            "read_time": "8 мин",
            "seo_title": "Статическое вдавливание шпунта в СПб — технология Silent Piler",
            "seo_description": "Профессиональный разбор метода статического вдавливания в условиях городской застройки",
            "sort": 1,
        },
        {
            "status": "published",
            "title": "CFA vs Kelly: какой метод бурения свай выбрать?",
            "slug": "cfa-vs-kelly-drilling",
            "excerpt": "Сравниваем две основные технологии буронабивных свай: непрерывный шнек (CFA) и бурение с обсадной трубой (Kelly). Когда что применять.",
            "content": "<h2>Технология CFA (Continuous Flight Auger)</h2><p>CFA — метод устройства буронабивных свай с использованием непрерывного шнека. Бетон подается через полый шнек одновременно с его извлечением.</p>",
            "author": "Дмитрий Петров",
            "read_time": "12 мин",
            "seo_title": "CFA vs Kelly бурение — сравнение технологий свай",
            "seo_description": "Сравнение методов CFA и Kelly бурения",
            "sort": 2,
        },
        {
            "status": "published",
            "title": "Геомониторинг при устройстве котлованов: от A до Z",
            "slug": "geomonitoring-guide",
            "excerpt": "Как организовать систему наблюдений при устройстве котлованов вблизи существующей застройки. Инклинометрия, геодезические марки, автоматизация.",
            "content": "<h2>Зачем нужен геомониторинг</h2><p>Геомониторинг — система наблюдений за деформациями окружающей застройки и самих конструкций в процессе строительства.</p>",
            "author": "Евгений Сидоров",
            "read_time": "6 мин",
            "seo_title": "Геомониторинг котлованов — полное руководство",
            "seo_description": "Организация системы геомониторинга при строительстве в городе",
            "sort": 3,
        },
    ]
    seed_items(client, "articles", articles, "slug")


# ═══════════════════════════════════════════════
# PHASE 2: Catalogs
# ═══════════════════════════════════════════════

def create_catalog_collections(client):
    print("\n🏗️ Phase 2: Catalog Collections")

    # Machinery specs (O2M from machinery)
    create_collection(client, "machinery_specs", [
        f_string("label", "Параметр", required=True),
        f_string("value", "Значение", required=True),
        f_string("icon", "Иконка (Lucide)", width="half"),
        f_sort(),
    ], {"icon": "tune", "sort_field": "sort"})

    # Sheet pile series
    create_collection_string_pk(client, "sheet_pile_series", [
        f_string("name", "Название серии"),
        f_sort(),
    ], {"icon": "view_column", "sort_field": "sort"})

    # Sheet piles
    create_collection_string_pk(client, "sheet_piles", [
        f_string("model", "Модель", required=True),
        f_integer("width", "Ширина (мм)"),
        f_integer("height", "Высота (мм)"),
        f_float("thickness", "Толщина (мм)"),
        f_float("weight", "Масса (кг/м)"),
        f_integer("moment", "Момент сопр. (см³/м)"),
    ], {"icon": "view_column"})

    # Service features (O2M from services)
    create_collection(client, "service_features", [
        f_string("text", "Описание фичи", required=True),
        f_sort(),
    ], {"icon": "check_circle", "sort_field": "sort"})


def seed_catalogs(client):
    print("\n🏗️ Seeding Catalogs...")

    # --- Machinery specs ---
    # First get existing machinery items
    res = client.get("/items/machinery", params={"fields": "id,name"})
    machinery_map = {}
    if res.status_code == 200:
        for m in res.json().get("data", []):
            machinery_map[m.get("name", "")] = m["id"]

    specs_data = {
        "Bauer BG 28": [
            {"label": "Крутящий момент", "value": "270 кНм", "icon": "zap", "sort": 1},
            {"label": "Глубина бурения", "value": "до 57 м", "icon": "arrow-down", "sort": 2},
            {"label": "Диаметр сваи", "value": "до 2500 мм", "icon": "circle", "sort": 3},
        ],
        "Junttan PM 25": [
            {"label": "Энергия удара", "value": "120 кДж", "icon": "zap", "sort": 1},
            {"label": "Масса молота", "value": "5,000–12,000 кг", "icon": "weight", "sort": 2},
        ],
    }

    for machine_name, specs in specs_data.items():
        machine_id = machinery_map.get(machine_name)
        if machine_id:
            for spec in specs:
                spec["machinery"] = machine_id
            seed_items(client, "machinery_specs", specs, "label")
        else:
            print(f"    ℹ️ Machinery '{machine_name}' not found, skipping specs")

    # --- Sheet pile series ---
    series = [
        {"id": "AZ", "name": "Arcelor AZ", "sort": 1},
        {"id": "AU", "name": "Arcelor AU", "sort": 2},
        {"id": "PU", "name": "Arcelor PU", "sort": 3},
    ]
    seed_items(client, "sheet_pile_series", series, "id")

    # --- Sheet piles ---
    piles = [
        {"id": "az-13-770", "model": "AZ 13-770", "series": "AZ", "width": 770, "height": 344, "thickness": 8.5, "weight": 76.4, "moment": 1300},
        {"id": "az-18-800", "model": "AZ 18-800", "series": "AZ", "width": 800, "height": 380, "thickness": 8.5, "weight": 82.0, "moment": 1800},
        {"id": "az-26-700", "model": "AZ 26-700", "series": "AZ", "width": 700, "height": 427, "thickness": 12.2, "weight": 112.0, "moment": 2600},
        {"id": "az-36-700n", "model": "AZ 36-700N", "series": "AZ", "width": 700, "height": 479, "thickness": 13.0, "weight": 127.0, "moment": 3600},
        {"id": "az-46-700n", "model": "AZ 46-700N", "series": "AZ", "width": 700, "height": 580, "thickness": 13.0, "weight": 145.0, "moment": 4620},
        {"id": "au-14", "model": "AU 14", "series": "AU", "width": 750, "height": 408, "thickness": 9.5, "weight": 92.0, "moment": 1400},
        {"id": "au-18", "model": "AU 18", "series": "AU", "width": 750, "height": 440, "thickness": 11.2, "weight": 105.0, "moment": 1810},
        {"id": "au-21", "model": "AU 21", "series": "AU", "width": 750, "height": 450, "thickness": 12.0, "weight": 119.0, "moment": 2100},
        {"id": "au-25", "model": "AU 25", "series": "AU", "width": 750, "height": 460, "thickness": 14.0, "weight": 130.0, "moment": 2500},
        {"id": "pu-12", "model": "PU 12", "series": "PU", "width": 600, "height": 360, "thickness": 9.8, "weight": 70.0, "moment": 1200},
        {"id": "pu-22", "model": "PU 22", "series": "PU", "width": 600, "height": 450, "thickness": 10.0, "weight": 102.0, "moment": 2210},
    ]
    seed_items(client, "sheet_piles", piles, "id")

    # --- Service features ---
    res = client.get("/items/services", params={"fields": "id,title"})
    service_map = {}
    if res.status_code == 200:
        for s in res.json().get("data", []):
            service_map[s.get("title", "")] = s["id"]

    service_features_data = {
        "Буронабивные сваи": ["Диаметр 300–2500 мм", "Глубина погружения до 70 м", "CFA и Kelly-технологии", "Работа в стесненных условиях"],
        "Шпунтовое ограждение": ["Все типы шпунта Ларсена", "Трубошпунт до ⌀1220 мм", "Вибро- и статическое погружение", "Идеально для котлованов в городе"],
        "Забивка ЖБ свай": ["Сечение до 400×400 мм", "Длина до 24 метров", "Гидравлические молоты", "Мониторинг PDA в реальном времени"],
    }

    for service_title, features in service_features_data.items():
        service_id = service_map.get(service_title)
        if service_id:
            feature_items = [{"service": service_id, "text": f, "sort": i+1} for i, f in enumerate(features)]
            seed_items(client, "service_features", feature_items, "text")
        else:
            print(f"    ℹ️ Service '{service_title}' not found, skipping features")


# ═══════════════════════════════════════════════
# PHASE 3: Projects
# ═══════════════════════════════════════════════

def create_project_collections(client):
    print("\n🏛️ Phase 3: Project Collections")

    create_collection(client, "project_tags", [
        f_string("tag", "Тег", required=True),
    ], {"icon": "label"})

    create_collection(client, "project_technologies", [
        f_string("name", "Название", required=True),
        f_dropdown("type", ["Оборудование", "Технология", "Метод"], "Тип"),
        f_text("description", "Описание"),
        f_image("image", "Фото"),
    ], {"icon": "engineering"})

    create_collection(client, "project_stats", [
        f_string("label", "Метрика", required=True),
        f_string("value", "Значение", required=True),
        f_sort(),
    ], {"icon": "bar_chart", "sort_field": "sort"})


def seed_projects(client):
    print("\n🏛️ Seeding Projects...")

    # Check if projects collection has our fields by trying to read
    res = client.get("/items/projects", params={"fields": "id,title"})
    existing_projects = {}
    if res.status_code == 200:
        for p in res.json().get("data", []):
            existing_projects[p.get("title", "")] = p["id"]

    projects = [
        {
            "title": "МФК «Лахта Центр 2»",
            "location": "Санкт-Петербург, Приморский район",
            "region": "spb",
            "category": "civil",
            "description": "Устройство шпунтового ограждения котлована глубиной 24 м для строительства второй очереди МФК «Лахта Центр».",
            "challenge": "Нулевые допуски по вибрации из-за близости к существующему комплексу «Лахта Центр». Слабые водонасыщенные грунты.",
            "solution": "Использование технологии статического вдавливания Giken Silent Piler, вибрационный фон менее 0.5 мм/с.",
            "year": "2024",
            "latitude": 59.9871,
            "longitude": 30.1776,
            "status": "published",
            "_tags": ["Giken Silent Piler", "Шпунт Ларсена AZ 46", "Мониторинг осадок"],
            "_stats": [
                {"label": "Глубина", "value": "24 м", "sort": 1},
                {"label": "Периметр", "value": "1250 м", "sort": 2},
                {"label": "Вибрация", "value": "<0.5 мм/с", "sort": 3},
                {"label": "Срок", "value": "6 мес.", "sort": 4},
            ],
        },
        {
            "title": "Станция «Спасская» — Выход №2",
            "location": "Санкт-Петербург, Сенная площадь",
            "region": "spb",
            "category": "infrastructure",
            "description": "Устройство крепления глубокого котлована у вестибюля станции метро «Спасская» в условиях исторической застройки.",
            "challenge": "Зона охраны объектов культурного наследия. Водонасыщенные грунты. Действующие коммуникации.",
            "solution": "Буросекущие сваи CFA ⌀750 мм + многоуровневая распорная система с постоянным геомониторингом.",
            "year": "2025",
            "latitude": 59.9275,
            "longitude": 30.3162,
            "status": "published",
            "_tags": ["Буросекущие сваи", "CFA технология", "Историческая застройка"],
            "_stats": [
                {"label": "Глубина", "value": "32 м", "sort": 1},
                {"label": "Кол-во свай", "value": "480 шт.", "sort": 2},
                {"label": "Осадки", "value": "<3 мм", "sort": 3},
                {"label": "Срок", "value": "14 мес.", "sort": 4},
            ],
        },
        {
            "title": "ЖК «Каменноостровский»",
            "location": "Санкт-Петербург, Петроградская сторона",
            "region": "spb",
            "category": "residential",
            "description": "Комплексный нулевой цикл: шпунтовое ограждение + буронабивные сваи для элитного жилого комплекса на набережной.",
            "challenge": "Предельно стесненная площадка на Петроградской стороне. Высокий уровень грунтовых вод.",
            "solution": "Комбинированное решение: статическое вдавливание шпунта + 320 буронабивных свай CFA ⌀600 мм.",
            "year": "2024",
            "latitude": 59.9632,
            "longitude": 30.3082,
            "status": "published",
            "_tags": ["Статическое вдавливание", "CFA сваи", "Элитная застройка"],
            "_stats": [
                {"label": "Шпунт", "value": "720 м", "sort": 1},
                {"label": "CFA сваи", "value": "320 шт.", "sort": 2},
                {"label": "Площадь", "value": "4500 м²", "sort": 3},
                {"label": "Срок", "value": "8 мес.", "sort": 4},
            ],
        },
        {
            "title": "ICS Москва-Сити",
            "location": "Москва, Пресненская наб.",
            "region": "msk",
            "category": "civil",
            "description": "Устройство свайного основания для нового офисного комплекса в Москва-Сити.",
            "challenge": "Крайне сжатые сроки. Сложная логистика в условиях действующего делового центра.",
            "solution": "Параллельная работа 3-х буровых установок Bauer BG 28 по 24-часовому графику.",
            "year": "2023",
            "latitude": 55.7494,
            "longitude": 37.5375,
            "status": "published",
            "_tags": ["Буронабивные сваи", "Kelly бурение", "Москва-Сити"],
            "_stats": [
                {"label": "⌀ свай", "value": "1500 мм", "sort": 1},
                {"label": "Глубина", "value": "45 м", "sort": 2},
                {"label": "Кол-во", "value": "120 шт.", "sort": 3},
                {"label": "Срок", "value": "4 мес.", "sort": 4},
            ],
        },
        {
            "title": "ЖК «Балтийская Жемчужина» — III очередь",
            "location": "Санкт-Петербург, Юго-Запад",
            "region": "spb",
            "category": "residential",
            "description": "III очередь: забивка 1200 ЖБ свай 350×350 для жилых корпусов на намывных территориях.",
            "challenge": "Намывные грунты. Необходимость забивки через плотные прослойки песка.",
            "solution": "Дизель-молоты Junttan PM 25 с предварительным лидерным бурением через плотные песчаные линзы.",
            "year": "2024",
            "latitude": 59.8522,
            "longitude": 30.1485,
            "status": "published",
            "_tags": ["Забивка ЖБ свай", "Лидерное бурение", "Намывные территории"],
            "_stats": [
                {"label": "Свай забито", "value": "1200 шт.", "sort": 1},
                {"label": "Сечение", "value": "350×350", "sort": 2},
                {"label": "Глубина", "value": "18 м", "sort": 3},
                {"label": "Срок", "value": "5 мес.", "sort": 4},
            ],
        },
    ]

    for project in projects:
        tags = project.pop("_tags", [])
        stats = project.pop("_stats", [])

        # Check existing
        if project["title"] in existing_projects:
            print(f"    ⏭️  Project '{project['title'][:30]}...' already exists")
            project_id = existing_projects[project["title"]]
        else:
            res = client.post("/items/projects", json=project)
            if res.status_code in [200, 201]:
                project_id = res.json()["data"]["id"]
                print(f"    ✅ Created project '{project['title'][:30]}...'")
            else:
                print(f"    ❌ Failed: {res.status_code} — {res.text[:150]}")
                continue

        # Seed tags
        for tag in tags:
            tag_item = {"project": project_id, "tag": tag}
            try:
                client.post("/items/project_tags", json=tag_item)
            except:
                pass

        # Seed stats
        for stat in stats:
            stat["project"] = project_id
            try:
                client.post("/items/project_stats", json=stat)
            except:
                pass


# ═══════════════════════════════════════════════
# PHASE 4: Static Blocks
# ═══════════════════════════════════════════════

def create_static_collections(client):
    print("\n📋 Phase 4: Static Block Collections")

    # Company Info (singleton)
    create_singleton(client, "company_info", [
        f_string("phone", "Телефон"),
        f_string("email", "Email"),
        f_string("address", "Адрес офиса"),
        f_string("work_hours", "Часы работы"),
        f_string("map_link", "Ссылка на карту"),
        f_string("whatsapp_link", "WhatsApp"),
        f_string("telegram_link", "Telegram"),
    ])

    # Hero configs (region-based)
    create_collection_string_pk(client, "hero_configs", [
        f_string("title", "Заголовок"),
        f_text("usp", "УТП (уникальное торговое предложение)"),
        f_string("cta_text", "Текст кнопки CTA"),
    ], {"icon": "web"})

    # Advantages (WhyUs)
    create_collection(client, "advantages", [
        f_string("title", "Заголовок", required=True),
        f_text("description", "Описание"),
        f_dropdown("icon", ["Clock", "Award", "Wrench", "ShieldCheck", "Cpu", "Target", "Users", "Shield", "Zap", "Layers"], "Иконка Lucide"),
        f_dropdown("accent_color", ["Orange", "Blue", "Green", "Purple", "Red", "Cyan", "Teal", "Indigo"], "Цвет акцента"),
        f_sort(),
    ], {"icon": "stars", "sort_field": "sort"})

    # Company Stats
    create_collection(client, "company_stats", [
        f_string("label", "Метрика", required=True),
        f_string("value", "Значение", required=True),
        f_string("description", "Описание"),
        f_sort(),
    ], {"icon": "insights", "sort_field": "sort"})

    # Company Values
    create_collection(client, "company_values", [
        f_string("title", "Заголовок", required=True),
        f_text("description", "Описание"),
        f_dropdown("icon", ["Cpu", "Target", "Shield", "Users", "Award", "Clock", "Wrench", "Zap"], "Иконка Lucide"),
        f_dropdown("accent_color", ["Orange", "Blue", "Green", "Purple", "Red", "Cyan"], "Цвет акцента"),
        f_sort(),
    ], {"icon": "favorite", "sort_field": "sort"})


def seed_static(client):
    print("\n📋 Seeding Static Blocks...")

    # Company Info (singleton)
    res = client.get("/items/company_info")
    if res.status_code == 200 and res.json().get("data"):
        print("  ⏭️  company_info already has data")
    else:
        client.post("/items/company_info", json={
            "phone": "+7 (921) 884-44-03",
            "email": "drilling.rigs.info@yandex.ru",
            "address": "Санкт-Петербург, тер. промзона Парнас",
            "work_hours": "Пн-Пт: 09:00 - 20:00 (МСК)",
            "map_link": "https://yandex.ru/maps/-/CDG1RU",
        })
        print("  ✅ Seeded company_info")

    # Hero configs
    hero_configs = [
        {"id": "spb", "title": "Digital Geotech Hub — СПб", "usp": "Нулевой цикл в условиях исторической застройки Санкт-Петербурга. 15+ лет опыта и деликатное погружение шпунта (Silent Piler).", "cta_text": "Рассчитать смету для СПб"},
        {"id": "msk", "title": "Digital Geotech Hub — МСК", "usp": "Оперативная перебазировка тяжелой техники в Москву и МО. Лидерное бурение и устройство свайных полей в рекордные сроки.", "cta_text": "Рассчитать смету для МСК"},
    ]
    seed_items(client, "hero_configs", hero_configs, "id")

    # Advantages (WhyUs)
    advantages = [
        {"title": "15+ Лет Опыта", "description": "Успешно работаем на рынке аренды и строительства в Санкт-Петербурге с 2008 года.", "icon": "clock", "accent_color": "orange", "sort": 1},
        {"title": "Официальный Дилер", "description": "Эксклюзивный представитель ENTECO (Италия) и MKT (США) в России.", "icon": "award", "accent_color": "blue", "sort": 2},
        {"title": "Собственный Парк", "description": "Владеем парком тяжелой техники Bauer, Junttan, PVE. Никаких посредников.", "icon": "wrench", "accent_color": "green", "sort": 3},
        {"title": "Допуск СРО", "description": "Полный пакет разрешительной документации для работ на особо опасных объектах.", "icon": "shieldcheck", "accent_color": "purple", "sort": 4},
    ]
    seed_items(client, "advantages", advantages, "title")

    # Company Stats
    stats = [
        {"label": "Лет опыта", "value": "15+", "description": "Безупречной репутации на рынке", "sort": 1},
        {"label": "Единиц техники", "value": "40+", "description": "Современного парка оборудования", "sort": 2},
        {"label": "Проектов", "value": "850+", "description": "Успешно завершенных объектов", "sort": 3},
        {"label": "Инженеров", "value": "25+", "description": "Высшей квалификационной категории", "sort": 4},
    ]
    seed_items(client, "company_stats", stats, "label")

    # Company Values
    values = [
        {"title": "Технологическое превосходство", "description": "Мы постоянно инвестируем в обновление парка, выбирая лучшие мировые образцы техники от BAUER до JUNTTAN.", "icon": "cpu", "accent_color": "orange", "sort": 1},
        {"title": "Инженерный подход", "description": "Каждый проект проходит через глубокую техническую экспертизу. Мы не просто бурим, мы решаем сложные задачи.", "icon": "target", "accent_color": "blue", "sort": 2},
        {"title": "Надежность и Безопасность", "description": "Строгое соблюдение ГОСТ, СНиП и отраслевых стандартов безопасности — наш безусловный приоритет.", "icon": "shield", "accent_color": "green", "sort": 3},
        {"title": "Команда экспертов", "description": "Наши сотрудники регулярно проходят стажировки у производителей оборудования и аттестацию в Ростехнадзоре.", "icon": "users", "accent_color": "purple", "sort": 4},
    ]
    seed_items(client, "company_values", values, "title")


# ═══════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════

def main():
    print("🚀 Digital Geotech Hub — CMS Seed Script")
    print("=" * 50)

    with httpx.Client(base_url=DIRECTUS_URL, timeout=30.0) as client:
        auth(client)

        # Phase 1: Journal
        create_journal_collections(client)
        seed_journal(client)

        # Phase 2: Catalogs
        create_catalog_collections(client)
        seed_catalogs(client)

        # Phase 3: Projects
        create_project_collections(client)
        seed_projects(client)

        # Phase 4: Static
        create_static_collections(client)
        seed_static(client)

    print("\n" + "=" * 50)
    print("✅ Seeding complete!")
    print("📌 Open Directus Admin: http://localhost:8055")


if __name__ == "__main__":
    main()
