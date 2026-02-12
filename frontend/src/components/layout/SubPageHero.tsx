"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface SubPageHeroProps {
    title: string;
    description: string;
    badgeText?: string;
    accentTitle: string;
}

export function SubPageHero({ title, accentTitle, description, badgeText = "Official Documentation" }: SubPageHeroProps) {
    return (
        <header className="mb-20 pt-10">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6"
            >
                <Info className="w-3 h-3" /> {badgeText}
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black uppercase mb-8 leading-tight"
            >
                {title} <span className="text-orange-500">{accentTitle}</span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-white/60 max-w-2xl font-medium border-l-4 border-orange-500 pl-6"
            >
                {description}
            </motion.p>
        </header>
    );
}
