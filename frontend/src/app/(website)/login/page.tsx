"use client";

import { motion } from "framer-motion";
import { KeyRound, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-code`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ access_code: code.trim() }),
                }
            );

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error("Неверный код доступа");
                }
                throw new Error(errData.detail || "Ошибка сервера");
            }

            const data = await response.json();

            // Store JWT session (not the code itself!)
            localStorage.setItem(
                "geotech_session",
                JSON.stringify({
                    authenticated: true,
                    token: data.access_token,
                    company: data.client.company_name,
                    email: data.client.email,
                    level: data.client.access_level,
                    loginAt: new Date().toISOString(),
                })
            );

            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-500/5 blur-[200px] rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[150px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 mb-6">
                        <KeyRound className="w-8 h-8 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                        Личный кабинет
                    </h1>
                    <p className="text-sm text-white/40 font-medium">
                        Введите код доступа вашей компании
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value.toUpperCase());
                                    setError("");
                                }}
                                placeholder="XXXX-XXXX"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-center text-lg font-mono tracking-[0.3em] placeholder:text-white/15 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all"
                                autoFocus
                                autoComplete="off"
                            />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 text-red-400 text-xs font-bold text-center uppercase tracking-widest"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !code.trim()}
                            className="mt-6 w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0F1C] font-black text-sm uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-orange-500/20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Войти <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        Защищённое соединение • SSL/TLS
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
