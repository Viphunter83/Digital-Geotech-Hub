"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/lib/projects-data";
import Image from "next/image";
import { MapPin, ArrowUpRight, Filter, Layers, Zap } from "lucide-react";
import Link from "next/link";
import { LeadMagnetModal } from "@/components/layout/LeadMagnetModal";

interface PortfolioClientProps {
    initialProjects: Project[];
}

export function PortfolioClient({ initialProjects }: PortfolioClientProps) {
    const [filterRegion, setFilterRegion] = useState<'all' | 'spb' | 'msk' | 'regions'>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | 'industrial' | 'civil' | 'infrastructure' | 'marine'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sort projects so "featured" ones or newer ones might come first (optional, currently just order)
    const filteredProjects = useMemo(() => {
        return initialProjects.filter(project => {
            const matchRegion = filterRegion === 'all' || project.region === filterRegion;
            const matchCategory = filterCategory === 'all' || project.category === filterCategory;
            return matchRegion && matchCategory;
        });
    }, [initialProjects, filterRegion, filterCategory]);

    return (
        <section className="relative z-10 mt-10">
            {/* Filter Bar */}
            <div className="sticky top-24 z-40 mb-12">
                <div className="container mx-auto px-4">
                    <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">

                        {/* Region Filter */}
                        <div className="flex bg-white/5 p-1 rounded-xl overflow-x-auto max-w-full">
                            {[
                                { id: 'all', label: 'Все регионы' },
                                { id: 'spb', label: 'Санкт-Петербург' },
                                { id: 'msk', label: 'Москва и МО' },
                                { id: 'regions', label: 'РФ' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setFilterRegion(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filterRegion === tab.id
                                        ? 'bg-orange-500 text-white shadow-lg'
                                        : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-[1px] bg-white/10 hidden md:block"></div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0">
                            {[
                                { id: 'all', label: 'Все типы' },
                                { id: 'industrial', label: 'Промышленные' },
                                { id: 'civil', label: 'Гражданские' },
                                { id: 'marine', label: 'Гидротехника' },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id as any)}
                                    className={`px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${filterCategory === cat.id
                                        ? 'bg-white text-[#0F172A] border-white'
                                        : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="container mx-auto px-4 mb-32">
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {filteredProjects.map((project, idx) => (
                            <ProjectCard key={project.id} project={project} index={idx} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-24">
                        <p className="text-white/30 text-xl font-light uppercase tracking-widest">Проектов не найдено</p>
                        <button
                            onClick={() => { setFilterRegion('all'); setFilterCategory('all'); }}
                            className="mt-4 text-orange-500 hover:text-orange-400 text-sm font-bold uppercase underline decoration-2 underline-offset-4"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 mb-24">
                <div className="relative rounded-[40px] overflow-hidden border border-white/10 bg-[#0F172A]">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-purple-600/20 mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

                    <div className="relative z-10 px-8 py-20 text-center">
                        <h3 className="text-4xl md:text-6xl font-black uppercase text-white mb-6">Готовы к масштабу?</h3>
                        <p className="text-white/60 max-w-2xl mx-auto mb-10 text-lg">
                            Мы берем на себя самые сложные задачи нулевого цикла. От идеи до реализации фундаментов любой сложности.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-orange-500 text-white px-10 py-5 rounded-xl font-black uppercase tracking-widest hover:bg-orange-400 transition-colors shadow-[0_0_30px_rgba(249,115,22,0.4)]"
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            Обсудить Проект
                        </button>
                    </div>
                </div>
            </div>

            <LeadMagnetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Обсудить проект"
                subtitle="Оставьте заявку, и мы подготовим предварительный расчет в течение 24 часов."
                magnetName="Project_Inquiry_Footer"
            />
        </section>
    );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`group relative rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 ${
                // Make every 4th item span 2 columns on desktop for variety
                (index % 4 === 0 || index % 4 === 3) ? 'md:col-span-2' : ''
                }`}
        >
            <Link href={`/portfolio/${project.id}`} className="block h-full w-full">
                {/* Image */}
                <div className="relative h-[400px] w-full overflow-hidden">
                    <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">
                                {project.location}
                            </span>
                            <span className="px-3 py-1 bg-orange-500/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider text-orange-400 border border-orange-500/20">
                                {project.year}
                            </span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black uppercase text-white mb-2 leading-none">
                            {project.title}
                        </h3>

                        <p className="text-white/60 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300 mb-6">
                            {project.description}
                        </p>

                        {/* Hidden Details revealed on hover */}
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                            {project.stats.slice(0, 2).map((stat, i) => (
                                <div key={i}>
                                    <div className="text-[10px] uppercase text-white/30 font-bold">{stat.label}</div>
                                    <div className="text-white font-mono font-bold">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-6 right-6">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-45 group-hover:bg-orange-500 group-hover:border-orange-500">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

