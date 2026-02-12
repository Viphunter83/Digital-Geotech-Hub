"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    TrendingUp,
    FileSearch,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    Zap,
    FolderKanban,
    FileText,
    Upload,
    Loader2,
} from "lucide-react";

interface OverviewStats {
    active_projects: number;
    total_audits: number;
    completed_projects: number;
    company_name: string;
}

interface RecentProject {
    id: number;
    title: string;
    status: string;
    progress: number;
    location: string;
    work_type: string;
    start_date: string;
}

interface RecentAudit {
    id: number;
    filename: string;
    work_type: string;
    confidence_score: number;
    risks_count: number;
    estimated_total: number | null;
    date_created: string;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    planning: { label: "Планирование", color: "text-blue-400" },
    in_progress: { label: "В работе", color: "text-orange-400" },
    completed: { label: "Завершён", color: "text-green-400" },
    paused: { label: "Приостановлен", color: "text-white/40" },
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [projects, setProjects] = useState<RecentProject[]>([]);
    const [audits, setAudits] = useState<RecentAudit[]>([]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const raw = localStorage.getItem("geotech_session");
                const session = raw ? JSON.parse(raw) : null;
                const token = session?.token;

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/overview`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setProjects(data.recent_projects || []);
                    setAudits(data.recent_audits || []);
                }
            } catch (err) {
                console.error("Failed to load overview:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            title: "Активные проекты",
            value: String(stats?.active_projects || 0),
            icon: FolderKanban,
            color: "orange",
            gradient: "from-orange-500/20 to-orange-500/5",
            border: "border-orange-500/20",
        },
        {
            title: "Завершённые проекты",
            value: String(stats?.completed_projects || 0),
            icon: CheckCircle2,
            color: "green",
            gradient: "from-green-500/20 to-green-500/5",
            border: "border-green-500/20",
        },
        {
            title: "AI Аудитов",
            value: String(stats?.total_audits || 0),
            icon: FileSearch,
            color: "blue",
            gradient: "from-blue-500/20 to-blue-500/5",
            border: "border-blue-500/20",
        },
    ];

    const timeAgo = (dateStr: string) => {
        if (!dateStr) return "";
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Сегодня";
        if (days === 1) return "Вчера";
        if (days < 7) return `${days} дн. назад`;
        return new Date(dateStr).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">
                    Обзор • {stats?.company_name || "Клиент"}
                </h1>
                <p className="text-xs text-white/40 mt-1 font-bold uppercase tracking-widest">
                    Панель управления проектами и аудитами
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statCards.map((card) => (
                    <div
                        key={card.title}
                        className={`p-5 rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} relative overflow-hidden`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                    {card.title}
                                </p>
                                <p className="text-3xl font-black text-white mt-2">{card.value}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <card.icon className={`w-5 h-5 text-${card.color}-500`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Projects */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xs font-black text-white uppercase tracking-widest">
                            Проекты
                        </h2>
                        <Link
                            href="/dashboard/projects"
                            className="text-[10px] text-orange-500 font-black uppercase tracking-widest flex items-center gap-1 hover:text-orange-400 transition-colors"
                        >
                            Все <ArrowUpRight className="w-3 h-3" />
                        </Link>
                    </div>

                    {projects.length === 0 ? (
                        <div className="text-center py-8">
                            <FolderKanban className="w-8 h-8 text-white/10 mx-auto mb-3" />
                            <p className="text-xs text-white/30 font-bold">Нет проектов</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {projects.map((p) => {
                                const st = statusLabels[p.status] || { label: p.status, color: "text-white/40" };
                                return (
                                    <div
                                        key={p.id}
                                        className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-orange-500/20 transition-all"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-bold text-white truncate max-w-[250px]">
                                                {p.title}
                                            </p>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${st.color}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                        {p.location && (
                                            <p className="text-[10px] text-white/30 mb-3">{p.location}</p>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
                                                    style={{ width: `${p.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono text-white/40">
                                                {p.progress}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Recent Audits */}
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xs font-black text-white uppercase tracking-widest">
                            Последние аудиты
                        </h2>
                        <Link
                            href="/dashboard/audit"
                            className="text-[10px] text-orange-500 font-black uppercase tracking-widest flex items-center gap-1 hover:text-orange-400 transition-colors"
                        >
                            Новый <Upload className="w-3 h-3" />
                        </Link>
                    </div>

                    {audits.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="w-8 h-8 text-white/10 mx-auto mb-3" />
                            <p className="text-xs text-white/30 font-bold">Нет аудитов</p>
                            <Link
                                href="/dashboard/audit"
                                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg text-orange-500 text-[10px] font-bold uppercase tracking-widest hover:bg-orange-500/20 transition-all"
                            >
                                <Zap className="w-3 h-3" /> Запустить первый аудит
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {audits.map((a) => (
                                <div
                                    key={a.id}
                                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-white truncate max-w-[200px]">
                                            {a.filename}
                                        </p>
                                        <span className="text-[9px] text-white/20 font-mono">
                                            {timeAgo(a.date_created)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        {a.work_type && (
                                            <span className="text-[9px] text-white/30 font-bold uppercase">
                                                {a.work_type}
                                            </span>
                                        )}
                                        {a.risks_count > 0 && (
                                            <span className="text-[9px] text-red-400 font-bold flex items-center gap-1">
                                                <AlertTriangle className="w-2.5 h-2.5" /> {a.risks_count} рисков
                                            </span>
                                        )}
                                        {a.confidence_score && (
                                            <span className="text-[9px] text-green-400 font-mono">
                                                {(a.confidence_score * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
