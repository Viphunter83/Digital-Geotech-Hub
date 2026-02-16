import { fetchFromDirectus, getDirectusFileUrl } from './directus-fetch';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ProjectTech {
    id?: string;
    name: string;
    type: string;
    description: string;
    image?: string;
    specs?: { label: string; value: string }[];
}

export interface ProjectStat {
    label: string;
    value: string;
}

export interface Project {
    id: string;
    title: string;
    location: string;
    region: string;
    category: string;
    description: string;
    challenge: string;
    solution: string;
    year: string;
    coordinates: [number, number];
    image: string;
    tags: string[];
    technologies: ProjectTech[];
    stats: ProjectStat[];
}

/** Raw shape from Directus */
interface DirectusProject {
    id: string;
    title: string;
    location: string;
    region: string;
    category: string;
    description: string;
    challenge: string;
    solution: string;
    year: string;
    latitude: number;
    longitude: number;
    image: string | null;
    tags?: { tag: string }[];
    technologies?: {
        name: string;
        type: string;
        description: string;
        image: string | null;
        specs?: { text: string }[];
    }[];
    stats?: { label: string; value: string; sort: number }[];
}

// ──────────────────────────────────────────────
// Transformers
// ──────────────────────────────────────────────

function transformProject(d: DirectusProject): Project {
    return {
        id: d.id,
        title: d.title,
        location: d.location ?? '',
        region: d.region ?? 'spb',
        category: d.category ?? '',
        description: d.description ?? '',
        challenge: d.challenge ?? '',
        solution: d.solution ?? '',
        year: d.year ?? '',
        coordinates: [d.latitude ?? 0, d.longitude ?? 0],
        image: getDirectusFileUrl(d.image) ?? '/assets/project-placeholder.png',
        tags: d.tags?.map(t => t.tag) ?? [],
        technologies: (d.technologies ?? []).map(t => ({
            name: t.name,
            type: t.type ?? '',
            description: t.description ?? '',
            image: getDirectusFileUrl(t.image) ?? undefined,
        })),
        stats: (d.stats ?? [])
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
            .map(s => ({ label: s.label, value: s.value })),
    };
}

// ──────────────────────────────────────────────
// Fetch from Directus
// ──────────────────────────────────────────────

/**
 * Fetch all published projects from Directus.
 */
export async function fetchProjects(): Promise<Project[]> {
    const data = await fetchFromDirectus<DirectusProject>('projects', {
        fields: [
            'id', 'title', 'location', 'region', 'category',
            'description', 'challenge', 'solution', 'year',
            'latitude', 'longitude', 'image',
            'tags.tag',
            'technologies.name', 'technologies.type', 'technologies.description', 'technologies.image',
            'stats.label', 'stats.value', 'stats.sort',
        ],
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
    });

    if (data.length > 0) return data.map(transformProject);
    return PROJECTS_FALLBACK;
}

/**
 * Fetch a single project by ID from Directus.
 */
export async function fetchProjectById(id: string): Promise<Project | null> {
    const data = await fetchFromDirectus<DirectusProject>('projects', {
        fields: [
            'id', 'title', 'location', 'region', 'category',
            'description', 'challenge', 'solution', 'year',
            'latitude', 'longitude', 'image',
            'tags.tag',
            'technologies.name', 'technologies.type', 'technologies.description', 'technologies.image',
            'stats.label', 'stats.value', 'stats.sort',
        ],
        filter: {
            id: { _eq: id },
            status: { _eq: 'published' },
        },
        limit: 1,
    });

    if (data.length > 0) return transformProject(data[0]);
    return PROJECTS_FALLBACK.find(p => p.id === id) ?? null;
}

// ──────────────────────────────────────────────
// Fallback Data
// ──────────────────────────────────────────────

