"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SubPageHero } from "@/components/layout/SubPageHero";
import {
    Tractor, Drill, ArrowDownCircle, Settings,
    Truck, Ruler, Weight, Zap, ArrowRight,
    Search, Filter, Hammer, Anchor, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { LeadMagnetModal } from "@/components/layout/LeadMagnetModal";

const categories = [
    { id: 'all', label: 'Вся техника', icon: Tractor },
    { id: 'drilling', label: 'Буровые', icon: Drill },
    { id: 'piling', label: 'Сваебойные', icon: Hammer },
    { id: 'auxiliary', label: 'Вспомогательная', icon: Settings },
];

const machinery = [
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
        accent: "bg-orange-500/10"
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
        accent: "bg-blue-500/10"
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
        accent: "bg-red-500/10"
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
        accent: "bg-yellow-500/10"
    },
    {
        id: "silent-piler-f3",
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
        accent: "bg-green-500/10"
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
        accent: "bg-purple-500/10"
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
        accent: "bg-teal-500/10"
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
        accent: "bg-indigo-500/10"
    }
];

export default function MachineryPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    const filteredMachinery = useMemo(() => {
        if (activeCategory === 'all') return machinery;
        return machinery.filter(item => item.category === activeCategory);
    }, [activeCategory]);

    const handleInquiry = (name: string) => {
        setSelectedItem(name);
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 px-6 overflow-hidden relative">
            {/* Background elements - Extreme Industrial Aesthetics */}
            <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-orange-500/[0.07] blur-[250px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute top-[40%] left-0 w-[900px] h-[900px] bg-blue-500/[0.07] blur-[250px] rounded-full -translate-x-1/3 pointer-events-none" />

            {/* Technical Blueprint Patterns */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:160px_160px] pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <SubPageHero
                    title="Технический"
                    accentTitle="арсенал"
                    description="Мы владеем одним из самых современных парков тяжелой инженерной техники в России. Bauer, Junttan, Giken — это не просто бренды, это гарантия успеха вашего проекта."
                    badgeText="Heavy Machinery Inventory"
                />

                {/* Filtering System */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 border
                                ${activeCategory === cat.id
                                    ? 'bg-orange-500 border-orange-500 text-[#0F172A] shadow-xl shadow-orange-500/20'
                                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20'}
                            `}
                        >
                            <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-[#0F172A]' : 'text-orange-500'}`} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Machinery Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredMachinery.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                className="group relative bg-[#1E293B]/40 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden hover:border-orange-500/50 transition-all duration-500"
                            >
                                {/* Technical Corner Accents */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500/20 rounded-tl-[40px] group-hover:border-orange-500 transition-colors" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500/20 rounded-br-[40px] group-hover:border-orange-500 transition-colors" />

                                <div className="flex flex-col h-full">
                                    {/* Image Section - Technical Blueprint Style */}
                                    <div className="h-72 relative overflow-hidden bg-[#0F172A]">
                                        <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
                                            <div className="absolute top-0 left-0 w-full h-px bg-orange-500/30" />
                                            <div className="absolute top-0 left-0 w-px h-full bg-orange-500/30" />
                                            <div className="absolute bottom-4 right-4 flex gap-2">
                                                <div className="w-1 h-1 bg-orange-500" />
                                                <div className="w-1 h-1 bg-orange-500/50" />
                                                <div className="w-1 h-1 bg-orange-500/20" />
                                            </div>
                                        </div>

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                        />

                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent z-10" />

                                        <div className="absolute top-6 left-6 z-20">
                                            <span className="bg-orange-500 text-[#0F172A] px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-2xl">
                                                {item.categoryLabel}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end">
                                            <span className="text-[10px] font-mono text-orange-500/50 uppercase tracking-widest">unit_ref_id</span>
                                            <span className="text-xs font-mono text-white/80 font-bold uppercase tracking-widest leading-none mt-1">
                                                #{item.id.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-10 flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="text-4xl font-black uppercase leading-tight mb-4 group-hover:text-orange-500 transition-colors">
                                                {item.name}
                                            </h3>

                                            <p className="text-sm text-white/50 leading-relaxed font-bold uppercase tracking-widest mb-10 border-l-2 border-orange-500/30 pl-6 line-clamp-2">
                                                {item.description}
                                            </p>

                                            {/* Blueprint Spec Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
                                                {/* Decorative Grid Lines */}
                                                <div className="absolute -top-4 -bottom-4 left-[33%] w-px bg-white/5 hidden sm:block" />
                                                <div className="absolute -top-4 -bottom-4 left-[66%] w-px bg-white/5 hidden sm:block" />

                                                {item.specs.map((spec, sIdx) => (
                                                    <div key={sIdx} className="relative group/spec">
                                                        <div className="flex items-center gap-2 mb-2 text-white/30">
                                                            <spec.icon className="w-3.5 h-3.5 text-orange-500" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">{spec.label}</span>
                                                        </div>
                                                        <div className="text-lg font-black font-mono text-white tracking-widest group-hover/spec:text-orange-500 transition-colors">
                                                            {spec.value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4">
                                            <Button
                                                onClick={() => handleInquiry(item.name)}
                                                className="flex-1 bg-orange-500 text-[#0F172A] hover:bg-orange-600 h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                                            >
                                                Заказать проект
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedItem(`Technical Specs: ${item.name}`);
                                                    setIsModalOpen(true);
                                                }}
                                                className="sm:w-16 h-16 bg-white/5 border-white/10 hover:border-orange-500 hover:bg-white/10 text-white/40 hover:text-orange-500 rounded-2xl flex items-center justify-center transition-all group/btn"
                                            >
                                                <Settings className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {/* Floating Badge Effect */}
                                <div className="absolute top-0 right-10 rotate-90 origin-top-right translate-y-2 opacity-[0.02] text-[80px] font-black uppercase pointer-events-none select-none">
                                    CORE UNIT
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="mt-32 p-1 relative overflow-hidden rounded-[50px] bg-gradient-to-br from-white/20 via-transparent to-white/20"
                >
                    <div className="bg-[#0F172A] rounded-[49px] p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden group">
                        {/* Blueprint decorative lines */}
                        <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-white/10" />
                        <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-white/10" />

                        <div className="p-10 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center shrink-0 relative z-10">
                            <Settings className="w-16 h-16 text-orange-500 animate-spin-slow" />
                            <div className="absolute inset-0 border-2 border-dashed border-orange-500/30 rounded-full animate-spin-slow" />
                        </div>

                        <div className="flex-1 relative z-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[9px] font-black uppercase tracking-widest mb-6">
                                Quality Assurance
                            </div>
                            <h4 className="text-4xl lg:text-5xl font-black uppercase text-white mb-6 leading-tight">Собственный <br />инженерный центр</h4>
                            <p className="text-white/50 text-base font-bold uppercase tracking-widest max-w-2xl leading-relaxed">
                                Каждая единица техники проходит регламентный аудит перед каждой мобилизацией. <span className="text-orange-500">Гарантируем бесперебойную работу</span> 24/7 в любых климатических условиях.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 relative z-10 w-full lg:w-auto">
                            <Button
                                onClick={() => {
                                    setSelectedItem("Certificates & Compliance");
                                    setIsModalOpen(true);
                                }}
                                className="bg-white text-[#0F172A] hover:bg-orange-500 px-12 h-20 rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all shadow-2xl"
                            >
                                Сертификаты
                            </Button>
                            <Button
                                onClick={() => {
                                    setSelectedItem("Rent & Project Inquiry");
                                    setIsModalOpen(true);
                                }}
                                className="bg-transparent border border-white/20 text-white hover:text-[#0F172A] hover:bg-white hover:border-transparent h-20 rounded-3xl px-12 font-black uppercase tracking-widest text-[11px] transition-all"
                            >
                                Аренда / Подряд
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div >

            <LeadMagnetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem?.includes("Technical") ? "Получить техпаспорт" : "Получить предложение"}
                subtitle={
                    selectedItem?.includes("Technical")
                        ? `Отправьте запрос на получение полных технических характеристик и схем для ${selectedItem.split(': ')[1]}.`
                        : selectedItem?.includes("Certificates")
                            ? "Отправьте запрос на получение пакета разрешительной документации и сертификатов качества."
                            : "Наш инженер свяжется с вами для обсуждения условий аренды или подряда в течение 60 минут."
                }
                magnetName={selectedItem || "General Machinery Inquiry"}
            />
        </main>
    );
}
