"use client";

import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { RentalDialog } from "@/components/features/RentalDialog";
import { fetchMachinery, type Machinery } from "@/lib/machinery-data";

export function MachineryPreview() {
    const [selectedMachine, setSelectedMachine] = useState<{ id: string; name: string } | null>(null);
    const [cmsItems, setCmsItems] = useState<Machinery[]>([]);

    useEffect(() => {
        fetchMachinery().then(data => {
            // Only use top 3 for preview
            setCmsItems(data.slice(0, 3));
        });
    }, []);

    // Use CMS items if available, otherwise fallback
    const previewItems = cmsItems.length > 0 ? cmsItems : [];


    return (
        <>
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
                        <Link
                            href="/machinery"
                            className="group relative z-20 flex items-center justify-center px-10 py-4 bg-accent rounded-xl font-black uppercase tracking-widest text-xs text-white overflow-hidden transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Полный каталог техники <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {previewItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="group relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-accent/30 transition-all duration-700 flex flex-col h-full"
                            >
                                <Link href={`/machinery?id=${item.id}`} className="flex flex-col h-full">
                                    {/* Card Header Illustration */}
                                    <div className="aspect-[16/12] relative flex items-center justify-center p-0 bg-white/[0.01] border-b border-white/5 overflow-hidden shrink-0">
                                        <span className="absolute top-6 left-10 text-6xl font-black text-white/[0.02] select-none tracking-tighter">
                                            #{index + 1}
                                        </span>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-contain scale-125 drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-700 group-hover:scale-135"
                                        />
                                        <div className="absolute top-8 right-8 px-4 py-1.5 bg-accent/20 border border-accent/30 rounded-full">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                                                {item.categoryLabel}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-12 flex flex-col flex-1">
                                        <h4 className="text-3xl font-black mb-10 uppercase tracking-tighter text-white group-hover:text-accent transition-colors duration-500">
                                            {item.name}
                                        </h4>

                                        <div className="flex-1" />

                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setSelectedMachine({ id: item.id, name: item.name });
                                            }}
                                            className="w-full py-5 text-center rounded-2xl bg-white/[0.03] border border-white/5 font-black text-[10px] uppercase tracking-[0.2em] text-white/40 hover:bg-white hover:text-black hover:border-white transition-all duration-500 cursor-pointer mt-auto"
                                        >
                                            Запросить расчёт аренды
                                        </div>
                                    </div>
                                </Link>

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

            {selectedMachine && (
                <RentalDialog
                    open={!!selectedMachine}
                    onOpenChange={(open) => !open && setSelectedMachine(null)}
                    machineId={selectedMachine.id}
                    machineName={selectedMachine.name}
                />
            )}
        </>
    );
}
