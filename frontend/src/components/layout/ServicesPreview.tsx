"use client";

import { motion } from "framer-motion";
import { Hammer, Truck, Ruler, ShieldCheck } from "lucide-react";

const services = [
    {
        title: "Буронабивные сваи",
        description: "Устройство БНС любой сложности, включая работу в скальных породах и в условиях Крайнего Севера.",
        icon: <Ruler className="w-8 h-8" />,
        stats: "15+ лет опыта"
    },
    {
        title: "Шпунтовые работы",
        description: "Погружение, извлечение и аренда шпунта Ларсена. Вибропогружение и статическое вдавливание (Silent Piler).",
        icon: <Hammer className="w-8 h-8" />,
        stats: "Свой парк техники"
    },
    {
        title: "Аренда техники",
        description: "Буровые установки Enteco, Inteco, копры Junttan и гусеничные краны Manitowoc в аренду.",
        icon: <Truck className="w-8 h-8" />,
        stats: "Доставка по РФ"
    },
    {
        title: "Нулевой цикл",
        description: "Комплексные работы по подготовке основания, лидерное бурение и устройство свайных полей.",
        icon: <ShieldCheck className="w-8 h-8" />,
        stats: "Гарантия качества"
    }
];

export function ServicesPreview() {
    return (
        <section className="py-32 px-6">
            <div className="container mx-auto">
                <div className="mb-20">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-4">Наши направления</h2>
                    <h3 className="text-4xl md:text-5xl font-black font-outfit uppercase">Инженерное превосходство<br />в каждой детали</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative h-full bg-white border border-primary/5 p-8 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary group-hover:bg-accent transition-colors opacity-[0.03] rounded-bl-full pointer-events-none" />

                            <div className="mb-6 p-4 bg-primary/5 rounded-xl w-fit group-hover:bg-accent group-hover:text-white transition-all">
                                {service.icon}
                            </div>

                            <h4 className="text-xl font-black mb-4 uppercase tracking-tight">{service.title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                                {service.description}
                            </p>

                            <div className="mt-auto flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-accent tracking-tighter">{service.stats}</span>
                                <div className="w-8 h-8 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                    <ArrowUpRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { ArrowUpRight } from "lucide-react";
