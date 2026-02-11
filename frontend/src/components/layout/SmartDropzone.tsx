"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, Info } from "lucide-react";
import { useState, useRef } from "react";

interface DraftProposal {
    parsed_data: {
        work_type: string;
        volume: number | null;
        soil_type: string | null;
        required_profile: string | null;
        depth: number | null;
        groundwater_level: number | null;
        special_conditions: string[];
    };
    technical_summary: string;
    matched_shpunts: Array<{
        name: string;
        price: number;
        stock: number;
    }>;
    recommended_machinery: Array<{
        id: string;
        name: string;
        description: string | null;
        category: string;
    }>;
    estimated_total: number | null;
    confidence_score: number;
}

export function SmartDropzone() {
    const [isUploading, setIsUploading] = useState(false);
    const [proposal, setProposal] = useState<DraftProposal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        setProposal(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/parse-document`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Ошибка при обработке документа");
            }

            const data = await response.json();
            setProposal(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <section className="py-32 px-6 bg-[#0F172A] text-white overflow-hidden relative" id="copilot">
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500 blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="container mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles className="w-3 h-3" /> AI Copilot v1.0
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-8 leading-tight">
                            AI Technical <span className="text-orange-500">Audit</span><br />Assistant
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-xl">
                            Загрузите спецификацию проекта. Наш AI-инженер проведет технический аудит, выделит ключевые параметры и подготовит структурированное резюме для ваших специалистов.
                        </p>

                        <ul className="space-y-4 mb-10">
                            <FeatureItem text="Технический аудит PDF/Excel" />
                            <FeatureItem text="Извлечение геологических параметров" />
                            <FeatureItem text="Оценка инженерных рисков" />
                        </ul>

                        {proposal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-orange-500 uppercase tracking-tight">Результаты аудита</h3>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] bg-orange-500/20 text-orange-500 px-2 py-1 rounded mb-1">AI Senior Engineer</span>
                                        <span className="text-[9px] text-white/40">Confidence: {(proposal.confidence_score * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Markdown Summary Component Section */}
                                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-[10px] font-bold text-white/40 uppercase mb-3 flex items-center gap-2">
                                        <FileText className="w-3 h-3" /> Техническое резюме
                                    </p>
                                    <div className="text-sm text-white/80 prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                                        {/* Simple manual render for common markdown since we don't have a library installed yet, 
                                            or just render as text with white-space-pre-wrap */}
                                        <div className="whitespace-pre-wrap font-sans">
                                            {proposal.technical_summary}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Тип работ</p>
                                        <p className="font-medium">{proposal.parsed_data.work_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Объем</p>
                                        <p className="font-medium text-orange-400">
                                            {proposal.parsed_data.volume ? `${proposal.parsed_data.volume} ед.` : "Не указан"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Марка шпунта</p>
                                        <p className="font-medium text-orange-400">{proposal.parsed_data.required_profile || "Не указан"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Глубина</p>
                                        <p className="font-medium">{proposal.parsed_data.depth ? `${proposal.parsed_data.depth} м` : "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">УГВ</p>
                                        <p className="font-medium">{proposal.parsed_data.groundwater_level ? `${proposal.parsed_data.groundwater_level} м` : "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Ориент. бюджет</p>
                                        <p className="font-bold text-green-400">
                                            {proposal.estimated_total ? `${proposal.estimated_total.toLocaleString()} ₽` : "Требует расчета"}
                                        </p>
                                    </div>
                                </div>

                                {proposal.parsed_data.special_conditions.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/40 uppercase mb-3">Особые условия</p>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.parsed_data.special_conditions.map((cond, idx) => (
                                                <div key={idx} className="text-[11px] bg-orange-500/10 text-orange-300 border border-orange-500/20 px-2 py-1 rounded">
                                                    {cond}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={onFileSelect}
                            accept=".pdf,.xlsx,.xls"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`aspect-video rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-10 cursor-pointer transition-all hover:bg-white/10 hover:border-orange-500 group ${isUploading ? 'pointer-events-none' : ''}`}
                        >
                            {isUploading ? (
                                <div className="text-center">
                                    <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-4 mx-auto" />
                                    <p className="text-xl font-bold animate-pulse">Анализируем спецификацию...</p>
                                </div>
                            ) : proposal ? (
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                                    <CheckCircle2 className="w-16 h-16 text-green-400 mb-4 mx-auto" />
                                    <p className="text-xl font-bold mb-2">Готово!</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setProposal(null);
                                        }}
                                        className="text-white/40 text-xs hover:text-white mt-4 flex items-center gap-1 mx-auto"
                                    >
                                        <X className="w-3 h-3" /> Сбросить и загрузить заново
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="mb-6 p-6 bg-white/10 rounded-full group-hover:scale-110 transition-transform">
                                        <Upload className="w-12 h-12 text-orange-500" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-2 uppercase">Загрузить файл</h4>
                                    <p className="text-sm text-white/50 mb-6 font-mono">PDF, XLSX (до 10 МБ)</p>
                                    {error && (
                                        <div className="mt-4 p-3 bg-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2">
                                            <Info className="w-4 h-4" /> {error}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-orange-500 p-4 rounded-xl shadow-2xl hidden md:block">
                            <FileText className="text-[#0F172A] w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
            </div>
            <span className="text-sm font-medium text-white/90 tracking-wide">{text}</span>
        </li>
    );
}
