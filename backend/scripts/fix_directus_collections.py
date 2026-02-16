#!/usr/bin/env python3
"""
Fix Directus collections: seed empty data, add missing fields, configure slug auto-generation.
"""
import httpx
import json
import sys
import time

BASE = "http://localhost:8055"

def get_token():
    r = httpx.post(f"{BASE}/auth/login", json={"email": "admin@example.com", "password": "admin-password"})
    r.raise_for_status()
    return r.json()["data"]["access_token"]

TOKEN = get_token()
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}

def api(method, path, data=None):
    url = f"{BASE}{path}"
    r = httpx.request(method, url, headers=HEADERS, json=data, timeout=30)
    if r.status_code >= 400:
        print(f"  ⚠️  {method} {path} → {r.status_code}: {r.text[:200]}")
    return r

def seed_items(collection, items):
    existing = api("GET", f"/items/{collection}?limit=1")
    if existing.status_code == 200:
        data = existing.json().get("data", [])
        if data:
            print(f"  ⏭  {collection}: already has data ({len(data)}+ items), skipping")
            return
    for item in items:
        r = api("POST", f"/items/{collection}", item)
        if r.status_code in (200, 204):
            print(f"  ✅ {collection}: created item")
        else:
            print(f"  ❌ {collection}: failed to create item")

def add_field(collection, field_name, field_def):
    """Add field if it doesn't exist"""
    check = api("GET", f"/fields/{collection}/{field_name}")
    if check.status_code == 200:
        print(f"  ⏭  {collection}.{field_name}: already exists")
        return True
    r = api("POST", f"/fields/{collection}", field_def)
    if r.status_code in (200, 204):
        print(f"  ✅ {collection}.{field_name}: added")
        return True
    return False

def update_field(collection, field_name, meta_update):
    """Update field meta (e.g. interface, options)"""
    r = api("PATCH", f"/fields/{collection}/{field_name}", {"meta": meta_update})
    if r.status_code in (200, 204):
        print(f"  ✅ {collection}.{field_name}: meta updated")
    else:
        print(f"  ❌ {collection}.{field_name}: failed to update meta")

# ═══════════════════════════════════════════════════════
# 1. SEED EMPTY COLLECTIONS
# ═══════════════════════════════════════════════════════
print("\n═══ 1. SEEDING EMPTY COLLECTIONS ═══\n")

# --- FAQ ---
print("📋 FAQ:")
faq_items = [
    {"question": "В каких регионах вы работаете?",
     "answer": "Мы работаем по всей территории РФ, включая труднодоступные районы Крайнего Севера и Дальнего Востока. Основные объекты в Санкт-Петербурге, Москве, Мурманске, Краснодаре и Сочи."},
    {"question": "Какое оборудование используется для вдавливания шпунта?",
     "answer": "Для статического вдавливания мы используем установки Giken Silent Piler F3 и F201, которые позволяют работать вплотную к существующим зданиям без вибрации. Усилие прессования — до 400 тонн."},
    {"question": "Как AI-Copilot рассчитывает смету?",
     "answer": "Наш алгоритм анализирует загруженное техзадание (чертежи, ведомости), сопоставляет его с актуальными ценами на шпунт из нашего каталога и подбирает оптимальный комплект техники с учётом грунтовых условий."},
    {"question": "Какие сроки выполнения работ?",
     "answer": "Сроки зависят от объёма и сложности проекта. Стандартное шпунтовое ограждение 50-100 п.м. выполняется за 2-4 недели. Буронабивные сваи — от 3 недель. Точные сроки рассчитываем после изучения проектной документации."},
    {"question": "Есть ли у вас допуск СРО?",
     "answer": "Да, мы имеем допуск СРО на все виды выполняемых работ, включая геотехнические работы повышенного уровня ответственности. Также имеем сертификат ISO 9001."},
    {"question": "Можно ли арендовать технику без экипажа?",
     "answer": "Да, мы предоставляем технику как с экипажем (полный сервис), так и без экипажа (bare rental). При аренде без экипажа мы проводим инструктаж и обеспечиваем техническую поддержку."},
]
seed_items("faq", faq_items)

