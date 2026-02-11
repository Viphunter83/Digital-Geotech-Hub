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
        image: "https://images.unsplash.com/photo-1579412691511-2f3b97607ea0?q=80\u0026w=600\u0026auto=format\u0026fit=crop"
    },
    {
        name: "MOVAX SG-75",
        type: "Вибропогружатель",
        power: "Side-Grip",
        weight: "3.5 т",
        force: "750 кН",
        image: "https://images.unsplash.com/photo-1541625602330-2277a1cd43a7?q=80\u0026w=600\u0026auto=format\u0026fit=crop"
    },
    {
        name: "Casagrande B175",
        type: "Буровая установка",
        power: "200 кВт",
        weight: "55.0 т",
        depth: "50.0 м",
        image: "https://images.unsplash.com/photo-1517520287167-4bda64217555?q=80\u0026w=600\u0026auto=format\u0026fit=crop"
    }
];

export function MachineryPreview() {
    return (
        <section className="py-32 px-6">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-xl">
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-4">Наш автопарк</h2>
                        <h3 className="text-4xl md:text-5xl font-black font-outfit uppercase">Мощность и точность<br />для ваших задач</h3>
                    </div>
                    <button className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary/10 pb-2 flex items-center gap-2 hover:border-accent group transition-all">
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
                            className="group bg-white rounded-3xl border border-primary/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all"
                        >
                            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        {item.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8">
                                <h4 className="text-2xl font-black mb-6 uppercase tracking-tight">{item.name}</h4>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <Spec icon={<Gauge />} label="Мощность" value={item.power} />
                                    <Spec icon={<Settings />} label="Вес" value={item.weight} />
                                    <Spec icon={<Zap />} label={item.depth ? "Глубина" : "Сила"} value={item.depth || item.force || ""} />
                                </div>

                                <button className="w-full py-3 rounded-xl border border-primary/10 font-bold text-sm uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                                    Подробнее
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
