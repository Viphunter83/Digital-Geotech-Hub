import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PROJECTS, Project, ProjectTechnology } from "@/lib/projects-data";
import { ArrowLeft, MapPin, Calendar, Layers, CheckCircle, Zap, ArrowUpRight, Share2, Download } from "lucide-react";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { motion } from "framer-motion";
import { BackButton } from "@/components/ui/BackButton";

// 1. Generate Static Params for Static Projects
export async function generateStaticParams() {
    return PROJECTS.map((project) => ({
        id: project.id,
    }));
}

// 2. Data Fetching Helper
async function getProject(id: string): Promise<Project | null> {
    // Try static first
    const staticProject = PROJECTS.find((p) => p.id === id);
    if (staticProject) return staticProject;

    // Try Directus
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/cases/${id}?fields=*,machinery.machinery_id.name`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) return null;

        const { data } = await res.json();

        // Transform Directus data to Project interface

        const technologies: ProjectTechnology[] = data.machinery?.map((m: any) => ({
            id: m.machinery_id.id,
            name: m.machinery_id.name,
            type: 'Оборудование',
            description: m.machinery_id.description, // Assuming description exists in Directus
            image: m.machinery_id.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${m.machinery_id.image}` : null,
        })) || [];

        // Add Soil Type as a "Method"/Condition if not present
        if (data.soil_type) {
            technologies.push({
                id: 'soil-condition',
                name: data.soil_type,
                type: 'Метод',
                description: 'Геологическая особенность участка, требующая специализированного подхода.'
            });
        }

        return {
            id: data.id,
            title: data.title,
            location: data.location || 'РФ',
            region: 'regions',
            category: 'industrial',
            description: data.description,
            challenge: 'Описание задачи уточняется...',
            solution: data.description, // Fallback
            year: data.duration,
            latitude: 0,
            longitude: 0,
            image: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${data.image}`,
            tags: [data.soil_type],
            technologies,
            stats: [
                { label: 'Грунт', value: data.soil_type },
                { label: 'Срок', value: data.duration }
            ]
        };

    } catch (e) {
        console.error("Failed to fetch project", e);
        return null;
    }
}

// 3. Page Component
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params for Next.js 15+
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-20 relative overflow-hidden">
            {/* Background Noise & Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-orange-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.05] bg-[url('/noise.png')] mix-blend-overlay" />
            </div>

            <div className="relative z-10">
                {/* Parallax Hero Section */}
                <div className="relative h-[85vh] w-full overflow-hidden flex items-end pb-20">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-black/30" />

                    <div className="container mx-auto px-4 relative">

                        {/* Back Link - Positioned Absolute Top */}
                        <div className="absolute -top-[60vh] left-4 md:left-0 z-20">
                            <BackButton
                                href="/portfolio"
                                label="Все Проекты"
                                className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:bg-black/40 mb-0"
                            />
                        </div>

                        <div className="max-w-4xl">
                            <div className="flex flex-wrap items-center gap-4 mb-6 animate-fade-in-up">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500 text-white shadow-lg shadow-orange-500/20`}>
                                    Case Study
                                </span>
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <MapPin className="w-3 h-3 text-orange-400" />
                                    {project.location}
                                </span>
                                <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-orange-400" />
                                    {project.year}
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white leading-[0.9] mb-8 drop-shadow-2xl animate-fade-in-up delay-100">
                                {project.title}
                            </h1>

                            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed max-w-2xl animate-fade-in-up delay-200">
                                {project.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="container mx-auto px-4 -mt-20 relative z-20">

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
                        {project.stats.map((stat, idx) => (
                            <div key={idx} className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl hover:border-orange-500/30 transition-colors group">
                                <div className="text-xs font-black uppercase tracking-widest text-white/40 mb-3 group-hover:text-orange-500/80 transition-colors">{stat.label}</div>
                                <div className="text-2xl md:text-3xl font-mono font-bold text-white group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Challenge vs Solution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-32">
                        {/* Challenge */}
                        <div className="relative group">
                            <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-red-500/50 to-transparent hidden md:block" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                                    <Layers className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-3xl font-black uppercase">Вызов</h2>
                            </div>
                            <div className="prose prose-invert prose-lg text-white/70 font-light">
                                <p>{project.challenge || "Описание сложности проекта и поставленных задач уточняется. Мы столкнулись с уникальными геологическими условиями."}</p>
                            </div>
                        </div>

                        {/* Solution */}
                        <div className="relative group">
                            <div className="absolute -left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-emerald-500/50 to-transparent hidden md:block" />
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black uppercase">Решение</h2>
                            </div>
                            <div className="prose prose-invert prose-lg text-white/70 font-light">
                                <p>{project.solution}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tech Stack & Gallery Placeholder */}
                    <div className="mb-0">
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                            <div>
                                <h3 className="text-4xl font-black uppercase text-white mb-2">Технологии</h3>
                                <p className="text-white/50">Примененные решения и оборудование</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {(project.technologies || project.tags.map((t, i) => ({
                                id: `tag-${i}`,
                                name: t,
                                type: 'Метод',
                                description: 'Технологическое решение, примененное в проекте для достижения поставленных целей.'
                            } as ProjectTechnology))).map((item, i) => (
                                <div key={i} className={`group relative rounded-2xl overflow-hidden ${item.image ? 'md:col-span-1 lg:col-span-1 min-h-[400px] shadow-2xl' : 'h-full'}`}>
                                    {item.image ? (
                                        <Link href={`/machinery?id=${item.id}`} className="block h-full">
                                            {/* Image Background for Heavy Machinery */}
                                            <div className="absolute inset-0 bg-[#0F172A] z-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-contain object-bottom opacity-60 group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                                            </div>

                                            {/* Content Overlay - Enhanced */}
                                            <div className="relative z-10 h-full flex flex-col justify-between p-6 bg-gradient-to-b from-black/0 via-black/20 to-black/80 hover:from-black/10 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-orange-400 text-[10px] font-black uppercase tracking-widest mb-1 shadow-black drop-shadow-md">{item.type}</div>
                                                        <h4 className="text-2xl font-black uppercase leading-none drop-shadow-lg">{item.name}</h4>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center -mr-2 -mt-2 group-hover:bg-orange-500 transition-colors backdrop-blur-md border border-white/10">
                                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>

                                                <div className="mt-auto transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                                    {item.description && (
                                                        <p className="text-sm text-white/80 line-clamp-3 mb-4 font-light drop-shadow-md leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    {/* Specs Grid if available */}
                                                    {item.specs && (
                                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 bg-black/40 backdrop-blur-md rounded-xl p-3">
                                                            {item.specs.map((spec, sIdx) => (
                                                                <div key={sIdx}>
                                                                    <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider mb-0.5">{spec.label}</div>
                                                                    <div className="text-sm font-mono text-white font-bold">{spec.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <>
                                            {/* Simple Card for Methods - Enhanced UI */}
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <ArrowUpRight className="w-5 h-5 text-orange-500" />
                                            </div>

                                            {/* Watermark Icon */}
                                            <div className="absolute -bottom-6 -right-6 text-white/[0.02] group-hover:text-white/[0.05] transition-colors duration-500 transform rotate-[-15deg]">
                                                <Zap className="w-40 h-40" />
                                            </div>

                                            <div className="relative z-10 p-8 h-full flex flex-col bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 backdrop-blur-md border border-white/10 hover:border-orange-500/30 transition-all duration-300 rounded-2xl">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center border border-orange-500/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                                                    <Zap className="w-6 h-6 text-orange-400" />
                                                </div>

                                                <div className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-2">{item.type}</div>
                                                <div className="font-bold text-xl text-white mb-4 group-hover:text-orange-100 transition-colors">{item.name}</div>

                                                {item.description && (
                                                    <p className="text-sm text-white/50 font-light leading-relaxed group-hover:text-white/70 transition-colors">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                        </div>

                        {/* Spacer to prevent margin collapse */}
                        <div className="h-48 md:h-64" />

                        {/* Final CTA */}
                        <div className="relative rounded-[32px] overflow-hidden border border-white/10 shadow-2xl group">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-purple-900 opacity-90 transition-opacity duration-700 group-hover:opacity-100"></div>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>

                            {/* Animated Background Shapes */}
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 group-hover:scale-110 transition-transform duration-1000"></div>

                            <div className="relative z-10 p-12 md:p-24 text-center">
                                <h2 className="text-4xl md:text-6xl font-black uppercase text-white mb-8 leading-none">
                                    Готовы обсудить<br />ваш проект?
                                </h2>
                                <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12">
                                    Оставьте заявку на предварительный расчет. Мы подготовим коммерческое предложение с учетом геологии вашего участка.
                                </p>
                                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                                    <Link href="/contacts" className="w-full md:w-auto bg-white text-[#0F172A] px-10 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-2xl flex items-center justify-center gap-3">
                                        <Zap className="w-5 h-5 fill-current" />
                                        Рассчитать проект
                                    </Link>
                                    <button className="w-full md:w-auto px-10 py-5 rounded-xl font-bold uppercase tracking-widest text-white border border-white/30 hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                                        <Download className="w-5 h-5" />
                                        Скачать презентацию
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main >
    );
}

