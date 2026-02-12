"use client";

import { motion } from "framer-motion";
import { Gauge, Settings, Zap, ArrowRight, ShieldCheck, Weight } from "lucide-react";

const items = [
    {
        name: "BAUER BG 28",
        type: "Буровая установка",
        specs: [
            { label: "Крутящий момент", value: "270 кНм", icon: <Settings className="w-4 h-4" /> },
            { label: "Макс. глубина", value: "71.0 м", icon: <Zap className="w-4 h-4" /> },
            { label: "Раб. вес", value: "96.0 т", icon: <Weight className="w-4 h-4" /> },
            { label: "Мощность", value: "354 кВт", icon: <Gauge className="w-4 h-4" /> }
        ],
        image: "/assets/machinery-bauer.png",
        id: "M-01"
    },
    {
        name: "MOVAX SG-75",
        type: "Вибропогружатель",
        specs: [
            { label: "Сила удара", value: "750 кН", icon: <Zap className="w-4 h-4" /> },
            { label: "Частота", value: "3000 кол/мин", icon: <Settings className="w-4 h-4" /> },
            { label: "Макс. вес сваи", value: "3.5 т", icon: <Weight className="w-4 h-4" /> },
            { label: "Side-Grip", value: "Active", icon: <ShieldCheck className="w-4 h-4" /> }
        ],
        image: "/assets/machinery-movax.png",
        id: "M-02"
    },
    {
        name: "Casagrande B175",
        type: "Буровая установка",
        specs: [
            { label: "Крутящий момент", value: "175 кНм", icon: <Settings className="w-4 h-4" /> },
            { label: "Макс. глубина", value: "50.0 м", icon: <Zap className="w-4 h-4" /> },
            { label: "Раб. вес", value: "55.0 т", icon: <Weight className="w-4 h-4" /> },
            { label: "Мощность", value: "200 кВт", icon: <Gauge className="w-4 h-4" /> }
        ],
        image: "/assets/machinery-casagrande.png",
        id: "M-03"
    }
];

export function MachineryPreview() {
    return (
        <section className="py-32 px-6 bg-transparent relative overflow-hidden">
            {/* Background Mesh */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #F97316 1px, transparent 0)', backgroundSize: '64px 64px' }} />

            <div className="container mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="h-px w-12 bg-accent" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-accent">Наш автопарк</h2>
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white leading-none"
                        >
                            Мощь и <span className="text-accent italic">точность</span><br />ваших проектов
                        </motion.h3>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative px-10 py-4 bg-accent rounded-xl font-black uppercase tracking-widest text-xs text-white overflow-hidden transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Полный каталог техники <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-accent/30 transition-all duration-700"
                        >
                            {/* Card Header Illustration */}
                            <div className="aspect-[16/12] relative flex items-center justify-center p-0 bg-white/[0.01] border-b border-white/5 overflow-hidden">
                                <span className="absolute top-6 left-10 text-6xl font-black text-white/[0.02] select-none tracking-tighter">
                                    {item.id}
                                </span>
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain scale-125 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-150 group-hover:rotate-2"
                                />
                                <div className="absolute top-8 right-8 px-4 py-1.5 bg-accent/20 border border-accent/30 rounded-full">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                                        {item.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-12">
                                <h4 className="text-3xl font-black mb-10 uppercase tracking-tighter text-white group-hover:text-accent transition-colors duration-500">
                                    {item.name}
                                </h4>

                                <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-12">
                                    {item.specs.map((spec, sIndex) => (
                                        <div key={sIndex} className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-white/30 truncate">
                                                {spec.icon}
                                                <span className="text-[10px] font-bold uppercase tracking-widest truncate">{spec.label}</span>
                                            </div>
                                            <span className="text-sm font-black text-white tracking-wider">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <motion.button
                                    className="w-full py-5 rounded-2xl bg-white/[0.03] border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                                >
                                    Запросить расчёт аренды
                                </motion.button>
                            </div>

                            {/* Hover Shadow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Trust Line */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-24 pt-12 border-t border-white/5 flex flex-wrap justify-between items-center gap-8"
                >
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em]">Global Standards Compliance: ISO 9001 / GOST R</p>
                    <div className="flex gap-12 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-help">
                        {/* Placeholder for small brand logos or trust icons */}
                        <span className="text-white font-black tracking-tighter italic">BAUER</span>
                        <span className="text-white font-black tracking-tighter italic">CASAGRANDE</span>
                        <span className="text-white font-black tracking-tighter italic">MOVAX</span>
                        <span className="text-white font-black tracking-tighter italic">JUNTTAN</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
