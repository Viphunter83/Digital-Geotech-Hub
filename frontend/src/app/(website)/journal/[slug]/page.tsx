"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Clock, User, Calendar, Share2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EngineeringBackground } from "@/components/ui/EngineeringBackground";
import { BackButton } from "@/components/ui/BackButton";
import { fetchArticleBySlug, fetchArticles, type Article } from "@/lib/journal-data";

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [article, setArticle] = useState<Article | null>(null);
    const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            const [art, allArticles] = await Promise.all([
                fetchArticleBySlug(slug),
                fetchArticles({ limit: 10 }),
            ]);

            setArticle(art);
            if (art) {
                setRelatedArticles(
                    allArticles.filter(a => a.id !== art.id).slice(0, 2)
                );
            }
            setLoading(false);
        }
        loadData();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#09090b] flex flex-col">
                <EngineeringBackground />
                <Navbar />
                <div className="pt-40 pb-32 px-6 relative z-10">
                    <div className="container mx-auto">
                        <div className="h-12 w-64 bg-white/5 animate-pulse rounded-xl mb-10" />
                        <div className="h-20 w-full max-w-2xl bg-white/5 animate-pulse rounded-xl mb-10" />
                        <div className="aspect-video bg-white/5 animate-pulse rounded-[32px] mb-16" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-6 bg-white/5 animate-pulse rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    if (!article) {
        return notFound();
    }

    return (
        <main className="min-h-screen bg-[#09090b] flex flex-col">
            <EngineeringBackground />
            <Navbar />

            <article className="pt-40 pb-32 px-6 relative z-10">
                <div className="container mx-auto">

                    {/* Back Button & Breadcrumbs */}
                    <div className="mb-12">
                        <BackButton href="/journal" label="Все статьи" className="mb-8" />

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4"
                        >
                            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Главная</Link>
                            <ChevronRight className="w-3 h-3 text-white/20" />
                            <Link href="/journal" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Journal</Link>
                            <ChevronRight className="w-3 h-3 text-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent truncate max-w-[200px]">{article.title}</span>
                        </motion.div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16 item-start">
                        {/* Main Content */}
                        <div className="lg:w-2/3">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block px-4 py-1.5 bg-accent/20 border border-accent/40 rounded-full text-[10px] font-black uppercase tracking-widest text-accent mb-8">
                                    {article.category}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black font-outfit uppercase tracking-tighter text-white leading-tight mb-10">
                                    {article.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-8 mb-16 p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" /> {article.date}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {article.readTime} ЧТЕНИЯ</div>
                                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-accent" /> АВТОР: {article.author}</div>
                                    <div className="ml-auto flex items-center gap-4">
                                        <button className="hover:text-accent transition-colors"><Share2 className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="relative aspect-video rounded-[32px] overflow-hidden mb-16 border border-white/10">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div
                                    className="prose prose-invert prose-orange max-w-none 
                                    text-white/80
                                    prose-h2:text-4xl prose-h2:font-black prose-h2:uppercase prose-h2:tracking-tighter prose-h2:mt-12 prose-h2:mb-8 prose-h2:text-white
                                    prose-h3:text-2xl prose-h3:font-black prose-h3:uppercase prose-h3:tracking-tight prose-h3:mt-8 prose-h3:mb-6 prose-h3:text-white
                                    prose-p:text-lg prose-p:text-white/70 prose-p:leading-relaxed prose-p:mb-8
                                    prose-li:text-white/70 prose-li:text-lg prose-li:mb-4
                                    prose-strong:text-white prose-strong:font-black
                                    prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-white/90"
                                    dangerouslySetInnerHTML={{ __html: article.content || "" }}
                                />

                                <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center">
                                    <Link
                                        href="/journal"
                                        className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
                                    >
                                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                                        Назад в журнал
                                    </Link>
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-all"><Share2 className="w-4 h-4" /></div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <aside className="lg:w-1/3 mt-20 lg:mt-0 space-y-12">
                            <div className="sticky top-40 space-y-12">
                                {/* Related Articles */}
                                <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[32px] backdrop-blur-xl">
                                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-10">Читайте также</h4>
                                    <div className="space-y-10">
                                        {relatedArticles.map(rel => (
                                            <Link key={rel.id} href={`/journal/${rel.slug}`} className="group block">
                                                <span className="inline-block px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-[8px] font-black uppercase tracking-widest text-accent mb-4">
                                                    {rel.category}
                                                </span>
                                                <h5 className="text-xl font-black uppercase tracking-tighter text-white group-hover:text-accent transition-colors duration-300 mb-4 leading-tight">
                                                    {rel.title}
                                                </h5>
                                                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-white/20">
                                                    <span>{rel.date}</span>
                                                    <span className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span>{rel.readTime}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                    <Link href="/journal" className="mt-12 block py-4 text-center border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/60 hover:bg-white hover:text-black transition-all">
                                        Все статьи
                                    </Link>
                                </div>

                                {/* Newsletter / Lead Magnet */}
                                <div className="p-10 bg-accent rounded-[32px] text-white shadow-[0_30px_60px_-15px_rgba(249,115,22,0.3)]">
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-none">Геотехнический дайджест</h4>
                                    <p className="text-sm font-medium text-white/80 mb-8 leading-relaxed">
                                        Подпишитесь на ежемесячный обзор инженерных инноваций и изменений в ГОСТ.
                                    </p>
                                    <div className="space-y-4">
                                        <input
                                            type="email"
                                            placeholder="Ваш Email"
                                            className="w-full bg-black/10 border border-white/20 rounded-xl py-4 px-6 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-all"
                                        />
                                        <button className="w-full py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl">
                                            Подписаться
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}
