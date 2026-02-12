"use client";

import { useState, useEffect } from "react";
import { FolderKanban, MapPin, Calendar, ArrowUpRight, Loader2 } from "lucide-react";

interface Project {
    id: number;
    title: string;
    description: string | null;
    status: string;
    location: string | null;
    progress: number;
    work_type: string | null;
    start_date: string | null;
    end_date: string | null;
    tags: string[] | null;
    date_created: string;
}

const statusStyles: Record<string, string> = {
    planning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_progress: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    paused: "bg-white/5 text-white/40 border-white/10",
};
const statusLabels: Record<string, string> = {
    planning: "Планирование",
    in_progress: "В работе",
    completed: "Завершён",
    paused: "Приостановлен",
};

const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ru-RU", { month: "short", year: "numeric" });
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const raw = localStorage.getItem("geotech_session");
                const token = raw ? JSON.parse(raw)?.token : null;
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/projects`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.projects || []);
                }
            } catch (err) {
                console.error("Failed to load projects:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight">Мои проекты</h1>
                <p className="text-white/40 text-xs mt-1 font-bold uppercase tracking-widest">
                    {projects.length} {projects.length === 1 ? "проект" : "проектов"} • Данные из Directus
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-16">
                    <FolderKanban className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-sm text-white/30 font-bold">Нет проектов</p>
                    <p className="text-xs text-white/20 mt-1">Обратитесь к менеджеру для добавления проектов</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <FolderKanban className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-base mb-1">{project.title}</div>
                                        <div className="flex items-center gap-4 text-[10px] text-white/30">
                                            {project.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" /> {project.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {formatDate(project.start_date)}{" "}
                                                → {formatDate(project.end_date)}
                                            </span>
                                        </div>
                                        {project.description && (
                                            <p className="text-xs text-white/40 mt-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusStyles[project.status] || statusStyles.paused
                                        }`}
                                >
                                    {statusLabels[project.status] || project.status}
                                </span>
                            </div>

                            {/* Progress + tags */}
                            <div className="pl-[60px]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {project.tags?.map((tag, j) => (
                                            <span
                                                key={j}
                                                className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded-md font-bold uppercase"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs font-mono text-white/30">{project.progress}%</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all ${project.progress >= 80
                                                ? "bg-emerald-500"
                                                : project.progress >= 50
                                                    ? "bg-orange-500"
                                                    : "bg-blue-500"
                                            }`}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