# --- Services ---
print("\n🛠 Services:")
services_items = [
    {"id": "bored-piles", "title": "Буронабивные сваи", "subtitle": "Bored Piles (CFA / Kelly)",
     "description": "Устройство свай диаметром от 300 до 2500 мм глубиной до 70 метров методами CFA и Kelly-бурения.",
     "icon": "Drill", "accent": "orange", "slug": "bored-piles", "sort": 1},
    {"id": "sheet-piling", "title": "Шпунтовое ограждение", "subtitle": "Sheet Piling (Larssen, трубошпунт)",
     "description": "Погружение стального шпунта Ларсена и трубошпунта методами вибро- и статического вдавливания.",
     "icon": "Layers", "accent": "blue", "slug": "sheet-piling", "sort": 2},
    {"id": "pile-driving", "title": "Забивка ЖБ свай", "subtitle": "Driven Precast Piles (RC)",
     "description": "Забивка и вдавливание железобетонных свай сечением до 400×400 мм. Контроль по отказу.",
     "icon": "Hammer", "accent": "red", "slug": "pile-driving", "sort": 3},
    {"id": "pile-pressing", "title": "Статическое вдавливание", "subtitle": "Static Pile Pressing (Silent)",
     "description": "Бесшумное погружение свай и шпунта методом статического вдавливания. Безопасно для исторической застройки.",
     "icon": "ArrowDownCircle", "accent": "green", "slug": "pile-pressing", "sort": 4},
    {"id": "anchors", "title": "Грунтовые анкеры", "subtitle": "Ground Anchors (Temporary & Permanent)",
     "description": "Устройство временных и постоянных грунтовых анкеров для крепления ограждающих конструкций котлованов.",
     "icon": "Anchor", "accent": "purple", "slug": "anchors", "sort": 5},
    {"id": "jet-grouting", "title": "Струйная цементация", "subtitle": "Jet Grouting (Mono / Bi / Triple)",
     "description": "Укрепление и гидроизоляция грунтов методом струйной цементации с контролем параметров.",
     "icon": "Activity", "accent": "cyan", "slug": "jet-grouting", "sort": 6},
    {"id": "slurry-wall", "title": "Стена в грунте", "subtitle": "Diaphragm Wall (Slurry Wall)",
     "description": "Устройство противофильтрационных завес и несущих конструкций методом «стена в грунте» глубиной до 45 м.",
     "icon": "Shield", "accent": "indigo", "slug": "slurry-wall", "sort": 7},
    {"id": "micropiles", "title": "Микросваи", "subtitle": "Micropiles (Root Piles)",
     "description": "Устройство микросвай диаметром до 300 мм для усиления фундаментов и работ в ограниченном пространстве.",
     "icon": "Construction", "accent": "orange", "slug": "micropiles", "sort": 8},
    {"id": "geomonitoring", "title": "Геомониторинг", "subtitle": "Geotechnical Monitoring",
     "description": "Инструментальный контроль деформаций конструкций и грунтового массива в реальном времени.",
     "icon": "Activity", "accent": "green", "slug": "geomonitoring", "sort": 9},
    {"id": "vibroflotation", "title": "Виброуплотнение", "subtitle": "Vibroflotation (Deep Compaction)",
     "description": "Глубинное уплотнение несвязных грунтов методом виброфлотации.",
     "icon": "MoveVertical", "accent": "teal", "slug": "vibroflotation", "sort": 10},
    {"id": "leader-drilling", "title": "Лидерное бурение", "subtitle": "Pre-drilling (Leader Drilling)",
     "description": "Предварительное бурение скважин для облегчения погружения свай и шпунта в плотных грунтах.",
     "icon": "Pickaxe", "accent": "slate", "slug": "leader-drilling", "sort": 11},
]
seed_items("services", services_items)

