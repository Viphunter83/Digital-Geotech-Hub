"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";
import { ARTICLES } from "@/lib/journal-data";

export function JournalPreview() {
    // Only show latest 3 for preview
    const previewArticles = ARTICLES.slice(0, 3);

    return (
        <section className="py-32 px-6 bg-[#09090b] relative overflow-hidden">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-4 mb-6"
                        >
                            <div className="h-px w-12 bg-accent" />
                            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-accent">Geotech Journal</h2>
                        </motion.div>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-5xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white leading-none"
                        >
                            База знаний <span className="text-accent italic">&</span><br />экспертные статьи
                        </motion.h3>
                    </div>
                    <Link href="/journal">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-10 py-4 bg-white/[0.03] border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px] text-white overflow-hidden transition-all hover:bg-white hover:text-black hover:border-white"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Все материалы <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </motion.button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {previewArticles.map((article, index) => (
                        <motion.article
                            key={article.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className="group flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden hover:border-accent/40 transition-all duration-500"
                        >
                            <Link href={`/journal/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="w-full h-full object-cover grayscale opacity-50 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                                />
                                <div className="absolute top-6 left-6 px-4 py-1.5 bg-accent/20 border border-accent/40 backdrop-blur-md rounded-full">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-accent">
                                        {article.category}
                                    </span>
                                </div>
                            </Link>

                            <div className="p-10 flex flex-col flex-grow">
                                <div className="flex items-center gap-6 mb-6 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-2"><Clock className="w-3 h-3 text-accent" /> {article.readTime}</span>
                                    <span className="flex items-center gap-2"><User className="w-3 h-3 text-accent" /> {article.author}</span>
                                </div>
                                <h4 className="text-2xl font-black mb-6 uppercase tracking-tighter text-white group-hover:text-accent transition-colors duration-500 leading-tight">
                                    <Link href={`/journal/${article.slug}`}>
                                        {article.title}
                                    </Link>
                                </h4>
                                <p className="text-white/40 text-sm leading-relaxed font-medium mb-10 flex-grow">
                                    {article.excerpt}
                                </p>
                                <Link
                                    href={`/journal/${article.slug}`}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent group/link hover:text-white transition-colors"
                                >
                                    Читать полностью <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-1" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
