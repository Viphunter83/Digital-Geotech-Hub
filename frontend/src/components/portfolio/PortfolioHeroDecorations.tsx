"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Activity, Globe, Award, Map as MapIcon } from "lucide-react";

const stats = [
    {
        icon: Award,
        value: 50,
        suffix: "+",
        label: "Проектов",
        delay: 0.1
    },
    {
        icon: Globe,
        value: 12,
        suffix: "",
        label: "Регионов",
        delay: 0.2
    },
    {
        icon: Activity,
        value: 100,
        suffix: "%",
        label: "Сложность",
        delay: 0.3
    }
];

export function PortfolioHeroDecorations() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    if (!mounted) return null;

    return (
        <div className="absolute top-0 right-0 h-full w-full md:w-1/3 pointer-events-none hidden lg:block">
            {/* Abstract Tech Circle */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                animate={{ opacity: 0.1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute top-20 -right-20 w-[600px] h-[600px] border-[1px] border-white/20 rounded-full translate-x-1/3 -translate-y-1/4"
            >
                <div className="absolute inset-2 border-[1px] border-white/10 rounded-full border-dashed animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-20 border-[2px] border-orange-500/20 rounded-full border-dotted animate-[spin_40s_linear_infinite_reverse]" />
            </motion.div>

            {/* Stats Cards - Floating */}
            <div className="absolute top-20 right-0 flex flex-col gap-4 w-64">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + stat.delay, duration: 0.5 }}
                        className="bg-white/[0.03] backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 hover:bg-white/[0.05] transition-colors"
                    >
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500">
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black tabular-nums leading-none mb-1">
                                <Counter value={stat.value} />
                                {stat.suffix}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                                {stat.label}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Decorative Code Lines */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 right-20 font-mono text-[10px] text-orange-500/50 space-y-1 text-right"
            >
                <p>LAT: 59.9823 N</p>
                <p>LNG: 30.1742 E</p>
                <p>STATUS: ACTIVE</p>
            </motion.div>
        </div>
    );
}

function Counter({ value }: { value: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const stepTime = duration / steps;
        const increment = value / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}</span>;
}
