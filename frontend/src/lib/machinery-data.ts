import { fetchFromDirectus, getDirectusFileUrl } from './directus-fetch';
import { resolveIcon } from './icon-map';
import {
    Tractor, Drill, Hammer, Settings, Zap, Weight, Ruler,
    type LucideIcon,
} from "lucide-react";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface MachineryCategory {
    id: string;
    label: string;
    icon: LucideIcon;
}

export interface MachinerySpec {
    label: string;
    value: string;
    icon: LucideIcon;
}

export interface Machinery {
    id: string;
    name: string;
    category: string;
    categoryLabel: string;
    description: string;
    specs: MachinerySpec[];
    image: string;
    accent: string;
    relatedServiceIds?: string[];
}

/** Raw shape from Directus */
interface DirectusMachinery {
    id: string;
    name: string;
    category: { id: string } | string | null;
    category_label: string;
    description: string;
    image: string | null;
    accent_color: string | null;
    specs?: { label: string; value: string; icon: string; sort: number }[];
    related_services?: { services_id: string }[];
}

interface DirectusMachineryCategory {
    id: string;
    name: string;
    icon: string | null;
}

// ──────────────────────────────────────────────
// Color mapping
// ──────────────────────────────────────────────

const accentColorMap: Record<string, string> = {
    orange: "bg-orange-500/10",
    blue: "bg-blue-500/10",
    red: "bg-red-500/10",
    yellow: "bg-yellow-500/10",
    green: "bg-green-500/10",
    purple: "bg-purple-500/10",
    teal: "bg-teal-500/10",
    indigo: "bg-indigo-500/10",
    cyan: "bg-cyan-500/10",
    slate: "bg-slate-500/10",
};

function resolveAccent(color: string | null | undefined): string {
    if (!color) return "bg-white/5";
    return accentColorMap[color.toLowerCase()] ?? "bg-white/5";
}

// ──────────────────────────────────────────────
// Spec icon mapping
// ──────────────────────────────────────────────

const specIconMap: Record<string, LucideIcon> = {
    zap: Zap,
    weight: Weight,
    ruler: Ruler,
};

function resolveSpecIcon(name: string | null | undefined): LucideIcon {
    if (!name) return Zap;
    return specIconMap[name.toLowerCase()] ?? Zap;
}

// ──────────────────────────────────────────────
// Transformers
// ──────────────────────────────────────────────

function transformMachinery(d: DirectusMachinery): Machinery {
    const categoryId = typeof d.category === 'object' && d.category ? d.category.id : (d.category ?? 'auxiliary');
    return {
        id: String(d.id),
        name: d.name,
        category: categoryId,
        categoryLabel: d.category_label ?? '',
        description: d.description ?? '',
        specs: (d.specs ?? [])
            .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
            .map(s => ({
                label: s.label,
                value: s.value,
                icon: resolveSpecIcon(s.icon),
            })),
        image: getDirectusFileUrl(d.image) ?? '/images/machinery/placeholder.png',
        accent: resolveAccent(d.accent_color),
        relatedServiceIds: d.related_services?.map(r => r.services_id) ?? [],
    };
}

// ──────────────────────────────────────────────
// Fetch from Directus
// ──────────────────────────────────────────────

export async function fetchMachineryCategories(): Promise<MachineryCategory[]> {
    const data = await fetchFromDirectus<DirectusMachineryCategory>('machinery_categories', {
        fields: ['id', 'name', 'icon'],
    });

    if (data.length > 0) {
        return [
            { id: 'all', label: 'Вся техника', icon: Tractor },
            ...data.map(c => ({
                id: c.id,
                label: c.name,
                icon: resolveIcon(c.icon),
            })),
        ];
    }

    return machineryCategories;
}

export async function fetchMachinery(): Promise<Machinery[]> {
    const data = await fetchFromDirectus<DirectusMachinery>('machinery', {
        fields: [
            'id', 'name', 'category.id', 'category_label', 'description',
            'image', 'accent_color',
            'specs.label', 'specs.value', 'specs.icon', 'specs.sort',
            'related_services.services_id',
        ],
        sort: ['sort'],
    });

    if (data.length > 0) {
        return data.map(transformMachinery);
    }

    return MACHINERY_FALLBACK;
}

// ──────────────────────────────────────────────
// Fallback Data
// ──────────────────────────────────────────────

export const machineryCategories: MachineryCategory[] = [
    { id: 'all', label: 'Вся техника', icon: Tractor },
    { id: 'drilling', label: 'Буровые', icon: Drill },
    { id: 'piling', label: 'Сваебойные', icon: Hammer },
    { id: 'auxiliary', label: 'Вспомогательная', icon: Settings },
];

