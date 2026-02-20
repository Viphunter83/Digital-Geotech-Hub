"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { LeadMagnetModal } from "./LeadMagnetModal";
import { fetchFromDirectus, getDirectusFileUrl } from "@/lib/directus-fetch";
import Link from "next/link";

interface HeroProps {
    region: 'msk' | 'spb';
}

interface HeroBadge {
    label: string;
    href: string;
    image: string | null;
    parallax_factor: number;
    pos_top?: string;
    pos_left?: string;
    pos_right?: string;
    pos_bottom?: string;
}

interface GeoConfig {
    title: string;
    usp: string;
    cta: string;
    background_image?: string | null;
    image_opacity?: number | null;
}

const geoConfigsFallback: Record<string, GeoConfig> = {
    spb: {
        title: "Terra Expert — СПб",
        usp: "Нулевой цикл в условиях исторической застройки Санкт-Петербурга. 15+ лет опыта и деликатное погружение шпунта (Silent Piler).",
        cta: "Рассчитать смету для СПб"
    },
    msk: {
        title: "Terra Expert — МСК",
        usp: "Оперативная перебазировка тяжелой техники в Москву и МО. Лидерное бурение и устройство свайных полей в рекордные сроки.",
        cta: "Рассчитать смету для МСК"
    }
};

