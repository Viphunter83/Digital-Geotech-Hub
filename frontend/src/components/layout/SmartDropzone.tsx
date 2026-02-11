"use client";

import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

export function SmartDropzone() {
    const [isUploading, setIsUploading] = useState(false);
    const [complete, setComplete] = useState(false);

    const handleSimulate = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            setComplete(true);
        }, 3000);
    };

    return (
        <section className="py-32 px-6 bg-primary text-white overflow-hidden relative">
            {/* Abstract AI Background */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="container mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="w-3 h-3" /> AI Copilot v1.0
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-outfit uppercase mb-8 leading-tight">
                            Smart <span className="text-accent">Dropzone</span><br />для сметчиков
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-xl">
                            Загрузите спецификацию проекта в формате PDF, Word или Excel. Наш AI мгновенно распознает объемы работ, номенклатуру шпунта и сформирует черновик коммерческого предложения с актуальными ценами.
                        </p>

                        <ul className="space-y-4">
                            <FeatureItem text="Парсинг сложных PDF таблиц" />
                            <FeatureItem text="Автоматический подбор техники" />
                            <FeatureItem text="Расчет ГСМ и логистики за 30 секунд" />
                        </ul>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div
                            onClick={handleSimulate}
                            className={`aspect-video rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all hover:bg-white/10 hover:border-accent group ${isUploading ? 'pointer-events-none' : ''}`}
                        >
                            {isUploading ? (
                                <div className="text-center">
                                    <Loader2 className="w-16 h-16 text-accent animate-spin mb-4 mx-auto" />
                                    <p className="text-xl font-bold animate-pulse">Анализируем спецификацию...</p>
                                </div>
                            ) : complete ? (
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-center"
                                >
                                    <CheckCircle2 className="w-16 h-16 text-green-400 mb-4 mx-auto" />
                                    <p className="text-xl font-bold mb-2">КП сформировано!</p>
                                    <button className="text-accent text-sm font-bold border-b border-accent pb-1">Открыть черновик</button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-6 p-6 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                                        <Upload className="w-12 h-12 text-accent" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2 uppercase">Перетащите файлы сюда</h4>
                                    <p className="text-sm text-white/50 mb-6">PDF, DOCX, XLSX (до 10 МБ)</p>
                                    <div className="flex gap-2">
                                        <div className="bg-white/10 px-4 py-2 rounded text-xs font-mono">tender_shpunt_v2.pdf</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -bottom-6 -left-6 bg-accent p-4 rounded-xl shadow-2xl hidden md:block">
                            <FileText className="text-primary w-6 h-6" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <span className="text-sm font-medium text-white/90 tracking-wide">{text}</span>
        </li>
    );
}