export const PROJECTS_FALLBACK: Project[] = [
    {
        id: "lakhta-2",
        title: "МФК «Лахта Центр 2»",
        location: "Санкт-Петербург, Приморский район",
        region: "spb",
        category: "civil",
        description: "Устройство шпунтового ограждения котлована глубиной 24 м для строительства второй очереди МФК «Лахта Центр» — нового знакового проекта Приморского района.",
        challenge: "Нулевые допуски по вибрации из-за близости к существующему комплексу «Лахта Центр». Слабые водонасыщенные грунты (мягкие глины и плывуны).",
        solution: "Использование технологии статического вдавливания Giken Silent Piler, обеспечившей вибрационный фон на уровне менее 0.5 мм/с. Комбинация тяжёлого шпунта AZ 46-700N.",
        year: "2024",
        coordinates: [59.9871, 30.1776],
        image: "/assets/lakhta2.png",
        tags: ["Giken Silent Piler", "Шпунт Ларсена AZ 46", "Мониторинг осадок"],
        technologies: [
            {
                name: "Giken Silent Piler F201",
                type: "Оборудование",
                description: "Установка статического вдавливания с усилием до 200 тонн. Обеспечивает погружение шпунта без вибраций.",
                image: "/images/machinery/giken_silent_piler.png",
            },
            {
                name: "Геомониторинг в реальном времени",
                type: "Технология",
                description: "Система датчиков инклинометров и марок на соседних зданиях с передачей данных в облако.",
            }
        ],
        stats: [
            { label: "Глубина", value: "24 м" },
            { label: "Периметр", value: "1250 м" },
            { label: "Вибрация", value: "<0.5 мм/с" },
            { label: "Срок", value: "6 мес." }
        ]
    },
    {
        id: "metro-spasskaya",
        title: "Станция «Спасская» — Выход №2",
        location: "Санкт-Петербург, Сенная площадь",
        region: "spb",
        category: "infrastructure",
        description: "Устройство крепления глубокого котлована у вестибюля станции метро «Спасская» в условиях исторической застройки.",
        challenge: "Зона охраны объектов культурного наследия. Водонасыщенные грунты. Действующие коммуникации.",
        solution: "Применение буросекущих свай CFA диаметром 750 мм + многоуровневая распорная система с постоянным геомониторингом.",
        year: "2025",
        coordinates: [59.9275, 30.3162],
        image: "/assets/metro-spasskaya.png",
        tags: ["Буросекущие сваи", "CFA технология", "Историческая застройка"],
        technologies: [
            {
                name: "Bauer BG 28",
                type: "Оборудование",
                description: "Буровая установка для устройства свай большого диаметра в стесненных городских условиях.",
                image: "/images/machinery/bauer_bg28.png"
            }
        ],
        stats: [
            { label: "Глубина", value: "32 м" },
            { label: "Кол-во свай", value: "480 шт." },
            { label: "Осадки", value: "<3 мм" },
            { label: "Срок", value: "14 мес." }
        ]
    },
    {
        id: "kamennoostrovskiy",
        title: "ЖК «Каменноостровский»",
        location: "Санкт-Петербург, Петроградская сторона",
        region: "spb",
        category: "residential",
        description: "Комплексный нулевой цикл: шпунтовое ограждение + буронабивные сваи для элитного жилого комплекса на набережной.",
        challenge: "Предельно стесненная площадка на Петроградской стороне. Высокий уровень грунтовых вод.",
        solution: "Комбинированное решение: статическое вдавливание шпунта для ограждения + свайное поле из 320 буронабивных свай CFA ⌀600 мм.",
        year: "2024",
        coordinates: [59.9632, 30.3082],
        image: "/assets/kamennoostrovsky.png",
        tags: ["Статическое вдавливание", "CFA сваи", "Элитная застройка"],
        technologies: [
            {
                name: "Giken Silent Piler",
                type: "Оборудование",
                description: "Бесшумная установка для вдавливания шпунта в жилых кварталах.",
                image: "/images/machinery/giken_silent_piler.png"
            },
            {
                name: "Enteco E400",
                type: "Оборудование",
                description: "Универсальная буровая для CFA свай ⌀600 мм с автоматическим контролем параметров.",
                image: "/images/machinery/enteco_e400.png"
            }
        ],
        stats: [
            { label: "Шпунт", value: "720 м" },
            { label: "CFA сваи", value: "320 шт." },
            { label: "Площадь", value: "4500 м²" },
            { label: "Срок", value: "8 мес." }
        ]
    },
    {
        id: "moscow-ics",
        title: "ICS Москва-Сити",
        location: "Москва, Пресненская наб.",
        region: "msk",
        category: "civil",
        description: "Устройство свайного основания для нового офисного комплекса в Москва-Сити. Буронабивные сваи большого диаметра.",
        challenge: "Крайне сжатые сроки. Сложная логистика в условиях действующего делового центра.",
        solution: "Параллельная работа 3-х буровых установок Bauer BG 28 по 24-часовому графику. Координация поставок бетона с 2-х заводов.",
        year: "2023",
        coordinates: [55.7494, 37.5375],
        image: "/assets/moscow-ics.png",
        tags: ["Буронабивные сваи", "Kelly бурение", "Москва-Сити"],
        technologies: [
            {
                name: "Bauer BG 28 (3 единицы)",
                type: "Оборудование",
                description: "Развернуто 3 установки для параллельного бурения свай ⌀1500 мм.",
                image: "/images/machinery/bauer_bg28.png"
            }
        ],
        stats: [
            { label: "⌀ свай", value: "1500 мм" },
            { label: "Глубина", value: "45 м" },
            { label: "Кол-во", value: "120 шт." },
            { label: "Срок", value: "4 мес." }
        ]
    },
    {
        id: "baltic-pearl",
        title: "ЖК «Балтийская Жемчужина» — III очередь",
        location: "Санкт-Петербург, Юго-Запад",
        region: "spb",
        category: "residential",
        description: "III очередь масштабного проекта: забивка 1200 ЖБ свай 350×350 для жилых корпусов на намывных территориях.",
        challenge: "Намывные грунты. Необходимость забивки через плотные прослойки песка.",
        solution: "Использование дизель-молотов Junttan PM 25 с предварительным лидерным бурением через плотные песчаные линзы.",
        year: "2024",
        coordinates: [59.8522, 30.1485],
        image: "/assets/baltic-pearl.png",
        tags: ["Забивка ЖБ свай", "Лидерное бурение", "Намывные территории"],
        technologies: [
            {
                name: "Junttan PM 25",
                type: "Оборудование",
                description: "Сваебойная установка с гидравлическим молотом для забивки свай 350×350 мм.",
                image: "/images/machinery/junttan_pm25.png"
            },
            {
                name: "Inteco E6050",
                type: "Оборудование",
                description: "Компактная буровая для лидерного бурения скважин перед забивкой.",
                image: "/images/machinery/inteco_e6050.png"
            }
        ],
        stats: [
            { label: "Свай забито", value: "1200 шт." },
            { label: "Сечение", value: "350×350" },
            { label: "Глубина", value: "18 м" },
            { label: "Срок", value: "5 мес." }
        ]
    }
];

/**
 * @deprecated Use fetchProjects() instead.
 */
export const PROJECTS = PROJECTS_FALLBACK;

/**
 * @deprecated Use ProjectTech instead.
 */
export type ProjectTechnology = ProjectTech;