export function Hero({ region }: HeroProps) {
    const [geoConfigs, setGeoConfigs] = useState(geoConfigsFallback);
    const [badges, setBadges] = useState<HeroBadge[]>([]);
    const config = geoConfigs[region] || geoConfigs.spb || geoConfigsFallback.spb;

    // Load hero configs from Directus
    useEffect(() => {
        // Fetch hero configs
        fetchFromDirectus<{ region: string; title: string; usp: string; cta_text: string; background_image: string | { id: string } | null; image_opacity: number }>('hero_configs', { // Type of RAW data from Directus
            fields: ['region', 'title', 'usp', 'cta_text', 'background_image', 'image_opacity'],
        }).then(data => {
            if (data.length > 0) {
                const configs: Record<string, GeoConfig> = {};
                data.forEach(d => {
                    configs[d.region] = {
                        title: d.title,
                        usp: d.usp,
                        cta: d.cta_text,
                        background_image: typeof d.background_image === 'object' && d.background_image !== null ? d.background_image.id : d.background_image, // Handle null case
                        image_opacity: d.image_opacity
                    };
                });
                setGeoConfigs(prev => ({ ...prev, ...configs }));
            }
        });

        // Fetch dynamic badges
        fetchFromDirectus<{ label: string; href: string; image: string | { id: string } | null; parallax_factor: number; pos_top?: string; pos_left?: string; pos_right?: string; pos_bottom?: string }>('hero_badges', {
            fields: ['label', 'href', 'image', 'parallax_factor', 'pos_top', 'pos_left', 'pos_right', 'pos_bottom'],
            sort: ['sort']
        }).then(data => {
            if (data.length > 0) {
                const processed = data.map(d => ({
                    ...d,
                    image: typeof d.image === 'object' && d.image !== null ? d.image.id : d.image
                }));
                setBadges(processed);
            }
        });
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    // Transform values for parallax layers
    const bgX = useTransform(smoothX, [-500, 500], [30, -30]);
    const bgY = useTransform(smoothY, [-500, 500], [30, -30]);

    const contentX = useTransform(smoothX, [-500, 500], [-15, 15]);
    const contentY = useTransform(smoothY, [-500, 500], [-15, 15]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const moveX = clientX - window.innerWidth / 2;
            const moveY = clientY - window.innerHeight / 2;
            mouseX.set(moveX);
            mouseY.set(moveY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4 selection:bg-orange-500/30">
            {/* Background Image & Overlays - Parallax Layer */}
            <motion.div
                style={{ x: bgX, y: bgY, scale: 1.15 }}
                className="absolute inset-0 z-0 overflow-hidden bg-transparent transition-opacity duration-1000"
            >
                <img
                    src={getDirectusFileUrl(config.background_image) || "/hero-main-v2.png"}
                    alt="Geotech Digital Hub"
                    className="w-full h-full object-cover scale-110"
                    style={{ opacity: (config.image_opacity ?? 60) / 100 }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/95 via-[#0F172A]/60 to-[#0F172A]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-transparent to-[#0F172A]/90" />

                {/* Technical Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />

                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#F97316_0,rgba(249,115,22,0)_60%)] opacity-20 blur-[120px]" />
                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.05] bg-[url('/noise.png')] mix-blend-overlay" />
            </motion.div>

            <motion.div
                style={{ x: contentX, y: contentY }}
                className="container relative z-10 mx-auto text-center"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl shadow-2xl"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="text-accent/60">Status:</span>
                        <span>Active System</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span className="text-white">{region.toUpperCase()} v2.6.0</span>
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
                >
                    {(config.title || '').split('—')[0]} <span className="text-accent">{(config.title || '').split('—')[1] || ''}</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mx-auto mb-12 max-w-4xl text-lg font-medium text-white/90 sm:text-2xl leading-relaxed drop-shadow-[0_10px_20px_rgba(0,0,0,1)]"
                >
                    {(config.usp || '').split('. ').map((sentence, i, arr) => (
                        <span key={i} className="block">
                            {sentence}{i < arr.length - 1 ? '.' : ''}
                        </span>
                    ))}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                >
                    <Link
                        href="/machinery"
                        className="group relative overflow-hidden rounded-md bg-primary px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Смотреть каталог техники <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 z-0 bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('copilot')?.scrollIntoView({ behavior: 'smooth' })}
                        className="rounded-md border border-white/20 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-95 shadow-xl"
                    >
                        {config.cta}
                    </button>
                </motion.div>
            </motion.div>

            {/* Premium Technical Badges with 3D Assets and Independent Parallax */}
            {badges.length > 0 ? (
                badges.map((badge, idx) => {
                    // Fallback to local assets if no image is uploaded yet
                    let badgeImage = getDirectusFileUrl(badge.image);
                    if (!badgeImage) {
                        if (badge.label === "Буровые") badgeImage = "/assets/hero/drilling-rig.png";
                        else if (badge.label === "Шпунт") badgeImage = "/assets/hero/sheet-pile.png";
                        else if (badge.label === "Спецтехника") badgeImage = "/assets/hero/truck.png";
                        else badgeImage = ""; // Placeholder or empty
                    }

                    return (
                        <TechnicalBadge
                            key={idx}
                            image={badgeImage}
                            label={badge.label}
                            delay={idx * 0.2}
                            mouseX={smoothX}
                            mouseY={smoothY}
                            factor={badge.parallax_factor}
                            href={badge.href}
                            style={{
                                top: badge.pos_top,
                                left: badge.pos_left,
                                right: badge.pos_right,
                                bottom: badge.pos_bottom
                            }}
                        />
                    );
                })
            ) : (
                /* Fallback Badges */
                <>
                    <TechnicalBadge
                        image="/assets/hero/drilling-rig.png"
                        className="top-[15%] left-[5%]"
                        label="Буровые"
                        delay={0}
                        mouseX={smoothX}
                        mouseY={smoothY}
                        factor={0.1}
                        href="/services#drilling"
                    />
                    <TechnicalBadge
                        image="/assets/hero/sheet-pile.png"
                        className="bottom-[20%] right-[8%]"
                        label="Шпунт"
                        delay={0.5}
                        mouseX={smoothX}
                        mouseY={smoothY}
                        factor={-0.12}
                        href="/services#catalog"
                    />
                    <TechnicalBadge
                        image="/assets/hero/truck.png"
                        className="top-[30%] right-[5%]"
                        label="Спецтехника"
                        delay={1}
                        mouseX={smoothX}
                        mouseY={smoothY}
                        factor={0.08}
                        href="/machinery"
                    />
                </>
            )}
            {/* Modal for Catalog/Price List */}
            <LeadMagnetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Скачать каталог и прайс-лист"
                subtitle="Мы вышлем актуальный каталог шпунта, спецтехники и примеры реализованных объектов"
                magnetName="Catalog_Request"
            />
        </section>
    );
}

function TechnicalBadge({ image, className, label, delay, mouseX, mouseY, factor, href, style }: { image: string, className?: string, label: string, delay: number, mouseX: import("framer-motion").MotionValue<number>, mouseY: import("framer-motion").MotionValue<number>, factor: number, href: string, style?: React.CSSProperties }) {
    const x = useTransform(mouseX, [-500, 500], [-500 * factor, 500 * factor]);
    const y = useTransform(mouseY, [-500, 500], [-500 * factor, 500 * factor]);

    return (
        <motion.div
            style={{ x, y, ...style }}
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 0.8,
            }}
            transition={{
                duration: 1,
                delay: delay
            }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            className={`absolute hidden lg:flex flex-col items-center gap-4 pointer-events-auto z-30 ${className}`}
        >
            <Link href={href} className="group/badge flex flex-col items-center gap-4 w-full h-full">
                <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full opacity-0 group-hover/badge:opacity-100 transition-opacity duration-500" />

                    <div className="relative w-32 h-32 p-1 bg-white/10 ring-1 ring-white/20 rounded-2xl backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                        <img
                            src={image}
                            alt={label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/badge:scale-110"
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent drop-shadow-lg">
                        {label}
                    </span>
                    <div className="h-[2px] w-8 bg-accent/50 mt-1 rounded-full scale-x-0 group-hover/badge:scale-x-100 transition-transform duration-500" />
                </div>
            </Link>
        </motion.div>
    );
}
