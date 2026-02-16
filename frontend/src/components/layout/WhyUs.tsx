"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Award, Wrench, Clock, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchFromDirectus } from "@/lib/directus-fetch";
import { resolveIcon } from "@/lib/icon-map";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
    accent: string;
    bg: string;
}

// ──────────────────────────────────────────────
// Color mapping
// ──────────────────────────────────────────────

const colorMap: Record<string, { accent: string; bg: string }> = {
    orange: { accent: "text-orange-500", bg: "bg-orange-500/10" },
    blue: { accent: "text-blue-500", bg: "bg-blue-500/10" },
    green: { accent: "text-green-500", bg: "bg-green-500/10" },
    purple: { accent: "text-purple-500", bg: "bg-purple-500/10" },
    red: { accent: "text-red-500", bg: "bg-red-500/10" },
    cyan: { accent: "text-cyan-500", bg: "bg-cyan-500/10" },
    teal: { accent: "text-teal-500", bg: "bg-teal-500/10" },
    indigo: { accent: "text-indigo-500", bg: "bg-indigo-500/10" },
};

function resolveColor(name: string | null | undefined): { accent: string; bg: string } {
    if (!name) return colorMap.orange;
    return colorMap[name.toLowerCase()] ?? colorMap.orange;
}

// ──────────────────────────────────────────────
// Fallback
// ──────────────────────────────────────────────

const FEATURES_FALLBACK: Feature[] = [
    {
        icon: Clock,
        title: "15+ Лет Опыта",
        description: "Успешно работаем на рынке аренды и строительства в Санкт-Петербурге с 2008 года.",
        accent: "text-orange-500",
        bg: "bg-orange-500/10"
    },
    {
        icon: Award,
        title: "Официальный Дилер",
        description: "Эксклюзивный представитель ENTECO (Италия) и MKT (США) в России.",
        accent: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        icon: Wrench,
        title: "Собственный Парк",
        description: "Владеем парком тяжелой техники Bauer, Junttan, PVE. Никаких посредников.",
        accent: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        icon: ShieldCheck,
        title: "Допуск СРО",
        description: "Полный пакет разрешительной документации для работ на особо опасных объектах.",
        accent: "text-purple-500",
        bg: "bg-purple-500/10"
    }
];

export function WhyUs() {
    const [features, setFeatures] = useState<Feature[]>(FEATURES_FALLBACK);

    useEffect(() => {
        fetchFromDirectus<{
            title: string;
            description: string;
            icon: string;
            accent_color: string;
        }>('advantages', {
            fields: ['title', 'description', 'icon', 'accent_color'],
            sort: ['sort'],
        }).then(data => {
            if (data.length > 0) {
                setFeatures(data.map(d => {
                    const colors = resolveColor(d.accent_color);
                    return {
                        icon: resolveIcon(d.icon),
                        title: d.title,
                        description: d.description,
                        accent: colors.accent,
                        bg: colors.bg,
                    };
                }));
            }
        });
    }, []);

    return (
        <section className="py-20 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg} group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`w-6 h-6 ${feature.accent}`} />
                            </div>
                            <h3 className="text-xl font-black uppercase mb-2 text-white">{feature.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
