"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    Sparkles,
    Download,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface RiskItem {
    risk: string;
    impact: string;
}

interface AuditResult {
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
    risks: RiskItem[];
    matched_shpunts: Array<{ name: string; price: number; stock: number }>;
    recommended_machinery: Array<{
        id: string;
        name: string;
        description: string | null;
        category: string;
    }>;
    estimated_total: number | null;
    confidence_score: number;
}

type AuditStep = "idle" | "uploading" | "scanning" | "analyzing" | "risks" | "complete" | "error";

export default function AuditPage() {
    const [file, setFile] = useState<File | null>(null);
    const [step, setStep] = useState<AuditStep>("idle");
    const [result, setResult] = useState<AuditResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [auditStepIdx, setAuditStepIdx] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const auditSteps = [
        "Извлечение текста и таблиц",
        "Инженерно-геологический анализ",
        "Оценка технических рисков",
        "Генерация экспертного отчета",
    ];

    // Animate progress steps while uploading
    useEffect(() => {
        if (step === "uploading") {
            const interval = setInterval(() => {
                setAuditStepIdx((prev) => (prev < 3 ? prev + 1 : prev));
            }, 1500);
            return () => clearInterval(interval);
        } else {
            setAuditStepIdx(0);
        }
    }, [step]);

    const getAuthToken = (): string | null => {
        try {
            const raw = localStorage.getItem("geotech_session");
            if (!raw) return null;
            const session = JSON.parse(raw);
            return session.token || null;
        } catch {
            return null;
        }
    };

    const startAudit = async () => {
        if (!file) return;

        // Client-side file validation
        if (file.size > 5 * 1024 * 1024) {
            setError("Файл слишком большой. Максимальный размер 5МБ.");
            return;
        }

        const allowedTypes = [".pdf", ".xlsx", ".xls"];
        if (!allowedTypes.some((t) => file.name.toLowerCase().endsWith(t))) {
            setError("Недопустимый формат файла. Используйте PDF или Excel.");
            return;
        }

        setStep("uploading");
        setError(null);
        setResult(null);

        const formData = new FormData();
        formData.append("file", file);

        const token = getAuthToken();

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/parse-document`,
                {
                    method: "POST",
                    body: formData,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    throw new Error("Лимит запросов исчерпан. Попробуйте через час.");
                }
                if (response.status === 422) {
                    throw new Error("Документ не является геотехнической спецификацией.");
                }
                throw new Error(errData.detail || "Ошибка при обработке документа");
            }

            const data: AuditResult = await response.json();
            setResult(data);
            setStep("complete");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            setStep("error");
        }
    };

    const handleDownloadReport = async () => {
        if (!result) return;
        const token = getAuthToken();

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/download-report`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(result),
                }
            );
            if (!response.ok) throw new Error("Ошибка генерации PDF");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Неизвестная ошибка";
            setError("Ошибка при скачивании: " + msg);
        }
    };

    const reset = () => {
        setFile(null);
        setStep("idle");
        setResult(null);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                    AI Аудит документации
                </h1>
                <p className="text-sm text-white/40 mt-1">
                    Загрузите ТЗ или спецификацию для полного инженерно-геологического анализа
                </p>
            </div>

            {/* Upload / Processing / Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Upload zone */}
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.xlsx,.xls"
                        onChange={(e) => {
                            if (e.target.files?.[0]) setFile(e.target.files[0]);
                        }}
                    />

                    <div
                        className={`rounded-2xl border-2 border-dashed transition-all p-8 min-h-[300px] flex flex-col items-center justify-center text-center ${step === "uploading"
                            ? "border-orange-500/30 bg-orange-500/5"
                            : file
                                ? "border-green-500/30 bg-green-500/5"
                                : "border-white/10 bg-white/[0.02] hover:border-orange-500/30 cursor-pointer"
                            }`}
                        onClick={() => step === "idle" && !file && fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <AnimatePresence mode="wait">
                            {step === "uploading" ? (
                                <motion.div
                                    key="uploading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-6 w-full max-w-xs"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="mx-auto w-20 h-20 relative"
                                    >
                                        <div className="absolute inset-0 border-t-2 border-orange-500 rounded-full" />
                                        <div className="absolute inset-3 border-l-2 border-white/20 rounded-full" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
                                        </div>
                                    </motion.div>

                                    {auditSteps.map((s, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div
                                                className={`w-2 h-2 rounded-full transition-all ${i <= auditStepIdx
                                                    ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                                                    : "bg-white/10"
                                                    }`}
                                            />
                                            <p
                                                className={`text-xs font-bold uppercase tracking-widest ${i <= auditStepIdx ? "text-white" : "text-white/20"
                                                    }`}
                                            >
                                                {i < auditStepIdx && (
                                                    <span className="text-green-500 mr-2">✓</span>
                                                )}
                                                {s}
                                            </p>
                                        </div>
                                    ))}

                                    <p className="text-[9px] text-white/30 font-mono animate-pulse uppercase text-center mt-4">
                                        AI проводит глубокий анализ...
                                    </p>
                                </motion.div>
                            ) : file ? (
                                <motion.div
                                    key="file-selected"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                                        <FileText className="w-7 h-7 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white truncate max-w-[250px]">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-white/30 mt-1">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={startAudit}
                                            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-[#0F172A] font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-500/20"
                                        >
                                            Запустить аудит
                                        </button>
                                        <button
                                            onClick={reset}
                                            className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 rounded-xl transition-all"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="dropzone"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-4"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto">
                                        <Upload className="w-7 h-7 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase">
                                            Загрузить документ
                                        </p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">
                                            PDF / XLSX • Max 5MB
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                        >
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <p className="text-xs text-red-400 font-bold">{error}</p>
                        </motion.div>
                    )}
                </div>

                {/* Right: Results */}
                <AnimatePresence>
                    {result && step === "complete" && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Header bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-tight">
                                            Аудит завершён
                                        </p>
                                        <p className="text-[10px] text-white/30 font-mono">
                                            Confidence: {(result.confidence_score * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDownloadReport}
                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-[#0F172A] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20"
                                    >
                                        <Download className="w-3 h-3" /> PDF
                                    </button>
                                    <button
                                        onClick={reset}
                                        className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all text-white/40"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                        Тип работ
                                    </p>
                                    <p className="text-sm font-bold text-white mt-1">
                                        {result.parsed_data.work_type}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                        Объем
                                    </p>
                                    <p className="text-sm font-bold text-orange-500 mt-1">
                                        {result.parsed_data.volume?.toLocaleString() || "—"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                        Глубина (м)
                                    </p>
                                    <p className="text-sm font-bold text-white mt-1">
                                        {result.parsed_data.depth || "—"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                                        Грунт
                                    </p>
                                    <p className="text-xs font-bold text-white mt-1">
                                        {result.parsed_data.soil_type || "—"}
                                    </p>
                                </div>
                                {result.estimated_total && (
                                    <div className="col-span-2 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                                        <p className="text-[9px] text-green-500/60 uppercase tracking-widest font-bold">
                                            Предварительная смета
                                        </p>
                                        <p className="text-lg font-black text-green-400 mt-1">
                                            {result.estimated_total.toLocaleString()} ₽
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Risk matrix */}
                            {result.risks.length > 0 && (
                                <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" /> Матрица рисков ({result.risks.length})
                                    </p>
                                    <div className="space-y-3">
                                        {result.risks.map((r, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs font-black text-white/90 uppercase tracking-tight">
                                                        {r.risk}
                                                    </p>
                                                    <p className="text-[11px] text-white/50 leading-relaxed">
                                                        {r.impact}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matched equipment */}
                            {(result.matched_shpunts.length > 0 || result.recommended_machinery.length > 0) && (
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-4">
                                        Подобранное оборудование
                                    </p>

                                    {result.matched_shpunts.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Шпунт</p>
                                            <div className="space-y-2">
                                                {result.matched_shpunts.map((s, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                                        <span className="text-xs font-bold text-white">{s.name}</span>
                                                        <span className="text-xs font-mono text-orange-400">
                                                            {s.price.toLocaleString()} ₽ • {s.stock} шт
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {result.recommended_machinery.length > 0 && (
                                        <div>
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Техника</p>
                                            <div className="space-y-2">
                                                {result.recommended_machinery.map((m, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                                                        <div>
                                                            <span className="text-xs font-bold text-white">{m.name}</span>
                                                            <span className="text-[10px] text-white/30 ml-2">{m.category}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Technical summary */}
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-orange-500" /> Экспертное резюме
                                </p>
                                <div className="text-[11px] text-white/70 font-mono leading-relaxed whitespace-pre-wrap">
                                    {result.technical_summary}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
