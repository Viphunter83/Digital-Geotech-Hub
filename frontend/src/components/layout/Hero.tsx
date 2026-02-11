"use client";

import { motion } from "framer-motion";
import { ArrowRight, Drill, Construction, HardHat } from "lucide-react";

interface HeroProps {
    region: 'msk' | 'spb';
}

const geoConfigs = {
    spb: {
        title: "Digital Geotech Hub — СПб",
        usp: "Нулевой цикл в условиях исторической застройки Санкт-Петербурга. 15+ лет опыта и деликатное погружение шпунта (Silent Piler).",
        cta: "Рассчитать смету для СПб"
    },
    msk: {
        title: "Digital Geotech Hub — МСК",
        usp: "Оперативная перебазировка тяжелой техники в Москву и МО. Лидерное бурение и устройство свайных полей в рекордные сроки.",
        cta: "Рассчитать смету для МСК"
    }
};

export function Hero({ region }: HeroProps) {
    const config = geoConfigs[region] || geoConfigs.spb;

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    src="/hero-main.png"
                    alt="Geotech Digital Hub"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom opacity-70"
                />
                {/* Overlays for depth and readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/40 to-[#0F172A]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-transparent to-[#0F172A]/80" />

                {/* Animated Light Spots */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#F97316_0,rgba(249,115,22,0)_60%)] opacity-30 blur-[120px]" />
            </div>

            <div className="container relative z-10 mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                    </span>
                    Цифровая экосистема 2026 • {region.toUpperCase()}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
                >
                    {config.title.split('—')[0]} <span className="text-accent">{config.title.split('—')[1]}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground sm:text-xl"
                >
                    {config.usp}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <button className="group relative overflow-hidden rounded-md bg-primary px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95">
                        <span className="relative z-10 flex items-center gap-2">
                            Смотреть каталог <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-accent to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                    <button
                        onClick={() => document.getElementById('copilot')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-md border-2 border-primary/10 bg-white/50 px-8 py-4 font-bold text-primary backdrop-blur-md transition-all hover:bg-white hover:shadow-lg active:scale-95"
                    >
                        {config.cta}
                    </button>
                </motion.div>
            </div>

            {/* Floating Technical Icons */}
            <TechnicalBadge icon={<Drill />} className="top-1/4 left-10 delay-75" label="Буровые" />
            <TechnicalBadge icon={<Construction />} className="bottom-1/3 right-12 delay-150" label="Шпунт" />
            <TechnicalBadge icon={<HardHat />} className="top-1/2 right-1/4 delay-300" label="Спецтехника" />
        </section>
    );
}

function TechnicalBadge({ icon, className, label }: { icon: React.ReactNode, className?: string, label: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.8, scale: 1 }}
            whileHover={{ opacity: 1, scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            className={`absolute hidden lg:flex flex-col items-center gap-2 text-primary ${className}`}
        >
            <div className="p-3 bg-white/40 ring-1 ring-primary/10 rounded-xl backdrop-blur-xl shadow-2xl">
                {icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        </motion.div>
    );
}
