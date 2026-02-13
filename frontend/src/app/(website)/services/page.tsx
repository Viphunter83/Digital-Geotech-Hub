"use client";

import { motion } from "framer-motion";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { CheckSquare, ArrowRight, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/services-data";
import { machinery } from "@/lib/machinery-data";
import { SheetPileCatalog } from "@/components/catalog/SheetPileCatalog";
import { LeadMagnetModal } from "@/components/layout/LeadMagnetModal";
import { useState } from "react";

export default function ServicesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: "", subtitle: "", magnet: "" });

    const openModal = (title: string, subtitle: string, magnet: string) => {
        setModalConfig({ title, subtitle, magnet });
        setIsModalOpen(true);
    };

    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 px-6 overflow-hidden relative selection:bg-orange-500/30">
            {/* Background elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Technical Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-transparent to-[#0F172A]" />

                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                {/* Noise Texture for Texture/Grit */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay" />
            </div>

            <div className="container mx-auto relative z-10">
                <SubPageHero
                    title="Инженерные"
                    accentTitle="компетенции"
                    description="Проектирование и реализация полного цикла работ нулевого цикла. Собственный парк спецтехники и команда инженеров высшей квалификации."
                    badgeText="Service Catalog v2.0"
                    backLink="/"
                    backLabel="На главную"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
                    {services.map((service, idx) => {
                        const relatedMachinery = service.relatedMachineryIds
                            ? machinery.filter(m => service.relatedMachineryIds?.includes(m.id))
                            : [];

                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 hover:border-orange-500/50 transition-all duration-500 flex flex-col h-full"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${service.accent} border border-white/5 group-hover:scale-110 transition-transform`}>
                                    <service.icon className="w-7 h-7 text-orange-500" />
                                </div>

                                <div className="mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{service.subtitle}</span>
                                    <h3 className="text-2xl font-black uppercase mt-1 group-hover:text-orange-500 transition-colors">
                                        {service.title}
                                    </h3>
                                </div>

                                <p className="text-sm text-white/50 leading-relaxed mb-6 flex-1">
                                    {service.description}
                                </p>

                                {/* Related Machinery Chips */}
                                {relatedMachinery.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Tractor className="w-3 h-3 text-orange-500" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Рекомендуемая техника</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {relatedMachinery.slice(0, 3).map(mach => (
                                                <div key={mach.id} className="bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-[9px] font-bold text-white/70 uppercase">
                                                    {mach.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3 mb-8">
                                    {service.features.map((feature, fIdx) => (
                                        <div key={fIdx} className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-orange-500" />
                                            <span className="text-[11px] font-mono text-white/70 uppercase tracking-tight">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => openModal("Консультация эксперта", `Интересует услуга: ${service.title}`, `Service_Inquiry_${service.id}`)}
                                    className="w-full bg-white/5 border-white/10 hover:bg-orange-500 hover:text-[#0F172A] hover:border-orange-500 font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl transition-all"
                                >
                                    Подробнее <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>

                                {/* Decorative element */}
                                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <service.icon className="w-20 h-20" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Industrial Placeholder for CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group border border-orange-400 shadow-2xl shadow-orange-500/20"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] bg-[size:20px_20px] opacity-50" />

                        <div className="w-16 h-16 bg-[#0F172A] rounded-full flex items-center justify-center mb-6 relative z-10 shadow-2xl">
                            <CheckSquare className="w-8 h-8 text-orange-500" />
                        </div>
                        <h4 className="text-2xl font-black text-[#0F172A] uppercase mb-4 relative z-10">Нужен расчет <br />вашего проекта?</h4>
                        <p className="text-[#0F172A]/70 text-xs font-bold uppercase tracking-widest mb-8 relative z-10">Проведем аудит и подготовим <br />смету за 60 минут</p>
                        <Button
                            onClick={() => openModal("Расчет сметы", "Оставьте заявку на бесплатный расчет проекта", "Project_Calculation_Services")}
                            className="w-full bg-[#0F172A] text-white hover:bg-[#1E293B] font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl relative z-10 transition-colors"
                        >
                            Заказать расчет проекта
                        </Button>
                    </motion.div>
                </div>

                {/* Sheet Pile Catalog Section */}
                <div className="mb-20">
                    <SubPageHero
                        title="Каталог"
                        accentTitle="шпунта"
                        description="Полный сортамент шпунта Ларсена (AZ, AU, GU, VL, Л5-УМ). Доступен для аренды, покупки и обратного выкупа (Buy-Back)."
                        badgeText="Sheet Pile Inventory"
                    />
                    <SheetPileCatalog />
                </div>
            </div>

            <LeadMagnetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalConfig.title}
                subtitle={modalConfig.subtitle}
                magnetName={modalConfig.magnet}
            />
        </main>
    );
}

