"use client";

import { motion } from "framer-motion";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { Shield, Target, Users, Award, Building, HardHat, TrendingUp, Cpu, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchFromDirectus } from "@/lib/directus-fetch";
import { resolveIcon } from "@/lib/icon-map";

interface Stat {
    label: string;
    value: string;
    description: string;
}

interface Value {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
}

const colorMap: Record<string, string> = {
    orange: "text-orange-500",
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    red: "text-red-500",
    cyan: "text-cyan-500",
};

const statsFallback: Stat[] = [
    { label: "Лет опыта", value: "15+", description: "Безупречной репутации на рынке" },
    { label: "Единиц техники", value: "40+", description: "Современного парка оборудования" },
    { label: "Проектов", value: "850+", description: "Успешно завершенных объектов" },
    { label: "Инженеров", value: "25+", description: "Высшей квалификационной категории" }
];

const valuesFallback: Value[] = [
    {
        title: "Технологическое превосходство",
        description: "Мы постоянно инвестируем в обновление парка, выбирая лучшие мировые образцы техники от BAUER до JUNTTAN.",
        icon: Cpu,
        color: "text-orange-500"
    },
    {
        title: "Инженерный подход",
        description: "Каждый проект проходит через глубокую техническую экспертизу. Мы не просто бурим, мы решаем сложные задачи.",
        icon: Target,
        color: "text-blue-500"
    },
    {
        title: "Надежность и Безопасность",
        description: "Строгое соблюдение ГОСТ, СНиП и отраслевых стандартов безопасности — наш безусловный приоритет.",
        icon: Shield,
        color: "text-green-500"
    },
    {
        title: "Команда экспертов",
        description: "Наши сотрудники регулярно проходят стажировки у производителей оборудования и аттестацию в Ростехнадзоре.",
        icon: Users,
        color: "text-purple-500"
    }
];

export default function AboutPage() {
    const [stats, setStats] = useState<Stat[]>(statsFallback);
    const [values, setValues] = useState<Value[]>(valuesFallback);

    useEffect(() => {
        // Load stats
        fetchFromDirectus<{ label: string; value: string; description: string }>('company_stats', {
            fields: ['label', 'value', 'description'],
            sort: ['sort'],
        }).then(data => { if (data.length > 0) setStats(data); });

        // Load values
        fetchFromDirectus<{ title: string; description: string; icon: string; accent_color: string }>('company_values', {
            fields: ['title', 'description', 'icon', 'accent_color'],
            sort: ['sort'],
        }).then(data => {
            if (data.length > 0) {
                setValues(data.map(d => ({
                    title: d.title,
                    description: d.description,
                    icon: resolveIcon(d.icon),
                    color: colorMap[d.accent_color] ?? "text-orange-500",
                })));
            }
        });
    }, []);
    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 px-6 overflow-hidden relative">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <SubPageHero
                    title="Инженерная"
                    accentTitle="экосистема"
                    description="Digital Geotech Hub — это союз технологий, опыта и ответственности. Мы создаем фундамент для амбициозных строительных проектов по всей России."
                    badgeText="Corporation Profile v1.4"
                    backLink="/"
                    backLabel="На главную"
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-8 bg-white/[0.03] border border-white/10 rounded-3xl text-center group hover:border-orange-500/30 transition-all"
                        >
                            <div className="text-4xl font-black text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-white mb-4">{stat.label}</div>
                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-widest">{stat.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-black uppercase mb-8 leading-tight">
                            Наша миссия — <br />
                            <span className="text-orange-500 text-6xl underline decoration-orange-500/20 underline-offset-8">Превосходить </span> <br />
                            ожидания рынка
                        </h2>
                        <div className="space-y-6 text-white/60 font-medium text-lg leading-relaxed">
                            <p>
                                За 15 лет работы мы прошли путь от небольшой подрядной организации до одного из лидеров отрасли шпунтовых и свайных работ в России.
                            </p>
                            <p>
                                Наша специализация — сложные проекты в условиях сверхплотной городской застройки, где требуются исключительная точность, деликатность и владение современными технологиями бесшумного погружения.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 relative group">
                            <img
                                src="https://images.unsplash.com/photo-1503387762-592eca589d4f?auto=format&fit=crop&q=80&w=1200"
                                alt="Construction Project"
                                className="w-full h-full object-cover grayscale opacity-50 group-hover:opacity-80 group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />

                            {/* Floating Card */}
                            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-500 rounded-xl">
                                        <Award className="w-6 h-6 text-[#0F172A]" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-widest mb-1">Сертификация</div>
                                        <div className="text-sm font-bold text-white/80 uppercase tracking-widest leading-tight">Члены СРО с допуском к работе на особо опасных объектах</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Values Grid */}
                <div>
                    <h3 className="text-3xl font-black uppercase mb-16 text-center">Наши фундаментальные ценности</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-white/5 border border-white/5 group-hover:scale-110 transition-transform`}>
                                    <value.icon className={`w-6 h-6 ${value.color}`} />
                                </div>
                                <h4 className="text-lg font-black uppercase mb-4 group-hover:text-orange-500 transition-colors">{value.title}</h4>
                                <p className="text-xs text-white/40 leading-relaxed font-bold uppercase tracking-widest">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
