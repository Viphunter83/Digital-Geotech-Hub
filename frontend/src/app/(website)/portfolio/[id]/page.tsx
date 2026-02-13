import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PROJECTS, Project } from "@/lib/projects-data";
import { ArrowLeft, MapPin, Calendar, Layers, CheckCircle, Zap, ArrowUpRight, Share2, Download } from "lucide-react";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { motion } from "framer-motion";

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
                            <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/30">
                                <ArrowLeft className="w-4 h-4" />
                                Все Проекты
                            </Link>
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
                    <div className="mb-32">
                        <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                            <div>
                                <h3 className="text-4xl font-black uppercase text-white mb-2">Технологии</h3>
                                <p className="text-white/50">Примененные решения и оборудование</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Combine Tags with Rich Mock Data */}
                            {[
                                ...project.tags.map(t => ({
                                    name: t,
                                    type: 'Метод',
                                    image: null
                                })),
                                ...((project.id === 'lakhta-2' ? [
                                    {
                                        name: 'Giken Silent Piler F201',
                                        type: 'Статическое вдавливание',
                                        image: '/assets/static_piling_expert.png',
                                        specs: [
                                            { label: 'Усилие', value: '150 тс' },
                                            { label: 'Шум', value: '< 65 дБ' }
                                        ]
                                    },
                                    {
                                        name: 'Liebherr LR 1100',
                                        type: 'Крановая техника',
                                        image: '/assets/machinery-wireframe-3d.png',
                                        specs: [
                                            { label: 'Г/П', value: '100 т' },
                                            { label: 'Стрела', value: '52 м' }
                                        ]
                                    }
                                ] :
                                    project.id === 'moscow-city' ? [
                                        {
                                            name: 'Bauer BG 45',
                                            type: 'Буровая установка',
                                            image: '/assets/machinery-bauer.png',
                                            specs: [
                                                { label: 'Момент', value: '461 кНм' },
                                                { label: 'Глубина', value: '100 м' }
                                            ]
                                        },
                                        {
                                            name: 'Casagrande B300',
                                            type: 'Сваебойная установка',
                                            image: '/assets/machinery-casagrande.png',
                                            specs: [
                                                { label: 'Мощность', value: '315 кВт' },
                                                { label: 'Вес', value: '96 т' }
                                            ]
                                        }
                                    ] :
                                        project.id === 'ust-luga' ? [
                                            {
                                                name: 'PVE 52M',
                                                type: 'Вибропогружатель',
                                                image: '/assets/machinery-movax.png', // Fallback visual
                                                specs: [
                                                    { label: 'Усилие', value: '2300 кН' },
                                                    { label: 'Частота', value: '2300 об/мин' }
                                                ]
                                            }
                                        ] :
                                            [{ name: 'Liebherr LR 1300', type: 'Крановая техника', image: '/assets/machinery-wireframe-3d.png', specs: [{ label: 'Г/П', value: '300 т' }] }]
                                ))
                            ].map((item, i) => (
                                <div key={i} className={`group relative rounded-2xl overflow-hidden shadow-2xl ${item.image ? 'md:col-span-1 lg:col-span-1 min-h-[350px]' : 'bg-white/5 p-6 border border-white/10 hover:bg-white/10'}`}>
                                    {item.image ? (
                                        <>
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

                                            {/* Content Overlay */}
                                            <div className="relative z-10 h-full flex flex-col justify-between p-6 border border-white/10 rounded-2xl bg-gradient-to-b from-white/5 to-transparent hover:border-orange-500/50 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-1 shadow-black drop-shadow-md">{item.type}</div>
                                                        <div className="text-2xl font-black uppercase leading-none drop-shadow-xl">{item.name}</div>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center -mr-2 -mt-2 group-hover:bg-orange-500 transition-colors backdrop-blur-md">
                                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                                    </div>
                                                </div>

                                                {/* Specs Grid if available */}
                                                {item.specs && (
                                                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 bg-[#0F172A]/60 backdrop-blur-md rounded-xl p-3">
                                                        {item.specs.map((spec, sIdx) => (
                                                            <div key={sIdx}>
                                                                <div className="text-[9px] text-white/50 uppercase font-bold tracking-wider">{spec.label}</div>
                                                                <div className="text-sm font-mono text-white font-bold">{spec.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Simple Card for Methods */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                                    <Zap className="w-5 h-5 text-orange-500" />
                                                </div>
                                            </div>
                                            <div className="font-bold text-lg mb-1">{item.name}</div>
                                            <div className="text-xs text-white/40 font-bold uppercase tracking-wider">{item.type}</div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Final CTA */}
                    <div className="relative rounded-[40px] overflow-hidden border border-white/10">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-purple-900 opacity-90"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay"></div>

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
        </main>
    );
}

