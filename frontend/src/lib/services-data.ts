import {
    Drill, Layers, Anchor, Hammer, ArrowDownCircle,
    Activity, Shield, Construction, MoveVertical, Zap,
    Pickaxe, Component
} from "lucide-react";

export interface Service {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: any;
    features: string[];
    accent: string;
    relatedMachineryIds?: string[]; // IDs from machinery-data.ts
}

export const services: Service[] = [
    {
        id: "bored-piles",
        title: "Буронабивные сваи",
        subtitle: "Bored Piles (CFA / Kelly)",
        description: "Устройство свай по технологиям CFA (непрерывный полый шнек), Kelly и под защитой обсадной трубы. Оптимально для плотной застройки.",
        icon: Drill,
        features: ["Отсутствие опасных вибраций", "Глубина до 50 метров", "Диаметры 400-1500 мм"],
        accent: "bg-orange-500/10",
        relatedMachineryIds: ["bauer-bg28", "enteco-e400", "inteco-e6050"]
    },
    {
        id: "sheet-piling",
        title: "Шпунтовое ограждение",
        subtitle: "Sheet Piling Works",
        description: "Полный комплекс работ: вибропогружение, статическое вдавливание и извлечение шпунта Ларсена. Монтаж распорных систем.",
        icon: Layers,
        features: ["Вибропогружение (PVE)", "Статическое вдавливание", "Крепление котлованов"],
        accent: "bg-blue-500/10",
        relatedMachineryIds: ["giken-silent-piler", "pve-2316", "mkt-v35"]
    },
    {
        id: "sheet-pile-supply",
        title: "Поставка и Выкуп шпунта",
        subtitle: "Supply & Buy-Back",
        description: "Продажа и обратный выкуп шпунта Ларсена. Аренда шпунта. Оптимизация бюджета за счет системы Buy-Back (экономия до 80%).",
        icon: Component,
        features: ["Обратный выкуп (Buy-Back)", "Продажа нового и Б/У", "Аренда шпунта"],
        accent: "bg-orange-500/10",
        relatedMachineryIds: [] // No specific machinery for supply, maybe transport?
    },
    {
        id: "pile-driving",
        title: "Забивка свай",
        subtitle: "Driven Piling",
        description: "Погружение железобетонных свай сечением 300x300, 350x350, 400x400 мм современными гидравлическими молотами Junttan.",
        icon: Hammer,
        features: ["Сверхвысокая несущая способность", "Контроль отказа свай", "Производительность до 30 шт/смена"],
        accent: "bg-red-500/10",
        relatedMachineryIds: ["junttan-pm25"]
    },
    {
        id: "leader-drilling",
        title: "Лидерное бурение",
        subtitle: "Leader Drilling",
        description: "Предварительное бурение скважин для снижения вибрационного воздействия и облегчения погружения свай в плотные грунты.",
        icon: Anchor,
        features: ["Работа в мерзлых грунтах", "Снижение шума и вибрации", "Точное позиционирование"],
        accent: "bg-green-500/10",
        relatedMachineryIds: ["bauer-bg28", "enteco-e400"]
    },
    {
        id: "pile-pressing",
        title: "Вдавливание свай",
        subtitle: "Statically Pressed Piles",
        description: "Бесшумное погружение свай под давлением статической нагрузки (СВУ). Идеально для работы вблизи ветхих и аварийных зданий.",
        icon: ArrowDownCircle,
        features: ["Нулевая вибрация", "Работа 24/7 в городе", "Усилие до 300 тонн"],
        accent: "bg-purple-500/10",
        relatedMachineryIds: ["giken-silent-piler"] // Assuming Giken can also do some pile pressing or represents this category
    },
    {
        id: "jet-grouting",
        title: "Jet Grouting",
        subtitle: "Soil Stabilization",
        description: "Закрепление грунтов методом струйной цементации. Создание грунтоцементных свай и массивов для усиления фундаментов.",
        icon: Activity,
        features: ["Усиление фундаментов", "Противофильтрационные завесы", "Работа в стесненных условиях"],
        accent: "bg-cyan-500/10",
        relatedMachineryIds: ["enteco-e400"] // Often used for Jet Grouting
    },
    {
        id: "slurry-wall",
        title: "Стена в грунте",
        subtitle: "Diaphragm Wall",
        description: "Возведение подземных сооружений и ограждающих конструкций котлованов методом «стена в грунте».",
        icon: Shield,
        features: ["Глубина до 40+ метров", "Высокая водонепроницаемость", "Несущая способность"],
        accent: "bg-slate-500/10",
        relatedMachineryIds: ["bauer-bg28"] // Grab buckets usually used with heavy rigs
    },
    {
        id: "vibroflotation",
        title: "Виброфлотация",
        subtitle: "Vibroflotation",
        description: "Глубинное уплотнение несвязных грунтов виброустановками для повышения их несущей способности.",
        icon: MoveVertical,
        features: ["Уплотнение песков", "Снижение риска разжижения", "Экономичность"],
        accent: "bg-yellow-500/10",
        relatedMachineryIds: ["pve-2316"] // Vibrators used
    },
    {
        id: "micropiles",
        title: "Микросваи",
        subtitle: "Micropiles & Anchors",
        description: "Устройство буроинъекционных свай малого диаметра и грунтовых анкеров для крепления котлованов.",
        icon: Component,
        features: ["Работа внутри зданий", "Усиление склонов", "Анкерное крепление"],
        accent: "bg-teal-500/10",
        relatedMachineryIds: ["inteco-e6050"] // Compact rigs
    }
];
