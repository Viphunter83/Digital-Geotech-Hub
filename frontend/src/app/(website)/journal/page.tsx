"use client";

import { motion } from "framer-motion";
import { Search, Filter, ArrowRight, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EngineeringBackground } from "@/components/ui/EngineeringBackground";

import { ARTICLES } from "@/lib/journal-data";

const CATEGORIES = ["Все", "Технологии", "Инновации", "Геология", "Кейсы", "Оборудование"];

import { BackButton } from "@/components/ui/BackButton";

export default function JournalPage() {
    const [selectedCategory, setSelectedCategory] = useState("Все");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredArticles = ARTICLES.filter(article => {
        const matchesCategory = selectedCategory === "Все" || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col">
            <EngineeringBackground />
            <Navbar />

            <section className="pt-40 pb-20 px-6 relative z-10">
                <div className="container mx-auto">
                    {/* Header */}
                    <div className="max-w-4xl mb-20">
                        <BackButton href="/" label="На главную" />
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black font-outfit uppercase tracking-tighter text-white leading-none mb-10"
                        >
                            Geotech <span className="text-accent italic">Journal</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-white/60 font-medium leading-relaxed max-w-2xl"
                        >
                            Профессиональное издание о технологиях нулевого цикла, геологии и цифровой трансформации строительной отрасли.
                        </motion.p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-8 justify-between items-center mb-16 p-8 bg-white/[0.02] border border-white/5 rounded-[32px] backdrop-blur-xl">
                        {/* Categories */}
                        <div className="flex flex-wrap gap-3 justify-center">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${selectedCategory === cat
                                        ? "bg-accent text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                        : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Поиск по статьям..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-14 pr-8 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:bg-white/[0.08] transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article, index) => (
                                <motion.article
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
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
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-white/20 font-black uppercase tracking-[0.5em] text-xl">Ничего не найдено</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
