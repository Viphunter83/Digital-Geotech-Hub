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
    photos?: { directus_files_id: { id: string; filename_disk: string } }[];
    documents?: { directus_files_id: { id: string; filename_download: string; title?: string } }[];
    machinery_used?: { machinery_id: { id: string; name: string; category: string } }[];
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
                        <a
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className="block bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group relative"
                        >
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-orange-500" />
                            </div>
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

                                {project.photos && project.photos.length > 0 && (
                                    <div className="mt-6">
                                        <p className="text-[10px] font-bold uppercase text-white/30 mb-2">Фотоотчет</p>
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {project.photos.map((p, k) => (
                                                <div key={k} className="shrink-0 w-24 h-16 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative group/img">
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_CMS_URL}/assets/${p.directus_files_id.id}?key=system-medium-contain`}
                                                        alt="Photo"
                                                        className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-center gap-6 mt-6">
                                    {project.machinery_used && project.machinery_used.length > 0 && (
                                        <div className="shrink-0">
                                            <p className="text-[10px] font-bold uppercase text-white/30 mb-2">Техника на объекте</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.machinery_used.map((m, k) => (
                                                    <div
                                                        key={k}
                                                        className="text-[9px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-500 px-2 py-1 rounded border border-orange-500/20 transition-all"
                                                    >
                                                        {m.machinery_id.name}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {project.documents && project.documents.length > 0 && (
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold uppercase text-white/30 mb-2">Документы</p>
                                            <div className="flex flex-wrap gap-2">
                                                {project.documents.map((d, k) => (
                                                    <div
                                                        key={k}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 transition-colors"
                                                    >
                                                        <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-xs text-white/60">
                                                            {d.directus_files_id.title || d.directus_files_id.filename_download}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
