import { fetchFromDirectus } from './directus-fetch';
import { resolveIcon } from './icon-map';
import {
    Drill, Layers, Anchor, Hammer, ArrowDownCircle,
    Activity, Shield, Construction, MoveVertical, Pickaxe,
    type LucideIcon,
} from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ServiceFeature {
    text: string;
}

export interface Service {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: LucideIcon;
    features: string[];
    accent: string;
    relatedMachineryIds: string[];
}

/** Raw shape from Directus */
interface DirectusService {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string | null;
    accent_color: string | null;
    features?: { text: string; sort: number }[];
    related_machinery?: { machinery_id: string }[];
}

// ──────────────────────────────────────────────
// Fetch from Directus
// ──────────────────────────────────────────────

/**
 * Fetch all services from Directus.
 */
export async function fetchServices(): Promise<Service[]> {
    const data = await fetchFromDirectus<DirectusService>('services', {
        fields: [
            'id', 'title', 'subtitle', 'description', 'icon', 'accent_color',
            'features.text', 'features.sort',
            'related_machinery.machinery_id',
        ],
        sort: ['sort'],
    });

    if (data.length > 0) {
        return data.map(d => ({
            id: d.id,
            title: d.title,
            subtitle: d.subtitle ?? '',
            description: d.description ?? '',
            icon: resolveIcon(d.icon),
            features: (d.features ?? [])
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                .map(f => f.text),
            accent: d.accent_color ?? 'orange',
            relatedMachineryIds: d.related_machinery?.map(r => r.machinery_id) ?? [],
        }));
    }

    return SERVICES_FALLBACK;
}

// ──────────────────────────────────────────────
// Fallback Data
// ──────────────────────────────────────────────

export const SERVICES_FALLBACK: Service[] = [
    {
        id: "bored-piles",
        title: "Буронабивные сваи",
        subtitle: "Bored Piles (CFA / Kelly)",
        description: "Устройство свай диаметром от 300 до 2500 мм глубиной до 70 метров методами CFA и Kelly-бурения.",
        icon: Drill,
        features: [
            "Диаметр 300–2500 мм",
            "Глубина погружения до 70 м",
            "CFA и Kelly-технологии",
            "Работа в стесненных условиях"
        ],
        accent: "orange",
        relatedMachineryIds: ["bauer-bg28", "enteco-e400"]
    },
    {
        id: "sheet-piling",
        title: "Шпунтовое ограждение",
        subtitle: "Sheet Piling (Larssen, трубошпунт)",
        description: "Погружение стального шпунта Ларсена и трубошпунта методами вибро- и статического вдавливания.",
        icon: Layers,
        features: [
            "Все типы шпунта Ларсена",
            "Трубошпунт до ⌀1220 мм",
            "Вибро- и статическое погружение",
            "Идеально для котлованов в городе"
        ],
        accent: "blue",
        relatedMachineryIds: ["giken-silent-piler", "pve-2316", "manitowoc-222"]
    },
    {
        id: "pile-driving",
        title: "Забивка ЖБ свай",
        subtitle: "Driven Precast Piles (RC)",
        description: "Забивка и вдавливание железобетонных свай сечением до 400×400 мм. Контроль по отказу.",
        icon: Hammer,
        features: [
            "Сечение до 400×400 мм",
            "Длина до 24 метров",
            "Гидравлические молоты",
            "Мониторинг PDA в реальном времени"
        ],
        accent: "red",
        relatedMachineryIds: ["junttan-pm25", "bsp-356"]
    },
    {
        id: "pile-pressing",
        title: "Статическое вдавливание",
        subtitle: "Static Pile Pressing (Silent)",
        description: "Бесшумное погружение свай и шпунта методом статического вдавливания. Безопасно для исторической застройки.",
        icon: ArrowDownCircle,
        features: [
            "Отсутствие опасных вибраций",
            "Работа в историческом центре",
            "Усилие до 400 тонн",
            "Ночные работы без ограничений"
        ],
        accent: "green",
        relatedMachineryIds: ["giken-silent-piler"]
    },
    {
        id: "anchors",
        title: "Грунтовые анкеры",
        subtitle: "Ground Anchors (Temporary & Permanent)",
        description: "Устройство временных и постоянных грунтовых анкеров для крепления ограждающих конструкций котлованов.",
        icon: Anchor,
        features: [
            "Временные и постоянные",
            "Глубина до 30 м",
            "Испытание каждого анкера",
            "Инъекционная технология"
        ],
        accent: "purple",
        relatedMachineryIds: ["enteco-e400", "inteco-e6050"]
    },
    {
        id: "jet-grouting",
        title: "Струйная цементация",
        subtitle: "Jet Grouting (Mono / Bi / Triple)",
        description: "Укрепление и гидроизоляция грунтов методом струйной цементации (jet grouting) с контролем параметров.",
        icon: Activity,
        features: [
            "Моно-, би-, трёхкомпонентная",
            "Диаметр столбов до 2000 мм",
            "Укрепление и гидроизоляция",
            "Работа в сложных грунтах"
        ],
        accent: "cyan",
        relatedMachineryIds: ["bauer-bg28", "enteco-e400"]
    },
    {
        id: "slurry-wall",
        title: '«Стена в грунте»',
        subtitle: "Diaphragm Wall (Slurry Wall)",
        description: 'Устройство противофильтрационных завес и несущих конструкций методом «стена в грунте» глубиной до 45 м.',
        icon: Shield,
        features: [
            "Глубина до 45 м",
            "Толщина стены 600–1200 мм",
            "Несущая и ограждающая функция",
            "Минимальные деформации"
        ],
        accent: "indigo",
        relatedMachineryIds: ["bauer-bg28"]
    },
    {
        id: "micropiles",
        title: "Микросваи",
        subtitle: "Micropiles (Root Piles)",
        description: "Устройство микросвай диаметром до 300 мм для усиления фундаментов и работ в ограниченном пространстве.",
        icon: Construction,
        features: [
            "Диаметр 100–300 мм",
            "Высокая несущая способность",
            "Усиление исторических фундаментов",
            "Работа внутри зданий"
        ],
        accent: "orange",
        relatedMachineryIds: ["inteco-e6050"]
    },
    {
        id: "vibroflotation",
        title: "Виброуплотнение",
        subtitle: "Vibroflotation (Deep Compaction)",
        description: "Глубинное уплотнение несвязных грунтов методом виброфлотации. Повышение несущей способности основания.",
        icon: MoveVertical,
        features: [
            "Глубина обработки до 20 м",
            "Песчаные и гравийные грунты",
            "Повышение модуля деформации",
            "Контроль по CPT до и после"
        ],
        accent: "teal",
        relatedMachineryIds: ["pve-2316"]
    },
    {
        id: "leader-drilling",
        title: "Лидерное бурение",
        subtitle: "Pre-drilling (Leader Drilling)",
        description: "Предварительное бурение скважин для облегчения погружения свай и шпунта в плотных грунтах.",
        icon: Pickaxe,
        features: [
            "Разрыхление плотных слоёв",
            "Для свайных и шпунтовых работ",
            "Позволяет снизить вибрации",
            "Контроль глубины бурения"
        ],
        accent: "slate",
        relatedMachineryIds: ["bauer-bg28", "enteco-e400", "inteco-e6050"]
    }
];

/**
 * @deprecated Use fetchServices() instead. Kept for backward compatibility.
 */
export const services = SERVICES_FALLBACK;
