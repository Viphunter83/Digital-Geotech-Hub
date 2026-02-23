"use client";

import { useState, useEffect, use } from "react";
import {
    FolderKanban,
    MapPin,
    Calendar,
    ArrowLeft,
    FileText,
    Image as ImageIcon,
    ExternalLink,
    Download,
    CheckCircle2,
    Clock,
    Box,
    Loader2,
    Construction
} from "lucide-react";

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
    return new Date(d).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const raw = localStorage.getItem("geotech_session");
                const token = raw ? JSON.parse(raw)?.token : null;
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/dashboard/projects`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                );
                if (res.ok) {
                    const data = await res.json();
                    const found = data.projects?.find((p: Project) => p.id.toString() === id);
                    setProject(found || null);
                }
            } catch (err) {
                console.error("Failed to load project details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-20">
                <p className="text-white/40 mb-4">Проект не найден</p>
                <a href="/dashboard/projects" className="text-orange-500 font-bold hover:underline">
                    Вернуться к списку
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <a
                    href="/dashboard/projects"
                    className="flex items-center gap-2 text-xs font-bold text-white/40 hover:text-white transition-colors w-fit group"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    К СПИСКУ ПРОЕКТОВ
                </a>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${statusStyles[project.status]}`}>
                                {statusLabels[project.status]}
                            </span>
                            <span className="text-white/20 text-xs font-mono">ID: {project.id}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
                            {project.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
                            {project.location && (
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-500" /> {project.location}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-orange-500" />
                                {formatDate(project.start_date)} — {project.end_date ? formatDate(project.end_date) : "наст. время"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Description */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4">
                        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                            <FileText className="w-5 h-5 text-orange-500" />
                            О проекте
                        </h2>
                        <div className="text-white/60 leading-relaxed whitespace-pre-line">
                            {project.description || "Описание проекта не заполнено."}
                        </div>
                        <div className="flex flex-wrap gap-2 pt-4">
                            {project.tags?.map((tag, i) => (
                                <span key={i} className="text-[10px] bg-white/5 text-white/60 px-3 py-1.5 rounded-lg border border-white/10 font-bold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                                <Clock className="w-5 h-5 text-orange-500" />
                                Статус выполнения
                            </h2>
                            <span className="text-2xl font-mono font-black text-orange-500">{project.progress}%</span>
                        </div>
                        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/30 font-bold uppercase">Тип работ</p>
                                <p className="text-sm font-bold">{project.work_type || "Не указан"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/30 font-bold uppercase">Начало</p>
                                <p className="text-sm font-bold">{formatDate(project.start_date)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/30 font-bold uppercase">Дедлайн</p>
                                <p className="text-sm font-bold">{formatDate(project.end_date)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-white/30 font-bold uppercase">Создан</p>
                                <p className="text-sm font-bold">{formatDate(project.date_created)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Photo Gallery */}
                    {project.photos && project.photos.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3 px-2">
                                <ImageIcon className="w-5 h-5 text-orange-500" />
                                Фотоотчеты с объекта
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {project.photos.map((p, i) => (
                                    <div
                                        key={i}
                                        className="aspect-video rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer"
                                    >
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_CMS_URL}/assets/${p.directus_files_id.id}?key=system-large-contain`}
                                            alt={`Project Photo ${i + 1}`}
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <ExternalLink className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Documents List */}
                    <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 space-y-6">
                        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                            <Box className="w-5 h-5 text-orange-500" />
                            Документы
                        </h2>
                        <div className="space-y-3">
                            {project.documents && project.documents.length > 0 ? (
                                project.documents.map((doc, i) => (
                                    <a
                                        key={i}
                                        href={`${process.env.NEXT_PUBLIC_CMS_URL}/assets/${doc.directus_files_id.id}?download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/doc"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shrink-0 group-hover/doc:scale-110 transition-transform">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white/80 group-hover/doc:text-white transition-colors truncate">
                                                    {doc.directus_files_id.title || doc.directus_files_id.filename_download}
                                                </p>
                                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-0.5">PDF • 2.4 MB</p>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-white/20 group-hover/doc:text-orange-500 transition-colors shrink-0" />
                                    </a>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-xs text-white/20">Документация еще не добавлена</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Machinery */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-3">
                            <Construction className="w-5 h-5 text-orange-500" />
                            Техника
                        </h2>
                        <div className="space-y-3">
                            {project.machinery_used && project.machinery_used.length > 0 ? (
                                project.machinery_used.map((m, i) => (
                                    <a
                                        key={i}
                                        href={`/machinery#${m.machinery_id.id}`}
                                        className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-orange-500/30 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                                            <Construction className="w-6 h-6 text-white/20 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-orange-500 transition-colors">{m.machinery_id.name}</p>
                                            <p className="text-[10px] text-white/30 uppercase font-bold">{m.machinery_id.category}</p>
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p className="text-xs text-white/20 text-center py-4">Список техники пуст</p>
                            )}
                        </div>
                    </div>

                    {/* Support Contact */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
                        <h3 className="text-xs font-black uppercase tracking-widest text-orange-500 mb-2">Техническая поддержка</h3>
                        <p className="text-xs text-white/60 mb-4 font-medium leading-relaxed">
                            Если у вас возникли вопросы по документации или ходу работ, обратитесь к вашему персональному менеджеру.
                        </p>
                        <a
                            href={`mailto:drilling.rigs.info@yandex.ru?subject=Вопрос по проекту: ${project?.title || ''}`}
                            className="w-full py-3 rounded-xl bg-orange-500 text-white text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 text-center block"
                        >
                            Связаться
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
