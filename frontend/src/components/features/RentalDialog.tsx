"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface RentalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    machineId: string;
    machineName: string;
}

export function RentalDialog({ open, onOpenChange, machineId, machineName }: RentalDialogProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [agreed, setAgreed] = useState(true); // Default to true but needs checkbox
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        company: "",
        email: "",
        comment: ""
    });

    const [info, setInfo] = useState<{ phone: string, email: string } | null>(null);

    // Load user data and CMS info
    useEffect(() => {
        if (open) {
            const raw = localStorage.getItem("geotech_session");
            if (raw) {
                try {
                    const session = JSON.parse(raw);
                    setFormData(prev => ({
                        ...prev,
                        company: session.company || "",
                        email: session.email || ""
                    }));
                } catch (e) {
                    console.error("Failed to parse session", e);
                }
            }

            // Fetch dynamic contacts
            import("@/lib/directus-fetch").then(m => {
                m.fetchSingleton<{ phone: string, email: string }>('company_info', {
                    fields: ['phone', 'email']
                }).then(data => setInfo(data));
            });
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/leads/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    company: formData.company,
                    audit_data: {
                        type: "rental_request",
                        machinery_id: machineId,
                        machinery_name: machineName,
                        comment: formData.comment
                    }
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    onOpenChange(false);
                    setFormData({ name: "", phone: "", company: "", email: "", comment: "" });
                }, 2000);
            } else {
                alert("Ошибка отправки заявки. Попробуйте позже.");
            }
        } catch (error) {
            console.error(error);
            alert("Ошибка сети.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-[#0D1117] border border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight">
                        {success ? "Заявка принята" : `Аренда ${machineName}`}
                    </DialogTitle>
                    <DialogDescription className="text-white/40 text-xs">
                        {success
                            ? "Наш менеджер свяжется с вами в течение 15 минут для уточнения деталей."
                            : "Оставьте контактные данные для расчета стоимости смены и доставки."}
                    </DialogDescription>
                </DialogHeader>

                {success ? (
                    <div className="py-10 flex flex-col items-center justify-center text-emerald-500 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-16 h-16 mb-4" />
                        <span className="font-bold text-lg">Успешно отправлено!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-white/40">Контактное лицо</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-orange-500/50 text-white"
                                placeholder="Иван Петров"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-white/40">Телефон</Label>
                            <Input
                                id="phone"
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-orange-500/50 text-white"
                                placeholder="+7 (999) 000-00-00"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="company" className="text-xs font-bold uppercase tracking-wider text-white/40">Компания</Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-orange-500/50 text-white"
                                    placeholder="ООО Строй"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/40">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-orange-500/50 text-white"
                                    placeholder="info@company.ru"
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mt-2">
                            <input
                                type="checkbox"
                                id="privacy-consent"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                required
                                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500/50"
                            />
                            <Label htmlFor="privacy-consent" className="text-[10px] leading-relaxed text-white/60 cursor-pointer">
                                Я даю согласие на <a href="/privacy" target="_blank" className="text-orange-500 underline hover:text-orange-400">обработку персональных данных</a> и соглашаюсь с политикой конфиденциальности согласно 152-ФЗ РФ.
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="submit"
                                disabled={loading || !agreed}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-widest text-xs h-10"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Отправить запрос"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {!success && (
                    <div className="pt-6 mt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Или свяжитесь напрямую</p>
                        <div className="flex justify-center gap-6 text-xs font-medium">
                            <a href={`tel:${info?.phone || '+79218844403'}`} className="text-white hover:text-orange-500 transition-colors">
                                {info?.phone || '+7 (921) 884-44-03'}
                            </a>
                            <a href={`mailto:${info?.email || 'drilling.rigs.info@yandex.ru'}`} className="text-white hover:text-orange-500 transition-colors">
                                {info?.email || 'drilling.rigs.info@yandex.ru'}
                            </a>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
