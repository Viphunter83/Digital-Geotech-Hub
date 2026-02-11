"use client";

import { motion } from "framer-motion";
import { Gauge, Settings, Zap, ArrowRight } from "lucide-react";

const items = [
    {
        name: "BAUER BG 28",
        type: "Буровая установка",
        power: "354 кВт",
        weight: "96.0 т",
        depth: "71.0 м",
        image: "/assets/machinery-bauer.png"
    },
    {
        name: "MOVAX SG-75",
        type: "Вибропогружатель",
        power: "Side-Grip",
        weight: "3.5 т",
        force: "750 кН",
        image: "/assets/machinery-movax.png"
    },
    {
        name: "Casagrande B175",
        type: "Буровая установка",
        power: "200 кВт",
        weight: "55.0 т",
        depth: "50.0 м",
        image: "/assets/machinery-casagrande.png"
    }
];

export function MachineryPreview() {
    return (
        <section className="py-32 px-6 bg-[#F8FAFC]">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-4">Наш автопарк</h2>
                        <h3 className="text-4xl md:text-5xl font-black font-outfit uppercase text-slate-900 leading-tight">Мощность и точность<br />для ваших задач</h3>
                    </div>
                    <button className="group relative px-8 py-3 bg-white border-2 border-slate-900 rounded-full font-bold uppercase tracking-widest text-[10px] text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-lg active:scale-95">
                        Весь каталог <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-3 transition-all duration-500"
                        >
                            <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-slate-50">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                                />
                                <div className="absolute top-6 left-6">
                                    <span className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                                        {item.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10">
                                <h4 className="text-2xl font-black mb-8 uppercase tracking-tight text-slate-900">{item.name}</h4>

                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <Spec icon={<Gauge className="w-5 h-5" />} label="Мощность" value={item.power} />
                                    <Spec icon={<Settings className="w-5 h-5" />} label="Вес" value={item.weight} />
                                    <Spec icon={<Zap className="w-5 h-5" />} label={item.depth ? "Глубина" : "Сила"} value={item.depth || item.force || ""} />
                                </div>

                                <button className="w-full py-4 rounded-2xl bg-slate-50 border-2 border-transparent font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm active:scale-95">
                                    Технические характеристики
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Spec({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="text-accent">{icon}</div>
            <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter leading-none mb-1">{label}</span>
                <span className="text-xs font-black uppercase">{value}</span>
            </div>
        </div>
    );
}
