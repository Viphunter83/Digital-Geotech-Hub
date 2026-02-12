"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, Loader2, Sparkles, X, Info, Send, Download, Phone, User, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface RiskItem {
    risk: string;
    impact: string;
}

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
    risks: RiskItem[];
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
    const [auditStep, setAuditStep] = useState<number>(0);
    const [proposal, setProposal] = useState<DraftProposal | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [isLeadSubmitting, setIsLeadSubmitting] = useState(false);
    const [leadSubmitted, setLeadSubmitted] = useState(false);
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadForm, setLeadForm] = useState({ name: "", phone: "", company: "" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const auditSteps = [
        "Извлечение текста и таблиц",
        "Инженерно-геологический анализ",
        "Оценка технических рисков",
        "Генерация экспертного отчета"
    ];

    useEffect(() => {
        if (isUploading) {
            const interval = setInterval(() => {
                setAuditStep(prev => (prev < 3 ? prev + 1 : prev));
            }, 1200);
            return () => clearInterval(interval);
        } else {
            setAuditStep(0);
        }
    }, [isUploading]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages]);

    const handleFileUpload = async (file: File) => {
        // Client-side protection: File Size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Файл слишком большой. Максимальный размер 5МБ.");
            return;
        }

        // Client-side protection: File Type
        const allowedTypes = ['.pdf', '.xlsx', '.xls'];
        const fileName = file.name.toLowerCase();
        if (!allowedTypes.some(type => fileName.endsWith(type))) {
            setError("Недопустимый формат файла. Используйте PDF или Excel.");
            return;
        }

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

                // Specific messaging for protection layers
                if (response.status === 429) {
                    throw new Error("Лимит запросов исчерпан. Пожалуйста, попробуйте через час.");
                }
                if (response.status === 422) {
                    throw new Error("Документ не прошел проверку: система ожидает ТЗ или спецификацию по геотехнике.");
                }

                throw new Error(errData.detail || "Ошибка при обработке документа");
            }

            const data = await response.json();
            setProposal(data);
        } catch (err: any) {
            setError(err.message || "Неизвестная ошибка");
        } finally {
            setIsUploading(false);
        }
    };

    const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isThinking || !proposal) return;

        const userMsg = chatInput;
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsThinking(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg,
                    history: chatMessages,
                    context: proposal.technical_summary
                }),
            });

            if (!response.ok) throw new Error("Ошибка связи с AI");

            const data = await response.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err: any) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Извините, произошла ошибка. Попробуйте позже." }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleDownloadReport = async () => {
        if (!proposal) return;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ai/download-report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(proposal),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Ошибка генерации PDF");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Technical_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error("Ошибка при скачивании отчета:", err.message);
            setError("Ошибка при скачивании отчета: " + err.message);
        }
    };

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLeadSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...leadForm,
                    audit_data: proposal?.parsed_data
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Ошибка при отправке данных");
            }

            setLeadSubmitted(true);
            setShowLeadForm(false);
            setLeadForm({ name: "", phone: "", company: "" }); // Reset form
        } catch (err: any) {
            setError(err.message || "Неизвестная ошибка при отправке данных");
        } finally {
            setIsLeadSubmitting(false);
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
                            <Sparkles className="w-3 h-3" /> AI Copilot v2.0
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase mb-8 leading-tight">
                            AI Estimator & <span className="text-orange-500">Technical</span><br />Auditor
                        </h2>
                        <p className="text-lg text-white/70 mb-10 max-w-xl">
                            Загрузите спецификацию или ТЗ. Наш AI-инженер рассчитает предварительную смету, подберет технику и проведет полный аудит технических рисков проекта.
                        </p>

                        <ul className="space-y-4 mb-10">
                            <FeatureItem text="Автоматический расчет сметы (Budget Estimation)" />
                            <FeatureItem text="RAG-анализ по ГОСТ 25100 и СП 45.13330" />
                            <FeatureItem text="Выявление скрытых инженерных рисков" />
                        </ul>

                        {proposal && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-orange-500 rounded-2xl flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-[#0F172A]" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/20 text-orange-500 px-3 py-1.5 rounded-full mb-2">Technical Audit Report</span>
                                        <span className="text-[11px] font-mono text-white/40 uppercase">ENGINEERING TRUST: {(proposal.confidence_score * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                {/* Engineering Dashboard Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
                                    <div className="space-y-2">
                                        <p className="text-white/30 uppercase text-[9px] font-black tracking-widest">Тип работ</p>
                                        <p className="text-sm font-bold uppercase">{proposal.parsed_data.work_type}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white/30 uppercase text-[9px] font-black tracking-widest">Объем</p>
                                        <p className="text-sm font-bold text-orange-500">
                                            {proposal.parsed_data.volume ? `${proposal.parsed_data.volume.toLocaleString()}` : "—"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white/30 uppercase text-[9px] font-black tracking-widest">Глубина (m)</p>
                                        <p className="text-sm font-bold">{proposal.parsed_data.depth || "—"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white/30 uppercase text-[9px] font-black tracking-widest">Грунт</p>
                                        <p className="text-[10px] font-bold leading-tight">{proposal.parsed_data.soil_type || "—"}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-white/30 uppercase text-[9px] font-black tracking-widest">Шпунт / Профиль</p>
                                        <p className="text-sm font-bold text-orange-400">{proposal.parsed_data.required_profile || "Standard"}</p>
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <p className="text-green-500/60 uppercase text-[9px] font-black tracking-widest">Estimated Budget</p>
                                        <p className="text-lg font-black text-green-400">
                                            {proposal.estimated_total ? `${proposal.estimated_total.toLocaleString()} ₽` : "В расчете..."}
                                        </p>
                                    </div>
                                </div>

                                {/* Risk Matrix Section */}
                                {proposal.risks && proposal.risks.length > 0 && (
                                    <div className="mb-10 bg-red-500/5 rounded-2xl border border-red-500/10 p-6 overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Info className="w-12 h-12 text-red-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles className="w-3 h-3" /> Матрица рисков
                                        </p>
                                        <div className="space-y-3">
                                            {proposal.risks.map((r, i) => (
                                                <div key={i} className="flex items-start gap-4 group">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-white/90 group-hover:text-red-400 transition-colors uppercase tracking-tight">{r.risk}</p>
                                                        <p className="text-[11px] text-white/50 leading-relaxed">{r.impact}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Special Conditions if any */}
                                {proposal.parsed_data.special_conditions.length > 0 && (
                                    <div className="mb-8 p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10">
                                        <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Особые условия</p>
                                        <div className="flex flex-wrap gap-2">
                                            {proposal.parsed_data.special_conditions.map((cond, idx) => (
                                                <div key={idx} className="text-[10px] bg-white/10 px-2 py-1 rounded">
                                                    {cond}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Markdown Summary Section */}
                                <div className="p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FileText className="w-3 h-3 text-orange-500" /> Итоговое экспертное резюме
                                    </p>
                                    <div className="text-[11px] text-white/70 font-mono leading-relaxed whitespace-pre-wrap">
                                        {proposal.technical_summary}
                                    </div>
                                </div>
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
                            className={`aspect-video md:aspect-[4/3] rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-xl flex flex-col p-8 transition-all hover:border-orange-500/50 group ${isUploading ? 'pointer-events-none' : ''}`}
                        >
                            {isUploading ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                        className="relative w-32 h-32 mb-12"
                                    >
                                        <div className="absolute inset-0 border-t-2 border-orange-500 rounded-full" />
                                        <div className="absolute inset-4 border-l-2 border-white/20 rounded-full" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-orange-500 animate-pulse" />
                                        </div>
                                    </motion.div>
                                    <div className="space-y-6 w-full max-w-xs">
                                        {auditSteps.map((step, i) => (
                                            <div key={i} className="flex items-center gap-4 transition-all duration-500">
                                                <div className={`w-2 h-2 rounded-full ${i <= auditStep ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-white/10'}`} />
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${i <= auditStep ? 'text-white' : 'text-white/20'}`}>
                                                    {i < auditStep ? <span className="text-green-500 mr-2">✓</span> : null}
                                                    {step}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white/30 mt-12 font-mono animate-pulse uppercase">Система проводит глубокий расчет параметров...</p>
                                </div>
                            ) : proposal ? (
                                <div className="flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-orange-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-tighter">AI Engineering Session</p>
                                                <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest opacity-80">Online</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!leadSubmitted && (
                                                <button
                                                    onClick={() => setShowLeadForm(true)}
                                                    className="px-3 py-1.5 bg-orange-500 text-[#0F172A] rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20"
                                                >
                                                    Сохранить расчет
                                                </button>
                                            )}
                                            <button
                                                onClick={handleDownloadReport}
                                                className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-orange-500"
                                                title="Скачать PDF отчет"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProposal(null);
                                                    setChatMessages([]);
                                                    setLeadSubmitted(false);
                                                    setShowLeadForm(false);
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/30 hover:text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 relative overflow-hidden flex flex-col">
                                        <AnimatePresence mode="wait">
                                            {showLeadForm ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute inset-0 z-20 bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center"
                                                >
                                                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-6">
                                                        <Phone className="w-6 h-6 text-orange-500" />
                                                    </div>
                                                    <h5 className="text-lg font-black uppercase mb-2">Сохранить расчет</h5>
                                                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-8">Введите данные, чтобы наш инженер провел точный расчет сметы</p>

                                                    <form onSubmit={handleLeadSubmit} className="w-full space-y-4 max-w-xs">
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                                            <Input
                                                                placeholder="Ваше имя"
                                                                required
                                                                className="bg-white/5 border-white/10 pl-10 text-xs font-mono h-10 focus:border-orange-500/50"
                                                                value={leadForm.name}
                                                                onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                                            <Input
                                                                placeholder="+7 (___) ___-__-__"
                                                                type="tel"
                                                                required
                                                                className="bg-white/5 border-white/10 pl-10 text-xs font-mono h-10 focus:border-orange-500/50"
                                                                value={leadForm.phone}
                                                                onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <Building2 className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                                            <Input
                                                                placeholder="Компания (необязательно)"
                                                                className="bg-white/5 border-white/10 pl-10 text-xs font-mono h-10 focus:border-orange-500/50"
                                                                value={leadForm.company}
                                                                onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                                                            />
                                                        </div>
                                                        <Button
                                                            disabled={isLeadSubmitting}
                                                            className="w-full bg-orange-500 hover:bg-orange-600 text-[#0F172A] font-black uppercase tracking-widest py-6 shadow-xl shadow-orange-500/20 transition-all"
                                                        >
                                                            {isLeadSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Отправить инженеру"}
                                                        </Button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowLeadForm(false)}
                                                            className="text-[9px] text-white/20 uppercase font-black hover:text-white transition-colors pt-2"
                                                        >
                                                            Вернуться к чату
                                                        </button>
                                                    </form>
                                                </motion.div>
                                            ) : leadSubmitted ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute inset-0 z-20 bg-[#0F172A] flex flex-col items-center justify-center p-8 text-center"
                                                >
                                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                    </div>
                                                    <h5 className="text-xl font-black uppercase mb-4">Заявка принята!</h5>
                                                    <p className="text-[11px] text-white/50 leading-relaxed max-w-xs mb-8">Инженер ООО "Диджитал Геотех Хаб" свяжется с вами в течение 30 минут для уточнения деталей.</p>
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setLeadSubmitted(false)}
                                                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest px-8"
                                                    >
                                                        К чату
                                                    </Button>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>

                                        <ScrollArea className="flex-1 pr-4 -mr-4 mb-6">
                                            <div className="space-y-6 pb-4">
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-[11px] leading-relaxed text-white/70 font-mono">
                                                    <span className="text-orange-500 font-black">AI:</span> Приветствую. Я завершил аудит документации. <br /><br />
                                                    Обнаружено <span className="text-red-400">{proposal.risks?.length || 0} критических факторов</span>. Вы можете уточнить любые детали по расчету шпунта или геологии в чате ниже.
                                                </div>

                                                {chatMessages.map((msg, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`p-4 rounded-2xl text-[11px] leading-relaxed font-mono ${msg.role === 'user'
                                                            ? 'bg-orange-500 text-[#0F172A] ml-8 rounded-tr-none font-black shadow-lg shadow-orange-500/10'
                                                            : 'bg-white/5 border border-white/10 text-white/70 mr-8 rounded-tl-none'
                                                            }`}
                                                    >
                                                        <span className={msg.role === 'user' ? 'text-black/50' : 'text-orange-500'}>
                                                            {msg.role === 'user' ? '> USER: ' : 'AI: '}
                                                        </span>
                                                        {msg.content}
                                                    </div>
                                                ))}

                                                {isThinking && (
                                                    <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-widest animate-pulse ml-4">
                                                        <Loader2 className="w-3 h-3 animate-spin text-orange-500" /> Инженер формирует ответ...
                                                    </div>
                                                )}
                                                <div ref={scrollRef} />
                                            </div>
                                        </ScrollArea>

                                        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10 focus-within:border-orange-500/50 transition-all">
                                            <Input
                                                placeholder="Уточнить стоимость или риск..."
                                                className="bg-transparent border-none text-white text-[11px] font-mono shadow-none focus-visible:ring-0 h-10"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <Button
                                                variant="secondary"
                                                className="bg-orange-500 hover:bg-orange-600 text-[#0F172A] h-10 w-10 p-0 rounded-xl shrink-0 shadow-lg shadow-orange-500/20"
                                                onClick={handleSendMessage}
                                                disabled={isThinking}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="flex-1 flex flex-col items-center justify-center text-center cursor-pointer p-8 relative overflow-hidden"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mb-8 p-8 bg-white/5 rounded-full group-hover:bg-orange-500/10 border border-white/10 transition-all shadow-2xl relative z-10"
                                    >
                                        <Upload className="w-16 h-16 text-orange-500" />
                                    </motion.div>
                                    <h4 className="text-2xl font-black mb-2 uppercase tracking-tight relative z-10">Рассчитать смету</h4>
                                    <p className="text-[10px] text-white/30 mb-8 font-black uppercase tracking-[0.4em] relative z-10">Загрузить ТЗ / Спецификацию / XLSX</p>

                                    <div className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors relative z-10">
                                        Выберите файл или перетащите его сюда
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3 relative z-10"
                                        >
                                            <Info className="w-4 h-4" /> {error}
                                        </motion.div>
                                    )}

                                    <div className="mt-8 pt-4 border-t border-white/5 w-full flex items-center justify-center gap-4 text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                        <span>Max 5MB</span>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>PDF / XLSX</span>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <span>5 requests / hr</span>
                                    </div>
                                </div>
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
