import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchProjectById, Project, ProjectTech } from "@/lib/projects-data";
import { ArrowLeft, MapPin, Calendar, Layers, CheckCircle, Zap, ArrowUpRight, Share2, Download, Box, Activity } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";
import * as motion from "framer-motion/client";

// 1. Generate Static Params (Placeholder or can be updated to fetch all IDs)
export async function generateStaticParams() {
    return [];
}

// 3. Page Component
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params for Next.js 15+
    const { id } = await params;
    const project = await fetchProjectById(id);

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
                <div className="relative min-h-[85vh] flex flex-col justify-end pt-20 pb-24">
                    <motion.div
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/80 via-transparent to-transparent" />

                    {/* Back Link - Positioned Relative Top within Hero */}
                    <div className="absolute top-8 left-0 w-full z-20">
                        <div className="container mx-auto px-4">
                            <BackButton
                                href="/portfolio"
                                label="Все Проекты"
                                className="bg-black/40 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 hover:bg-black/60 mb-0 transition-all hover:scale-105 active:scale-95 shadow-2xl"
                            />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 relative">
                        <div className="max-w-4xl">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-4 mb-8"
                            >
                                <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-orange-600 text-white shadow-2xl shadow-orange-600/40`}>
                                    Case Study
                                </span>
                                <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-white/80">
                                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                    {project.location}
                                </span>
                                <span className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-white/80">
                                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                                    {project.year}
                                </span>
                            </motion.div>

                            <motion.h1
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-6xl md:text-8xl lg:text-9xl font-black uppercase text-white leading-[0.85] mb-10 tracking-tight drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            >
                                {project.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-2xl border-l-2 border-orange-600/50 pl-8"
                            >
                                {project.description}
                            </motion.p>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="container mx-auto px-4 -mt-20 relative z-20">

                    {/* Key Stats Grid - Premium Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                        {project.stats.map((stat, idx) => (
                            <div key={idx} className="relative group bg-[#0F172A]/50 backdrop-blur-2xl border border-white/5 p-8 rounded-[24px] shadow-2xl overflow-hidden hover:border-orange-500/40 transition-all duration-500">
                                {/* Ambient Background Glow */}
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-orange-600/5 blur-2xl rounded-full group-hover:bg-orange-600/20 transition-colors duration-500" />

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-orange-400 Transition-colors duration-300">
                                            {stat.label}
                                        </div>
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/20 group-hover:bg-orange-500/10 transition-all duration-300">
                                            <Zap className="w-4 h-4 text-white/20 group-hover:text-orange-500 transition-colors" />
                                        </div>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-black font-mono tracking-tight text-white group-hover:scale-105 transition-transform origin-left duration-300">
                                        {stat.value}
                                    </div>

                                    {/* Subtle Loading-style Bar */}
                                    <div className="mt-6 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 w-1/3 group-hover:w-full transition-all duration-1000 ease-in-out opacity-50 group-hover:opacity-100" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Challenge vs Solution - Premium Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-32">
                        {/* Challenge Card */}
                        <div className="relative group p-8 md:p-12 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent" />
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full group-hover:bg-red-600/10 transition-colors duration-700" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-all duration-500 group-hover:scale-110 shadow-lg shadow-red-500/5">
                                        <Layers className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Вызов</h2>
                                </div>
                                <div className="prose prose-invert prose-xl text-white/70 font-light leading-relaxed">
                                    <p>{project.challenge || "Уникальные геологические условия и сложность технического задания требовали нестандартного подхода и применения высокотехнологичного оборудования."}</p>
                                </div>
                            </div>
                        </div>

                        {/* Solution Card */}
                        <div className="relative group p-8 md:p-12 rounded-[32px] bg-gradient-to-br from-white/5 to-transparent border border-white/10 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent" />
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-600/5 blur-[100px] rounded-full group-hover:bg-emerald-600/10 transition-colors duration-700" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-500 group-hover:scale-110 shadow-lg shadow-emerald-500/5">
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <h2 className="text-4xl font-black uppercase tracking-tight">Решение</h2>
                                </div>
                                <div className="prose prose-invert prose-xl text-white/70 font-light leading-relaxed">
                                    <p>{project.solution}</p>
                                </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {(project.technologies?.length > 0 ? project.technologies : project.tags.map((t, i) => ({
                                id: `tag-${i}`,
                                name: t,
                                type: 'Метод',
                                description: 'Высокотехнологичное решение, примененное для обеспечения максимальной надежности проекта.'
                            } as ProjectTech))).map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 40, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className={`group relative rounded-[32px] overflow-hidden ${item.image ? 'min-h-[450px] shadow-2xl' : 'h-full'}`}
                                >
                                    {item.id ? (
                                        <Link href={`/machinery?id=${item.id}`} className="block h-full relative">
                                            {item.image && (
                                                /* Image Background */
                                                <div className="absolute inset-0 bg-[#0F172A]">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-contain object-bottom opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
                                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                </div>
                                            )}

                                            {/* Abstract Style for ID items without image */}
                                            {!item.image && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.01] transition-all duration-500" />
                                            )}

                                            {/* Content Overlay */}
                                            <div className="relative z-10 h-full flex flex-col justify-between p-8">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-400 text-[9px] font-black uppercase tracking-widest mb-3 inline-block">
                                                            {item.type}
                                                        </div>
                                                        <h4 className="text-2xl md:text-3xl font-black uppercase leading-tight tracking-tight drop-shadow-2xl break-words [hyphens:auto]">{item.name}</h4>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 backdrop-blur-xl border border-white/10 group-hover:shadow-[0_0_20px_rgba(234,88,12,0.5)]">
                                                        <ArrowUpRight className="w-6 h-6" />
                                                    </div>
                                                </div>

                                                <div className="mt-auto transform transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                    {item.description && (
                                                        <p className="text-sm text-white/60 mb-6 font-medium leading-relaxed group-hover:text-white/90 transition-colors">
                                                            {item.description}
                                                        </p>
                                                    )}

                                                    {/* Specs Display - Dashboard Style */}
                                                    {item.specs && item.specs.length > 0 && (
                                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                                                            {item.specs.map((spec, sIdx) => (
                                                                <div key={sIdx} className="group/spec">
                                                                    <div className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-1 group-hover/spec:text-orange-500/70 transition-colors">{spec.label}</div>
                                                                    <div className="text-base font-black text-white">{spec.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        /* Abstract Card for Methods */
                                        <div className="relative h-full p-10 flex flex-col bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 rounded-[32px] group-hover:border-orange-500/50 transition-all duration-500 overflow-hidden shadow-2xl">
                                            {/* Ambient Decoration */}
                                            <div className="absolute -right-16 -top-16 w-64 h-64 bg-orange-600/5 blur-[100px] rounded-full group-hover:bg-orange-600/15 transition-all duration-700" />
                                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                <ArrowUpRight className="w-8 h-8 text-orange-500" />
                                            </div>

                                            <div className="relative z-10 h-full flex flex-col">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 flex items-center justify-center border border-orange-500/20 mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-orange-600/10">
                                                    <Box className="w-8 h-8 text-orange-400" />
                                                </div>

                                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[9px] font-black uppercase tracking-widest mb-3 self-start group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all">
                                                    {item.type}
                                                </div>
                                                <h4 className="text-2xl md:text-3xl font-black uppercase mb-6 tracking-tight leading-tight break-words [hyphens:auto] group-hover:text-orange-50 group-hover:translate-x-1 transition-all">
                                                    {item.name}
                                                </h4>

                                                {item.description && (
                                                    <p className="text-base text-white/40 font-medium leading-relaxed group-hover:text-white/70 transition-colors mt-auto">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* Spacer to prevent margin collapse */}
                        <div className="h-48 md:h-64" />

                        {/* Final CTA - Premium Look */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative rounded-[48px] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-900 to-[#0F172A] opacity-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                            {/* Animated Background Shapes */}
                            <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] transform translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2" />

                            <div className="relative z-10 p-12 md:p-32 text-center">
                                <motion.h2
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl md:text-7xl lg:text-8xl font-black uppercase text-white mb-10 leading-[0.9] tracking-tighter"
                                >
                                    Готовы обсудить<br />ваш проект?
                                </motion.h2>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white/70 text-xl md:text-2xl max-w-3xl mx-auto mb-16 font-medium leading-relaxed"
                                >
                                    Оставьте заявку на предварительный расчет. Мы подготовим коммерческое предложение с учетом геологии вашего участка и спецификации оборудования.
                                </motion.p>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col md:flex-row items-center justify-center gap-8"
                                >
                                    <Link href="/contacts" className="group/btn w-full md:w-auto bg-white text-[#0F172A] px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-2xl flex items-center justify-center gap-4 hover:scale-105 active:scale-95">
                                        <Zap className="w-6 h-6 fill-orange-500 text-orange-500 group-hover/btn:animate-bounce" />
                                        Рассчитать проект
                                    </Link>
                                    <button className="w-full md:w-auto px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-white border border-white/20 hover:bg-white/10 transition-all flex items-center justify-center gap-4 backdrop-blur-xl hover:scale-105 active:scale-95">
                                        <Download className="w-6 h-6" />
                                        Презентация
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </main >
    );
}

