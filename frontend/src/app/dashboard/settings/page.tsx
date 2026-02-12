"use client";

import { useState, useEffect } from "react";
import { User, Bell, Shield, Save, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface Profile {
    company_name: string;
    email: string;
    phone: string;
    access_level: string;
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Editable fields
    const [company, setCompany] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    const getToken = () => {
        try {
            const raw = localStorage.getItem("geotech_session");
            return raw ? JSON.parse(raw)?.token : null;
        } catch { return null; }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = getToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/profile`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                if (res.ok) {
                    const data = await res.json();
                    const p = data.profile;
                    setProfile(p);
                    setCompany(p.company_name || "");
                    setEmail(p.email || "");
                    setPhone(p.phone || "");
                }
            } catch (err) {
                console.error("Load profile failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const token = getToken();
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/profile`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        company_name: company,
                        email,
                        phone,
                    }),
                }
            );
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Ошибка сохранения");
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            setError(err.message || "Ошибка");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-2xl">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Настройки</h1>
                <p className="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">
                    Управление профилем
                </p>
            </div>

            {/* Profile Section */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <User className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">Профиль</span>
                    {profile?.access_level && (
                        <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {profile.access_level}
                        </span>
                    )}
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">
                            Компания
                        </label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2 block">
                            Телефон
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 (___) ___-__-__"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <Bell className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-sm uppercase tracking-wider">Уведомления</span>
                </div>
                <div className="p-6 space-y-4">
                    {[
                        { label: "Результаты аудита", description: "Email при завершении AI-анализа", defaultChecked: true },
                        { label: "Обновления проектов", description: "Изменения статуса объектов", defaultChecked: true },
                        { label: "Новые документы", description: "Загрузка актов и отчетов", defaultChecked: false },
                    ].map((item, i) => (
                        <label key={i} className="flex items-center justify-between cursor-pointer group">
                            <div>
                                <div className="text-sm font-medium group-hover:text-white transition-colors">{item.label}</div>
                                <div className="text-xs text-white/30">{item.description}</div>
                            </div>
                            <div className="relative">
                                <input type="checkbox" defaultChecked={item.defaultChecked} className="peer sr-only" />
                                <div className="w-10 h-6 bg-white/10 rounded-full peer-checked:bg-orange-500 transition-colors" />
                                <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform shadow" />
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400 font-bold">{error}</p>
                </div>
            )}

            {/* Save */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${saved
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-orange-500 text-[#0A0F1C] hover:bg-orange-400 shadow-lg shadow-orange-500/20"
                    }`}
            >
                {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                    <><CheckCircle2 className="w-4 h-4" /> Сохранено</>
                ) : (
                    <><Save className="w-4 h-4" /> Сохранить изменения</>
                )}
            </button>
        </div>
    );
}