# --- Service Features ---
print("\n✅ Service Features:")
service_features = [
    # Bored piles
    {"service": "bored-piles", "title": "Диаметр 300–2500 мм", "sort": 1},
    {"service": "bored-piles", "title": "Глубина погружения до 70 м", "sort": 2},
    {"service": "bored-piles", "title": "CFA и Kelly-технологии", "sort": 3},
    {"service": "bored-piles", "title": "Работа в стесненных условиях", "sort": 4},
    # Sheet piling
    {"service": "sheet-piling", "title": "Все типы шпунта Ларсена", "sort": 1},
    {"service": "sheet-piling", "title": "Трубошпунт до ⌀1220 мм", "sort": 2},
    {"service": "sheet-piling", "title": "Вибро- и статическое погружение", "sort": 3},
    {"service": "sheet-piling", "title": "Идеально для котлованов в городе", "sort": 4},
    # Pile driving
    {"service": "pile-driving", "title": "Сечение до 400×400 мм", "sort": 1},
    {"service": "pile-driving", "title": "Длина до 24 метров", "sort": 2},
    {"service": "pile-driving", "title": "Гидравлические молоты", "sort": 3},
    {"service": "pile-driving", "title": "Мониторинг PDA в реальном времени", "sort": 4},
    # Static pressing
    {"service": "pile-pressing", "title": "Отсутствие опасных вибраций", "sort": 1},
    {"service": "pile-pressing", "title": "Работа в историческом центре", "sort": 2},
    {"service": "pile-pressing", "title": "Усилие до 400 тонн", "sort": 3},
    {"service": "pile-pressing", "title": "Ночные работы без ограничений", "sort": 4},
    # Anchors
    {"service": "anchors", "title": "Временные и постоянные", "sort": 1},
    {"service": "anchors", "title": "Глубина до 30 м", "sort": 2},
    {"service": "anchors", "title": "Испытание каждого анкера", "sort": 3},
    {"service": "anchors", "title": "Инъекционная технология", "sort": 4},
    # Jet grouting
    {"service": "jet-grouting", "title": "Моно-, би-, трёхкомпонентная", "sort": 1},
    {"service": "jet-grouting", "title": "Диаметр столбов до 2000 мм", "sort": 2},
    {"service": "jet-grouting", "title": "Укрепление и гидроизоляция", "sort": 3},
    {"service": "jet-grouting", "title": "Работа в сложных грунтах", "sort": 4},
    # Slurry wall
    {"service": "slurry-wall", "title": "Глубина до 45 м", "sort": 1},
    {"service": "slurry-wall", "title": "Толщина стены 600–1200 мм", "sort": 2},
    {"service": "slurry-wall", "title": "Несущая и ограждающая функция", "sort": 3},
    {"service": "slurry-wall", "title": "Минимальные деформации", "sort": 4},
    # Micropiles
    {"service": "micropiles", "title": "Диаметр 100–300 мм", "sort": 1},
    {"service": "micropiles", "title": "Высокая несущая способность", "sort": 2},
    {"service": "micropiles", "title": "Усиление исторических фундаментов", "sort": 3},
    {"service": "micropiles", "title": "Работа внутри зданий", "sort": 4},
]
seed_items("service_features", service_features)

# --- Project Technologies ---
print("\n⚙️ Project Technologies:")
tech_items = [
    {"name": "Kelly-бурение", "sort": 1},
    {"name": "CFA-бурение", "sort": 2},
    {"name": "Шпунт Ларсена", "sort": 3},
    {"name": "Трубошпунт", "sort": 4},
    {"name": "Static Pile Pressing", "sort": 5},
    {"name": "Виброфлотация", "sort": 6},
    {"name": "Jet Grouting", "sort": 7},
    {"name": "PDA-мониторинг", "sort": 8},
    {"name": "Гидромолот", "sort": 9},
    {"name": "Грунтовые анкеры", "sort": 10},
    {"name": "Микросваи", "sort": 11},
    {"name": "Геомониторинг", "sort": 12},
]
seed_items("project_technologies", tech_items)

