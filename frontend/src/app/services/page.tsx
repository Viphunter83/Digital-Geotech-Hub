"use client";

import { motion } from "framer-motion";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { Drill, Layers, Anchor, Hammer, ArrowDownCircle, CheckSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
    {
        id: "bored-piles",
        title: "Буронабивные сваи",
        subtitle: "Bored Piles (CFA / Kelly)",
        description: "Устройство свай по технологиям CFA (непрерывный полый шнек), Kelly и под защитой обсадной трубы. Оптимально для плотной застройки.",
        icon: Drill,
        features: ["Отсутствие опасных вибраций", "Глубина до 50 метров", "Диаметры 400-1500 мм"],
        accent: "bg-orange-500/10"
    },
    {
        id: "sheet-piling",
        title: "Шпунтовое ограждение",
        subtitle: "Sheet Piling Works",
        description: "Погружение и извлечение шпунта Ларсена. Устройство распорных систем и анкерного крепления котлованов любой сложности.",
        icon: Layers,
        features: ["Вибропогружение (PVE)", "Статическое вдавливание", "Аренда шпунта (Buy-Back)"],
        accent: "bg-blue-500/10"
    },
    {
        id: "pile-driving",
        title: "Забивка свай",
        subtitle: "Driven Piling",
        description: "Погружение железобетонных свай сечением 300x300, 350x350, 400x400 мм современными гидравлическими молотами Junttan.",
        icon: Hammer,
        features: ["Сверхвысокая несущая способность", "Контроль отказа свай", "Производительность до 30 шт/смена"],
        accent: "bg-red-500/10"
    },
    {
        id: "leader-drilling",
        title: "Лидерное бурение",
        subtitle: "Leader Drilling",
        description: "Предварительное бурение скважин для снижения вибрационного воздействия и облегчения погружения свай в плотные грунты.",
        icon: Anchor,
        features: ["Работа в мерзлых грунтах", "Снижение шума и вибрации", "Точное позиционирование"],
        accent: "bg-green-500/10"
    },
    {
        id: "pile-pressing",
        title: "Вдавливание свай",
        subtitle: "Statically Pressed Piles",
        description: "Бесшумное погружение свай под давлением статической нагрузки (СВУ). Идеально для работы вблизи ветхих и аварийных зданий.",
        icon: ArrowDownCircle,
        features: ["Нулевая вибрация", "Работа 24/7 в городе", "Усилие до 300 тонн"],
        accent: "bg-purple-500/10"
    }
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 px-6 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <SubPageHero
                    title="Инженерные"
                    accentTitle="компетенции"
                    description="Проектирование и реализация полного цикла работ нулевого цикла. Собственный парк спецтехники и команда инженеров высшей квалификации."
                    badgeText="Service Catalog v2.0"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, idx) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-orange-500/50 transition-all duration-500 flex flex-col h-full"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${service.accent} border border-white/5 group-hover:scale-110 transition-transform`}>
                                <service.icon className="w-7 h-7 text-orange-500" />
                            </div>

                            <div className="mb-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{service.subtitle}</span>
                                <h3 className="text-2xl font-black uppercase mt-1 group-hover:text-orange-500 transition-colors">
                                    {service.title}
                                </h3>
                            </div>

                            <p className="text-sm text-white/50 leading-relaxed mb-8 flex-1">
                                {service.description}
                            </p>

                            <div className="space-y-3 mb-8">
                                {service.features.map((feature, fIdx) => (
                                    <div key={fIdx} className="flex items-center gap-3">
                                        <div className="w-1 h-1 rounded-full bg-orange-500" />
                                        <span className="text-[11px] font-mono text-white/70 uppercase tracking-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                className="w-full bg-white/5 border-white/10 hover:bg-orange-500 hover:text-[#0F172A] hover:border-orange-500 font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl transition-all"
                            >
                                Подробнее <ArrowRight className="w-3 h-3 ml-2" />
                            </Button>

                            {/* Decorative element */}
                            <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <service.icon className="w-20 h-20" />
                            </div>
                        </motion.div>
                    ))}

                    {/* Industrial Placeholder for CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-orange-500 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group border border-orange-400"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px]" />

                        <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 relative z-10 shadow-2xl">
                            <CheckSquare className="w-8 h-8 text-orange-500" />
                        </div>
                        <h4 className="text-2xl font-black text-[#0F172A] uppercase mb-4 relative z-10">Нужен расчет <br />вашего проекта?</h4>
                        <p className="text-[#0F172A]/70 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">Проведем аудит и подготовим <br />смету за 60 минут</p>
                        <Button className="w-full bg-[#0F172A] text-white hover:bg-[#1E293B] font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl relative z-10">
                            Связаться с ГИП
                        </Button>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
