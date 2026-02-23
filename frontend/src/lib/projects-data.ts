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
    work_type: string;
    description: string;
    challenge: string;
    solution: string;
    year: number;
    latitude: number;
    longitude: number;
    tags?: string[] | { tag: string }[];
    technologies?: string | {
        name: string;
        type: string;
        description: string;
        image: string | null;
        specs?: { text: string }[];
    }[];
    stats?: string | { label: string; value: string; sort: number }[];
    used_machinery?: {
        machinery_id: {
            id: string;
            name: string;
            category_label: string;
            description: string;
            image: string | null;
            specs: { label: string; value: string; icon: string }[];
        };
    }[];
    photos?: {
        directus_files_id: {
            id: string;
        };
    }[];
    documents?: {
        directus_files_id: {
            id: string;
        };
    }[];
}

// ──────────────────────────────────────────────
// Transformers
// ──────────────────────────────────────────────

function transformProject(d: DirectusProject): Project {
    // Parse tags (support both array and JSON string)
    const rawTags = d.tags ?? [];
    let tags: string[] = [];
    if (typeof rawTags === 'string') {
        try { tags = JSON.parse(rawTags); } catch (e) { tags = []; }
    } else if (Array.isArray(rawTags)) {
        tags = rawTags.map(t => typeof t === 'string' ? t : (t as { tag: string }).tag);
    }

    // Parse technologies
    let rawTech = d.technologies ?? [];
    if (typeof rawTech === 'string') {
        try { rawTech = JSON.parse(rawTech); } catch (e) { rawTech = []; }
    }

    let technologies: ProjectTech[] = (rawTech as any[]).map(t => ({
        name: t.name,
        type: t.type ?? '',
        description: t.description ?? '',
        image: getDirectusFileUrl(t.image) ?? undefined,
        specs: (t as { specs?: { label?: string; text?: string; value: string }[] }).specs?.map((s) => ({
            label: s.label || s.text || '',
            value: s.value || '',
        })) ?? [],
    }));

    // Merge used_machinery from dynamic M2M
    if (d.used_machinery && d.used_machinery.length > 0) {
        const linkedTech: ProjectTech[] = d.used_machinery
            .filter(item => item.machinery_id)
            .map(item => {
                const m = item.machinery_id;
                return {
                    id: String(m.id),
                    name: m.name,
                    type: m.category_label || 'Оборудование',
                    description: m.description || '',
                    image: getDirectusFileUrl(m.image) || undefined,
                    specs: m.specs?.map(s => ({ label: s.label, value: s.value })) || []
                };
            });
        technologies = [...technologies, ...linkedTech];
    }

    // Image from photos
    const firstPhotoId = d.photos?.[0]?.directus_files_id?.id || d.photos?.[0]?.directus_files_id;
    const coverImage = firstPhotoId ? getDirectusFileUrl(String(firstPhotoId)) : '/assets/project-placeholder.png';

    // Parse stats
    let rawStats = d.stats ?? [];
    if (typeof rawStats === 'string') {
        try { rawStats = JSON.parse(rawStats); } catch (e) { rawStats = []; }
    }

    return {
        id: String(d.id),
        title: d.title,
        location: d.location ?? '',
        region: d.region ?? 'spb',
        category: d.work_type ?? '',
        description: d.description ?? '',
        challenge: d.challenge ?? '',
        solution: d.solution ?? d.description ?? '',
        year: String(d.year ?? ''),
        coordinates: [Number(d.latitude ?? 0), Number(d.longitude ?? 0)],
        image: coverImage!,
        tags: tags,
        technologies: technologies,
        stats: (rawStats as any[])
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
            'id', 'title', 'location', 'region', 'work_type',
            'description', 'challenge', 'solution', 'year',
            'latitude', 'longitude', 'status',
            'tags', 'technologies', 'stats',
            'used_machinery.machinery_id.*',
            'photos.directus_files_id',
            'documents.directus_files_id',
        ],
        filter: { status: { _eq: 'published' } },
        sort: ['-year'],
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
            'id', 'title', 'location', 'region', 'work_type',
            'description', 'challenge', 'solution', 'year',
            'latitude', 'longitude', 'status',
            'tags', 'technologies', 'stats',
            'used_machinery.machinery_id.*',
            'photos.directus_files_id',
            'documents.directus_files_id',
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
        description: "Устройство шпунтового ограждения котлована глубиной 24 м для строительства второй очереди МФК «Лахта Центр» — самого высокого небоскреба Европы. Проект требовал исключительной точности и отсутствия вибрационных воздействий на существующие конструкции.",
        challenge: "Нулевые допуски по вибрации из-за близости к фундаменту существующего комплекса «Лахта Центр». Крайне слабые водонасыщенные грунты (петербургские глины).",
        solution: "Применение технологии статического вдавливания Giken Silent Piler. Комплексный мониторинг напряженно-деформированного состояния грунта в режиме реального времени.",
        year: "2024",
        coordinates: [59.9871, 30.1776],
        image: "/assets/projects/lakhta.png",
        tags: ["Giken", "Статическое вдавливание", "Шпунт Ларсена", "Геомониторинг"],
        technologies: [
            {
                id: "5",
                name: "Giken Silent Piler F201",
                type: "Оборудование",
                description: "Установка статического вдавливания, использующая реактивное усилие для погружения шпунта без вибрации и шума. Идеальна для работы в плотной застройке.",
                image: "/images/machinery/giken_silent_piler.png",
                specs: [
                    { label: "Усилие вдавливания", value: "1500 кН" },
                    { label: "Усилие извлечения", value: "1600 кН" },
                    { label: "Шумность", value: "69 дБ" }
                ]
            },
            {
                name: "Шпунт Ларсена AZ 48",
                type: "Материал",
                description: "Высокопрочный стальной шпунт с широким профилем, обеспечивающий максимальную жесткость ограждения котлована при минимальном весе.",
            },
            {
                name: "Автоматизированный геомониторинг",
                type: "Технология",
                description: "Система инклинометрических датчиков и роботизированных тахеометров для контроля малейших перемещений грунта и конструкций.",
            }
        ],
        stats: [
            { label: "Глубина", value: "24 м" },
            { label: "Шпунт", value: "1250 тонн" },
            { label: "Срок", value: "6 мес." },
            { label: "Точность", value: "±5 мм" }
        ]
    },
    {
        id: "ust-luga",
        title: "Портовый комплекс в Усть-Луге",
        location: "Ленинградская область, Усть-Луга",
        region: "regions",
        category: "industrial",
        description: "Строительство фундаментов портовых сооружений и берегоукрепление. Работа велась в сложных метеоусловиях Финского залива с использованием тяжелого ударного и вибрационного флота.",
        challenge: "Тяжелые гидрометеорологические условия. Наличие в грунте крупных валунов. Необходимость погружения свай-оболочек диаметром 1420 мм на большую глубину.",
        solution: "Использование мощных вибропогружателей PVE с безрезонансным пуском и гидравлических молотов Junttan. Предварительное лидерное бурение для прохождения валунного слоя.",
        year: "2023",
        coordinates: [59.6833, 28.4333],
        image: "/assets/projects/ust-luga.png",
        tags: ["Сваи-оболочки", "PVE", "Junttan", "Берегоукрепление"],
        technologies: [
            {
                id: "6",
                name: "PVE 2316 VM",
                type: "Оборудование",
                description: "Высокочастотный вибропогружатель с переменным статическим моментом. Позволяет эффективно работать вблизи существующих сооружений без резонансных явлений.",
                image: "/images/machinery/pve_2316.png",
                specs: [
                    { label: "Центробежная сила", value: "1150 кН" },
                    { label: "Статический момент", value: "23 кгм" },
                    { label: "Макс. амплитуда", value: "16 мм" }
                ]
            },
            {
                id: "9",
                name: "Junttan PM 25",
                type: "Оборудование",
                description: "Универсальный копер для забивки свай с гидравлическим молотом высокой энергии. Контроль параметров забивки в реальном времени.",
                image: "/images/machinery/junttan_pm25.png",
                specs: [
                    { label: "Энергия удара", value: "115 кДж" },
                    { label: "Длина сваи", value: "до 16 м" },
                    { label: "Масса ударника", value: "7000 кг" }
                ]
            },
            {
                name: "Лидерное бурение",
                type: "Метод",
                description: "Технология предварительного разрушения плотных слоев грунта или препятствий для облегчения последующего погружения свай.",
            }
        ],
        stats: [
            { label: "Диаметр", value: "1420 мм" },
            { label: "Глубина", value: "32 м" },
            { label: "Кол-во свай", value: "450 шт." },
            { label: "Отклонение", value: "<1%" }
        ]
    },
    {
        id: "moscow-city",
        title: "Многофункциональный центр «Москва-Сити»",
        location: "Москва, Пресненская наб.",
        region: "msk",
        category: "civil",
        description: "Устройство глубокого свайного основания для небоскребов делового центра. Сложнейшая логистика в условиях действующего сити и необходимость параллельной работы нескольких буровых отрядов.",
        challenge: "Сверхплотный график работ. Необходимость бурения в скальных грунтах на большой глубине. Ограниченное пространство для маневрирования тяжелой техники.",
        solution: "Мобилизация 4-х буровых установок Bauer BG серии. Применение технологии Kelly-бурения с постоянной подачей бетона под давлением.",
        year: "2023",
        coordinates: [55.7494, 37.5375],
        image: "/assets/projects/moscow-city.png",
        tags: ["Bauer BG", "Kelly бурение", "Москва-Сити", "Свайный фундамент"],
        technologies: [
            {
                id: "1",
                name: "Bauer BG 28",
                type: "Оборудование",
                description: "Флагманская буровая установка для устройства свай большого диаметра. Оснащена системой автоматического мониторинга параметров бурения.",
                image: "/images/machinery/bauer_bg28.png",
                specs: [
                    { label: "Крутящий момент", value: "270 кНм" },
                    { label: "Макс. диаметр", value: "2500 мм" },
                    { label: "Глубина бурения", value: "до 71 м" }
                ]
            },
            {
                name: "Kelly-бурение с обсадной трубой",
                type: "Технология",
                description: "Метод циклического бурения с использованием телескопической штанги и инвентарных обсадных труб для укрепления стенок скважины.",
            },
            {
                name: "Высокопрочный бетон B35",
                type: "Материал",
                description: "Специальная бетонная смесь с повышенной подвижностью и прочностью, предназначенная для бетонирования глубоких свай методом ВПТ.",
            }
        ],
        stats: [
            { label: "Диаметр свай", value: "1500 мм" },
            { label: "Глубина", value: "48 м" },
            { label: "Бетон", value: "12500 м³" },
            { label: "Срок", value: "4 мес." }
        ]
    },
    {
        id: "kazan-expressway",
        title: "Трасса М-12 под Казанью — Опоры моста",
        location: "Республика Татарстан, Казань",
        region: "regions",
        category: "infrastructure",
        description: "Устройство фундаментов опор мостового перехода через реку Волгу. Работа в русле реки и на пойменных территориях в условиях сжатых сроков федерального строительства.",
        challenge: "Необходимость работы с плавсредств. Высокое давление подземных вод. Сложные литологические условия (чередование песков и глин).",
        solution: "Бурение под защитой бентонитового раствора. Применение длинномерных Kelly-штанг для достижения проектных отметок в коренных породах.",
        year: "2024",
        coordinates: [55.7887, 49.1221],
        image: "/assets/projects/kazan.png",
        tags: ["Мостовой переход", "Bauer BG 30", "ВПТ", "Бентонит"],
        technologies: [
            {
                id: "1",
                name: "Bauer BG 28",
                type: "Оборудование",
                description: "Мощная буровая установка для работы на мостовых переходах. Позволяет работать с тяжелым буровым инструментом в сложных грунтах.",
                image: "/images/machinery/bauer_bg28.png",
                specs: [
                    { label: "Крутящий момент", value: "270 кНм" },
                    { label: "Макс. диаметр", value: "2500 мм" },
                    { label: "Глубина бурения", value: "до 71 м" }
                ]
            },
            {
                name: "Бурение под бентонитовым раствором",
                type: "Технология",
                description: "Метод удержания стенок скважины от обрушения с помощью избыточного давления глинистого раствора.",
            },
            {
                name: "Ультразвуковой контроль свай",
                type: "Метод",
                description: "Метод Crosshole Sonic Logging для проверки сплошности бетона по всей глубине сваи.",
            }
        ],
        stats: [
            { label: "Глубина", value: "35 м" },
            { label: "Срок", value: "8 мес." },
            { label: "Грунт", value: "Скальные породы" },
            { label: "Мониторинг", value: "24/7" }
        ]
    },
    {
        id: "taman-port",
        title: "Порт Тамань — Берегоукрепление",
        location: "Краснодарский край, Тамань",
        region: "regions",
        category: "marine",
        description: "Строительство глубоководных причалов и волноломов. Реализация проекта в условиях открытого моря с применением специализированного дноуглубительного и сваебойного флота.",
        challenge: "Агрессивная морская среда. Большая глубина погружения элементов (до 32 м). Сейсмичность региона 8-9 баллов.",
        solution: "Применение трубошпунтовых конструкций большого диаметра. Антикоррозийная защита элементов методом бескрасочного эпоксидного напыления.",
        year: "2023",
        coordinates: [45.1333, 36.6667],
        image: "/assets/projects/taman.png",
        tags: ["Трубошпунт", "Причальная стенка", "Морские работы", "Сейсмостойкость"],
        technologies: [
            {
                id: "6",
                name: "PVE 2316 VM",
                type: "Оборудование",
                description: "Вибропогружатель, смонтированный на гусеничном кране большой грузоподъемности. Эффективен для погружения длинномерных труб в акватории.",
                image: "/images/machinery/pve_2316.png",
                specs: [
                    { label: "Вес", value: "9500 кг" },
                    { label: "Макс. частота", value: "2300 об/мин" },
                    { label: "Захваты", value: "Двойные универсальные" }
                ]
            },
            {
                name: "Трубошпунт ⌀1220 мм",
                type: "Материал",
                description: "Комбинированная конструкция, сочетающая высокую несущую способность трубы и замковое соединение шпунта.",
            },
            {
                name: "Эпоксидная антикоррозийная защита",
                type: "Технология",
                description: "Нанесение защитного слоя толщиной 600 мкм для обеспечения срока службы конструкций более 50 лет в соленой воде.",
            }
        ],
        stats: [
            { label: "Шпунт", value: "⌀1220 мм" },
            { label: "Глубина", value: "32 м" },
            { label: "Вес секции", value: "18 тонн" },
            { label: "Сейсмика", value: "9 баллов" }
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