# --- Cases ---
print("\n💼 Cases:")
cases_items = [
    {"title": "ЖК «Нева Хаус» — шпунтовое ограждение котлована",
     "description": "Устройство замкнутого шпунтового ограждения из шпунта Ларсена Л5-УМ длиной 12 м. Объём — 340 п.м. Работы выполнены за 3 недели без повреждения прилегающих зданий.",
     "client": "ГК ПИК", "year": "2024", "city": "Санкт-Петербург"},
    {"title": "Мост через реку Лугу — забивка ЖБ свай",
     "description": "Забивка 186 ЖБ свай сечением 350×350 мм гидромолотом BSP 356. Длина свай 16 м. Контроль несущей способности методом PDA.",
     "client": "Автодор", "year": "2023", "city": "Ленинградская область"},
    {"title": "Реконструкция Апраксина двора — статическое вдавливание",
     "description": "Бесшумное погружение 520 п.м. шпунта методом статического вдавливания Giken Silent Piler в зоне исторической застройки.",
     "client": "КГИОП СПб", "year": "2024", "city": "Санкт-Петербург"},
]
seed_items("cases", cases_items)

# ═══════════════════════════════════════════════════════
# 2. FIX SLUG AUTO-GENERATION (articles)
# ═══════════════════════════════════════════════════════
print("\n═══ 2. FIX SLUG AUTO-GENERATION ═══\n")

# Update slug field in articles to have slug interface with auto-generation from title
update_field("articles", "slug", {
    "interface": "input",
    "options": {
        "slug": True,
        "trim": True,
    },
    "special": ["slug"],
    "note": "URL-адрес. Генерируется автоматически из заголовка. Можно поправить вручную.",
})

# Also set slug auto-generation for services
update_field("services", "slug", {
    "interface": "input",
    "options": {
        "slug": True,
        "trim": True,
    },
    "special": ["slug"],
    "note": "URL-адрес. Генерируется автоматически.",
})

# ═══════════════════════════════════════════════════════
# 3. FIX MACHINERY: add missing fields + link specs
# ═══════════════════════════════════════════════════════
print("\n═══ 3. FIX MACHINERY SCHEMA ═══\n")

# Add missing fields to machinery
missing_fields = [
    {
        "field": "description",
        "type": "text",
        "meta": {
            "interface": "input-multiline",
            "note": "Описание единицы техники",
            "sort": 3,
            "width": "full",
        }
    },
    {
        "field": "image",
        "type": "uuid",
        "meta": {
            "interface": "file-image",
            "note": "Фотография техники",
            "sort": 4,
            "width": "half",
        },
        "schema": {
            "foreign_key_table": "directus_files",
            "foreign_key_column": "id",
        }
    },
    {
        "field": "category_label",
        "type": "string",
        "meta": {
            "interface": "input",
            "note": "Подпись категории (например: Буровая установка)",
            "sort": 5,
            "width": "half",
        }
    },
    {
        "field": "accent_color",
        "type": "string",
        "meta": {
            "interface": "select-dropdown",
            "note": "Цвет акцента карточки",
            "sort": 6,
            "width": "half",
            "options": {
                "choices": [
                    {"text": "Orange", "value": "orange"},
                    {"text": "Blue", "value": "blue"},
                    {"text": "Red", "value": "red"},
                    {"text": "Yellow", "value": "yellow"},
                    {"text": "Green", "value": "green"},
                    {"text": "Purple", "value": "purple"},
                    {"text": "Teal", "value": "teal"},
                    {"text": "Indigo", "value": "indigo"},
                    {"text": "Cyan", "value": "cyan"},
                ]
            }
        }
    },
    {
        "field": "sort",
        "type": "integer",
        "meta": {
            "interface": "input",
            "note": "Порядок сортировки",
            "sort": 10,
            "width": "half",
        }
    },
]

for fd in missing_fields:
    add_field("machinery", fd["field"], fd)

# Add machinery_id to machinery_specs to link them
print("\n🔗 Linking machinery_specs → machinery:")
add_field("machinery_specs", "machinery_id", {
    "field": "machinery_id",
    "type": "integer",
    "meta": {
        "interface": "select-dropdown-m2o",
        "note": "К какой единице техники относится эта характеристика",
        "display": "related-values",
        "display_options": {"template": "{{name}}"},
        "width": "full",
        "sort": 5,
    },
    "schema": {
        "foreign_key_table": "machinery",
        "foreign_key_column": "id",
    },
})

