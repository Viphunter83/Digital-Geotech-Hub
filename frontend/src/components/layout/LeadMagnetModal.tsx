"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, User, Building2, Loader2, CheckCircle2, FileText, Gift } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LeadMagnetModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle: string;
    magnetName: string;
}

export function LeadMagnetModal({ isOpen, onClose, title, subtitle, magnetName }: LeadMagnetModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", company: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    audit_data: { lead_magnet: magnetName }
                }),
            });
            if (!response.ok) throw new Error("Submission failed");
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            {submitted ? (
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-4">Спасибо!</h3>
                                    <p className="text-sm text-white/50 mb-8">Материал уже отправлен вам в Telegram/WhatsApp. Также наш инженер свяжется с вами для уточнения деталей.</p>
                                    <Button onClick={onClose} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-widest">
                                        Закрыть
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Gift className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase mb-2 tracking-tight">{title}</h3>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-relaxed mb-8">{subtitle}</p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                            <Input
                                                placeholder="Ваше имя"
                                                required
                                                className="bg-white/5 border-white/10 pl-10 text-sm h-12 focus:border-orange-500/50"
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                            <Input
                                                placeholder="+7 (___) ___-__-__"
                                                type="tel"
                                                required
                                                className="bg-white/5 border-white/10 pl-10 text-sm h-12 focus:border-orange-500/50"
                                                value={form.phone}
                                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                                            <Input
                                                placeholder="Компания (необязательно)"
                                                className="bg-white/5 border-white/10 pl-10 text-sm h-12 focus:border-orange-500/50"
                                                value={form.company}
                                                onChange={e => setForm({ ...form, company: e.target.value })}
                                            />
                                        </div>
                                        <Button
                                            disabled={isSubmitting}
                                            className="w-full bg-orange-500 hover:bg-orange-600 text-[#0F172A] font-black uppercase tracking-widest py-7 shadow-xl shadow-orange-500/20 transition-all text-sm mt-4"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Получить материалы"}
                                        </Button>
                                        <p className="text-[10px] text-white/60 text-center font-bold uppercase tracking-widest mt-6">
                                            Нажимая кнопку, вы даете согласие на <a href="/privacy" target="_blank" className="text-orange-500 underline hover:text-orange-400 decoration-orange-500/50">обработку персональных данных</a> и соглашаетесь с политикой конфиденциальности согласно 152-ФЗ РФ
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
