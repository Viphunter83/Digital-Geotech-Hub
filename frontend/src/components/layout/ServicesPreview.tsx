"use client";

import { motion } from "framer-motion";
import { Hammer, Truck, Ruler, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { resolveIcon } from "@/lib/icon-map";
import { fetchFromDirectus } from "@/lib/directus-fetch";

const services = (region: 'msk' | 'spb') => [
    {
        title: "Буронабивные сваи",
        description: "Устройство БНС любой сложности, включая работу в скальных породах и в условиях Крайнего Севера.",
        icon: <Ruler className="w-8 h-8" />,
        stats: "15+ лет опыта",
        id: "01",
        tag: region === 'spb' ? "Реставрация" : "Heavy-Duty"
    },
    {
        title: "Шпунтовые работы",
        description: "Погружение, извлечение и аренда шпунта Ларсена. Вибропогружение и статическое вдавливание (Silent Piler).",
        icon: <Hammer className="w-8 h-8" />,
        stats: "Свой парк техники",
        id: "02",
        tag: region === 'spb' ? "Silent Piler" : "Парк 20+ ед."
    },
    {
        title: "Аренда техники",
        description: "Буровые установки Enteco, Inteco, копры Junttan и гусеничные краны Manitowoc в аренду.",
        icon: <Truck className="w-8 h-8" />,
        stats: "Доставка по РФ",
        id: "03",
        tag: region === 'msk' ? "Склады в МО" : "Оперативно"
    },
    {
        title: "Нулевой цикл",
        description: "Комплексные работы по подготовке основания, лидерное бурение и устройство свайных полей.",
        icon: <ShieldCheck className="w-8 h-8" />,
        stats: "Гарантия качества",
        id: "04",
        tag: region === 'spb' ? "Сложные глины" : "Макс. темп"
    }
];

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    icon_name: string;
    tag_msk: string;
    tag_spb: string;
    stats_label: string;
}

export function ServicesPreview({ region = 'spb' }: { region?: 'msk' | 'spb' }) {
    const [cmsServices, setCmsServices] = useState<ServiceItem[]>([]);

    useEffect(() => {
        fetchFromDirectus('services', {
            filter: { featured: { _eq: true } },
            fields: ['id', 'title', 'description', 'icon_name', 'tag_msk', 'tag_spb', 'stats_label']
        }).then(data => {
            if (data && Array.isArray(data)) {
                setCmsServices(data as ServiceItem[]);
            }
        });
    }, []);

    const currentServices = cmsServices.length > 0
        ? cmsServices.map((s, i) => {
            const IconComponent = resolveIcon(s.icon_name);
            return {
                title: s.title || "Служба",
                description: s.description || "",
                icon: <IconComponent className="w-8 h-8" />,
                stats: s.stats_label || "15+ лет опыта",
                id: String(i + 1).padStart(2, '0'),
                tag: region === 'spb' ? s.tag_spb : s.tag_msk
            };
        })
        : services(region);

    return (
        <section className="py-32 px-6 bg-transparent relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

            <div className="container mx-auto relative z-10">
                <div className="mb-24 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <div className="h-px w-12 bg-accent" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-accent">Наши направления</h2>
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white leading-none"
                    >
                        Инженерное <span className="text-accent italic">превосходство</span><br />в каждой детали
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {currentServices.map((service, index) => (
                        <Link
                            href={
                                service.id === "03" ? "/machinery" :
                                    service.id === "02" ? "/services#catalog" :
                                        "/services"
                            }
                            key={index}
                            className="block h-full"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                whileHover={{ y: -12 }}
                                className="group relative flex flex-col h-full bg-white/[0.02] backdrop-blur-sm border border-white/10 p-10 rounded-3xl overflow-hidden transition-all duration-500 hover:border-accent/40 hover:bg-white/[0.04]"
                            >
                                {/* Background Number */}
                                <span className="absolute top-4 right-8 text-8xl font-black text-white/[0.08] select-none transition-all group-hover:text-accent/30 group-hover:scale-110 duration-500">
                                    {service.id}
                                </span>

                                {/* Icon Wrapper */}
                                <div className="relative z-10 mb-8 p-5 bg-white/[0.05] rounded-2xl w-fit text-white group-hover:bg-accent group-hover:text-white group-hover:rotate-12 transition-all duration-500">
                                    {service.icon}
                                </div>

                                <div className="relative z-10 flex-grow">
                                    {service.tag && (
                                        <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[9px] font-black uppercase tracking-widest text-accent mb-4">
                                            {service.tag}
                                        </span>
                                    )}
                                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter text-white transition-colors group-hover:text-accent">
                                        {service.title}
                                    </h4>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-10">
                                        {service.description}
                                    </p>
                                </div>

                                <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{service.stats}</span>
                                        <div className="h-0.5 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                                    </div>

                                    <div
                                        className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-500"
                                    >
                                        <ArrowUpRight className="w-5 h-5" />
                                    </div>
                                </div>

                                {/* Hover Glow Effect */}
                                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/20 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