# Create the O2M relation on machinery side (specs = list of machinery_specs)
print("\n🔗 Adding specs relation to machinery:")
add_field("machinery", "specs", {
    "field": "specs",
    "type": "alias",
    "meta": {
        "interface": "list-o2m",
        "special": ["o2m"],
        "note": "Технические характеристики этой единицы техники",
        "sort": 7,
        "options": {
            "template": "{{label}}: {{value}}",
        },
    },
    "collection": "machinery",
})

# Create the relation
print("  Creating relation machinery.specs → machinery_specs:")
r = api("POST", "/relations", {
    "collection": "machinery_specs",
    "field": "machinery_id",
    "related_collection": "machinery",
    "meta": {
        "one_field": "specs",
        "one_deselect_action": "nullify",
    },
    "schema": {
        "on_delete": "SET NULL",
    }
})
if r.status_code in (200, 204):
    print("  ✅ Relation created: machinery → machinery_specs")
else:
    print(f"  ⚠️  Relation status: {r.status_code} (may already exist)")

# ═══════════════════════════════════════════════════════
# 4. SEED MACHINERY WITH FULL DATA
# ═══════════════════════════════════════════════════════
print("\n═══ 4. SEED MACHINERY WITH FULL DATA ═══\n")

# First check if machinery already has data with descriptions
existing = api("GET", "/items/machinery?fields=id,name,description&limit=10")
items = existing.json().get("data", [])
needs_update = any(not item.get("description") for item in items) if items else True

if items and needs_update:
    print("  Updating existing machinery items with descriptions and metadata...")
    updates = {
        "bauer-bg28": {
            "description": "Тяжелая буровая установка для устройства свай большого диаметра до 2500 мм и глубиной до 70 метров. Идеальна для Kelly-бурения.",
            "category_label": "Буровая установка",
            "accent_color": "orange",
            "sort": 1,
        },
        "enteco-e400": {
            "description": "Универсальная установка для CFA бурения и устройства буронабивных свай. Высокая маневренность на средних объектах.",
            "category_label": "Буровая установка",
            "accent_color": "blue",
            "sort": 2,
        },
        "junttan-pm25": {
            "description": "Специализированный копер для забивки ЖБ свай. Гидравлическая система обеспечивает точный контроль энергии удара.",
            "category_label": "Сваебойный копер",
            "accent_color": "red",
            "sort": 3,
        },
        "bsp-356": {
            "description": "Навесной гидравлический молот большой мощности для работы с крана. Эффективен для стальных труб и оболочек.",
            "category_label": "Гидромолот",
            "accent_color": "yellow",
            "sort": 4,
        },
        "giken-silent-piler": {
            "description": "Бесшумное погружение шпунта Ларсена. Работает по принципу реактивного усилия, не создавая вибраций.",
            "category_label": "Вдавливающая установка",
            "accent_color": "green",
            "sort": 5,
        },
        "pve-2316": {
            "description": "Высокочастотный вибропогружатель с переменным статическим моментом. Безопасен для городской застройки.",
            "category_label": "Вибропогружатель",
            "accent_color": "purple",
            "sort": 6,
        },
        "manitowoc-222": {
            "description": "Надежный гусеничный кран для вспомогательных работ на стройплощадке и погружения шпунта с вибропогружателем.",
            "category_label": "Гусеничный кран",
            "accent_color": "teal",
            "sort": 7,
        },
        "inteco-e6050": {
            "description": "Компактная и мощная буровая установка итальянского производства для работы в ограниченном пространстве.",
            "category_label": "Буровая установка",
            "accent_color": "indigo",
            "sort": 8,
        },
    }
    for item in items:
        item_id = item.get("id") or item.get("slug")
        if item_id in updates:
            r = api("PATCH", f"/items/machinery/{item_id}", updates[item_id])
            if r.status_code in (200, 204):
                print(f"  ✅ Updated: {item.get('name', item_id)}")
        # Try by slug if id didn't match
        elif item.get("name"):
            for uid, udata in updates.items():
                if uid.replace("-", " ").lower() in item["name"].lower() or item["name"].lower() in uid.replace("-", " "):
                    r = api("PATCH", f"/items/machinery/{item['id']}", udata)
                    if r.status_code in (200, 204):
                        print(f"  ✅ Updated: {item['name']}")
                    break

