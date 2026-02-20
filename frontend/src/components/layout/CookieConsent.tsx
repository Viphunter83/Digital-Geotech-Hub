"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const consent = localStorage.getItem("cookie-consent");
            if (!consent) {
                setIsVisible(true);
            }
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    const accept = () => {
        localStorage.setItem("cookie-consent", "true");
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[100]"
                >
                    <div className="bg-[#0F172A]/80 backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />

                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <Info className="w-5 h-5 text-orange-500" />
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-tight text-white">Мы используем Cookies</h4>
                                <p className="text-[11px] text-white/50 leading-relaxed font-outfit">
                                    Этот сайт использует файлы cookie. Мы собираем данные, чтобы анализировать трафик и улучшать интерфейс. Продолжая пользоваться сайтом, вы соглашаетесь с нашей <Link href="/privacy" className="text-orange-500 underline">политикой конфиденциальности</Link>.
                                </p>
                                <button
                                    onClick={accept}
                                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-[#0F172A] text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                >
                                    Принимаю
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
