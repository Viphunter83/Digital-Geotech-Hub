"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, Info } from "lucide-react";
import { useState, useRef } from "react";

interface DraftProposal {
    parsed_data: {
        work_type: string;
        volume: number;
        soil_type: string | null;
        required_profile: string | null;
    };
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
    estimated_total: number;
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
                            Smart <span className="text-orange-500">Dropzone</span><br />для сметчиков
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-xl">
                            Загрузите спецификацию проекта. AI распознает объемы, номенклатуру шпунта и сформирует КП с актуальными ценами из нашей базы.
                        </p>

                        <ul className="space-y-4 mb-10">
                            <FeatureItem text="Парсинг сложных PDF таблиц" />
                            <FeatureItem text="Автоматический подбор техники" />
                            <FeatureItem text="Расчет сметы за 30 секунд" />
                        </ul>

                        {proposal && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-orange-500 uppercase tracking-tight">Черновик предложения</h3>
                                    <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded">Сгенерировано AI</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Тип работ</p>
                                        <p className="font-medium">{proposal.parsed_data.work_type}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Объем</p>
                                        <p className="font-medium">{proposal.parsed_data.volume} ед.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Профиль</p>
                                        <p className="font-medium text-orange-400">{proposal.parsed_data.required_profile || "Не указан"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-white/40 uppercase text-[10px] font-bold">Итого (ориент.)</p>
                                        <p className="font-bold text-lg text-green-400">
                                            {proposal.estimated_total.toLocaleString()} ₽
                                        </p>
                                    </div>
                                </div>

                                {proposal.recommended_machinery.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-[10px] font-bold text-white/40 uppercase mb-3">Рекомендуемая техника</p>
                                        <div className="flex gap-2">
                                            {proposal.recommended_machinery.map(m => (
                                                <div key={m.id} className="text-[11px] bg-white/10 px-2 py-1 rounded">
                                                    {m.name}
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