# Seed specs linked to machinery
print("\n📐 Seeding machinery specs linked to specific machinery:")
# First get machinery IDs
mach_resp = api("GET", "/items/machinery?fields=id,name,slug&limit=20")
mach_items = mach_resp.json().get("data", [])
mach_map = {}
for m in mach_items:
    slug = m.get("slug", "").lower()
    name = m.get("name", "").lower()
    mach_map[slug] = m["id"]
    mach_map[name] = m["id"]

specs_data = {
    "bauer-bg28": [
        {"label": "Крутящий момент", "value": "270 кНм", "icon": "zap", "sort": 1},
        {"label": "Масса установки", "value": "96 тонн", "icon": "weight", "sort": 2},
        {"label": "Глубина бурения", "value": "71 метр", "icon": "ruler", "sort": 3},
    ],
    "enteco-e400": [
        {"label": "Крутящий момент", "value": "240 кНм", "icon": "zap", "sort": 1},
        {"label": "Масса установки", "value": "75 тонн", "icon": "weight", "sort": 2},
        {"label": "CFA Глубина", "value": "24-28 м", "icon": "ruler", "sort": 3},
    ],
    "junttan-pm25": [
        {"label": "Энергия удара", "value": "115 кДж", "icon": "zap", "sort": 1},
        {"label": "Длина сваи", "value": "16 метров", "icon": "ruler", "sort": 2},
        {"label": "Масса молота", "value": "7 тонн", "icon": "weight", "sort": 3},
    ],
    "bsp-356": [
        {"label": "Энергия макс.", "value": "125 кДж", "icon": "zap", "sort": 1},
        {"label": "Масса ударника", "value": "9 тонн", "icon": "weight", "sort": 2},
        {"label": "Частота", "value": "40-100 уд/м", "icon": "ruler", "sort": 3},
    ],
    "giken-silent-piler": [
        {"label": "Усилие", "value": "1500 кН", "icon": "zap", "sort": 1},
        {"label": "Масса", "value": "12.5 тонн", "icon": "weight", "sort": 2},
        {"label": "Шумность", "value": "68 дБ(А)", "icon": "ruler", "sort": 3},
    ],
    "pve-2316": [
        {"label": "Стат. момент", "value": "0-23 кгм", "icon": "zap", "sort": 1},
        {"label": "Центроб. сила", "value": "1150 кН", "icon": "weight", "sort": 2},
        {"label": "Амплитуда", "value": "16 мм", "icon": "ruler", "sort": 3},
    ],
    "manitowoc-222": [
        {"label": "Грузоподъём", "value": "100 тонн", "icon": "weight", "sort": 1},
        {"label": "Длина стрелы", "value": "61 метр", "icon": "ruler", "sort": 2},
        {"label": "Скорость", "value": "1.5 км/ч", "icon": "zap", "sort": 3},
    ],
    "inteco-e6050": [
        {"label": "Крутящий момент", "value": "60 кНм", "icon": "zap", "sort": 1},
        {"label": "Масса", "value": "18.5 тонн", "icon": "weight", "sort": 2},
        {"label": "Ширина базы", "value": "2.3 м", "icon": "ruler", "sort": 3},
    ],
}

# Delete old unlinked specs first
print("  Clearing old unlinked specs...")
old_specs = api("GET", "/items/machinery_specs?fields=id&limit=100")
if old_specs.status_code == 200:
    old_ids = [s["id"] for s in old_specs.json().get("data", [])]
    for oid in old_ids:
        api("DELETE", f"/items/machinery_specs/{oid}")
    if old_ids:
        print(f"  🗑  Deleted {len(old_ids)} old unlinked specs")