export const MACHINERY_FALLBACK: Machinery[] = [
    {
        id: "bauer-bg28",
        name: "Bauer BG 28",
        category: "drilling",
        categoryLabel: "Буровая установка",
        description: "Тяжелая буровая установка для устройства свай большого диаметра до 2500 мм и глубиной до 70 метров. Идеальна для Kelly-бурения.",
        specs: [
            { label: "Крутящий момент", value: "270 кНм", icon: Zap },
            { label: "Масса установки", value: "96 тонн", icon: Weight },
            { label: "Глубина бурения", value: "71 метр", icon: Ruler }
        ],
        image: "/images/machinery/bauer_bg28.png",
        accent: "bg-orange-500/10",
        relatedServiceIds: ["bored-piles", "slurry-wall", "leader-drilling"]
    },
    {
        id: "enteco-e400",
        name: "Enteco E400",
        category: "drilling",
        categoryLabel: "Буровая установка",
        description: "Универсальная установка для CFA бурения и устройства буронабивных свай. Высокая маневренность на средних объектах.",
        specs: [
            { label: "Крутящий момент", value: "240 кНм", icon: Zap },
            { label: "Масса установки", value: "75 тонн", icon: Weight },
            { label: "CFA Глубина", value: "24-28 м", icon: Ruler }
        ],
        image: "/images/machinery/enteco_e400.png",
        accent: "bg-blue-500/10",
        relatedServiceIds: ["bored-piles", "jet-grouting", "leader-drilling"]
    },
    {
        id: "junttan-pm25",
        name: "Junttan PM 25",
        category: "piling",
        categoryLabel: "Сваебойный копер",
        description: "Специализированный копер для забивки ЖБ свай. Гидравлическая система обеспечивает точный контроль энергии удара.",
        specs: [
            { label: "Энергия удара", value: "115 кДж", icon: Zap },
            { label: "Длина сваи", value: "16 метров", icon: Ruler },
            { label: "Масса молота", value: "7 тонн", icon: Weight }
        ],
        image: "/images/machinery/junttan_pm25.png",
        accent: "bg-red-500/10",
        relatedServiceIds: ["pile-driving"]
    },
    {
        id: "bsp-356",
        name: "BSP 356-9",
        category: "piling",
        categoryLabel: "Гидромолот",
        description: "Навесной гидравлический молот большой мощности для работы с крана. Эффективен для стальных труб и оболочек.",
        specs: [
            { label: "Энергия макс.", value: "125 кДж", icon: Zap },
            { label: "Масса ударника", value: "9 тонн", icon: Weight },
            { label: "Частота", value: "40-100 уд/м", icon: Ruler }
        ],
        image: "/images/machinery/bsp_356.png",
        accent: "bg-yellow-500/10",
        relatedServiceIds: ["pile-driving", "sheet-piling"]
    },
    {
        id: "giken-silent-piler",
        name: "Giken Silent Piler",
        category: "auxiliary",
        categoryLabel: "Вдавливающая установка",
        description: "Бесшумное погружение шпунта Ларсена. Работает по принципу реактивного усилия, не создавая вибраций.",
        specs: [
            { label: "Усилие", value: "1500 кН", icon: Zap },
            { label: "Масса", value: "12.5 тонн", icon: Weight },
            { label: "Шумность", value: "68 дБ(А)", icon: Ruler }
        ],
        image: "/images/machinery/giken_silent_piler.png",
        accent: "bg-green-500/10",
        relatedServiceIds: ["sheet-piling", "pile-pressing"]
    },
    {
        id: "pve-2316",
        name: "PVE 2316 VM",
        category: "auxiliary",
        categoryLabel: "Вибропогружатель",
        description: "Высокочастотный вибропогружатель с переменным статическим моментом. Безопасен для городской застройки.",
        specs: [
            { label: "Стат. момент", value: "0-23 кгм", icon: Zap },
            { label: "Центроб. сила", value: "1150 кН", icon: Weight },
            { label: "Амплитуда", value: "16 мм", icon: Ruler }
        ],
        image: "/images/machinery/pve_2316.png",
        accent: "bg-purple-500/10",
        relatedServiceIds: ["sheet-piling", "vibroflotation"]
    },
    {
        id: "manitowoc-222",
        name: "Manitowoc 222",
        category: "auxiliary",
        categoryLabel: "Гусеничный кран",
        description: "Надежный гусеничный кран для вспомогательных работ на стройплощадке и погружения шпунта с вибропогружателем.",
        specs: [
            { label: "Грузоподъем.", value: "100 тонн", icon: Weight },
            { label: "Длина стрелы", value: "61 метр", icon: Ruler },
            { label: "Скорость", value: "1.5 км/ч", icon: Zap }
        ],
        image: "/images/machinery/manitowoc_222.png",
        accent: "bg-teal-500/10",
        relatedServiceIds: ["sheet-piling", "bored-piles"]
    },
    {
        id: "inteco-e6050",
        name: "Inteco E6050",
        category: "drilling",
        categoryLabel: "Буровая установка",
        description: "Компактная и мощная буровая установка итальянского производства для работы в ограниченном пространстве.",
        specs: [
            { label: "Крутящий момент", value: "60 кНм", icon: Zap },
            { label: "Масса", value: "18.5 тонн", icon: Weight },
            { label: "Ширина базы", value: "2.3 м", icon: Ruler }
        ],
        image: "/images/machinery/inteco_e6050.png",
        accent: "bg-indigo-500/10",
        relatedServiceIds: ["micropiles", "leader-drilling"]
    }
];

/**
 * @deprecated Use fetchMachinery() instead. Kept for backward compatibility.
 */
export const machinery = MACHINERY_FALLBACK;