# Create new linked specs
for slug, specs in specs_data.items():
    mid = mach_map.get(slug)
    if not mid:
        # Try to match by name
        for key, val in mach_map.items():
            if slug.replace("-", " ") in key or slug.replace("-", "") in key.replace(" ", ""):
                mid = val
                break
    if mid:
        for spec in specs:
            spec["machinery_id"] = mid
            r = api("POST", "/items/machinery_specs", spec)
            if r.status_code in (200, 204):
                print(f"  ✅ {slug}: {spec['label']} = {spec['value']}")
            else:
                print(f"  ❌ {slug}: {spec['label']} failed")
    else:
        print(f"  ⚠️  Could not find machinery ID for: {slug}")

# ═══════════════════════════════════════════════════════
# 5. ADD COLLECTION NOTES AND ICONS
# ═══════════════════════════════════════════════════════
print("\n═══ 5. COLLECTION NOTES ═══\n")

notes = {
    "articles": {"note": "Статьи геотехнического журнала", "icon": "article"},
    "article_categories": {"note": "Категории статей журнала", "icon": "category"},
    "faq": {"note": "Часто задаваемые вопросы на сайте", "icon": "help_outline"},
    "services": {"note": "Перечень геотехнических услуг компании", "icon": "build"},
    "service_features": {"note": "Ключевые преимущества каждой услуги", "icon": "check_circle"},
    "machinery": {"note": "Карточки спецтехники — описание, фото, характеристики", "icon": "construction"},
    "machinery_specs": {"note": "Технические характеристики конкретных единиц техники", "icon": "tune"},
    "machinery_categories": {"note": "Категории техники (Буровые, Сваебойные и т.д.)", "icon": "category"},
    "hero_configs": {"note": "Тексты и CTA главного экрана (по регионам)", "icon": "web"},
    "advantages": {"note": "Карточки «Почему мы» на главной", "icon": "stars"},
    "company_info": {"note": "Контакты компании: телефон, email, адрес, часы работы", "icon": "settings"},
    "company_stats": {"note": "Цифры на странице «О нас» (15+ лет, 850+ проектов)", "icon": "insights"},
    "company_values": {"note": "Ценности компании на странице «О нас»", "icon": "favorite"},
    "projects": {"note": "Портфолио проектов (геотехнические работы)", "icon": "folder"},
    "project_tags": {"note": "Теги проектов для фильтрации", "icon": "label"},
    "project_technologies": {"note": "Технологии, использованные в проектах", "icon": "engineering"},
    "project_stats": {"note": "Статистика проектов (глубина, объём)", "icon": "bar_chart"},
    "cases": {"note": "Выполненные кейсы компании", "icon": "work_history"},
    "sheet_pile_series": {"note": "Серии шпунтов (Л4, Л5 и т.д.)", "icon": "view_column"},
    "sheet_piles": {"note": "Каталог шпунтов — размеры и характеристики", "icon": "view_column"},
}

for coll, meta in notes.items():
    r = api("PATCH", f"/collections/{coll}", {"meta": meta})
    if r.status_code in (200, 204):
        print(f"  ✅ {coll}: note set")
    else:
        print(f"  ⚠️  {coll}: {r.status_code}")

# ═══════════════════════════════════════════════════════
# 6. GRANT PUBLIC READ FOR NEW COLLECTIONS
# ═══════════════════════════════════════════════════════
print("\n═══ 6. PUBLIC READ PERMISSIONS ═══\n")

policy_id = "abf8a154-5b1c-4a46-ac9c-7300570f4f17"
collections_needing_access = ["faq", "services", "service_features", "project_technologies", "cases"]

for coll in collections_needing_access:
    # Check if permission already exists
    check = api("GET", f"/permissions?filter[collection][_eq]={coll}&filter[policy][_eq]={policy_id}&filter[action][_eq]=read")
    if check.status_code == 200 and check.json().get("data"):
        print(f"  ⏭  {coll}: public read already set")
        continue

    r = api("POST", "/permissions", {
        "collection": coll,
        "action": "read",
        "fields": ["*"],
        "policy": policy_id,
    })
    if r.status_code in (200, 204):
        print(f"  ✅ {coll}: public read granted")
    else:
        print(f"  ⚠️  {coll}: {r.status_code}")


print("\n" + "="*50)
print("  ✅ ALL FIXES APPLIED SUCCESSFULLY")
print("="*50)
