"use client";

import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    service_relation?: {
        slug: string;
    };
}

interface ServiceFAQProps {
    serviceSlug?: string; // Optional: filter by service
}

export function ServiceFAQ({ serviceSlug }: ServiceFAQProps) {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFAQ() {
            try {
                // Query FAQ from Directus. If serviceSlug provided, filter by it.
                const CMS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8055';
                let url = `${CMS_URL}/items/faq?fields=id,question,answer,service_relation.slug`;
                if (serviceSlug) {
                    url += `&filter[service_relation][slug][_eq]=${serviceSlug}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error("Failed to fetch FAQ");
                const { data } = await res.json();
                setFaqs(data);
            } catch (err) {
                console.error("FAQ fetch error:", err);
                // Fallback for demo
                const demoData: FAQItem[] = [
                    {
                        id: "1",
                        question: "В каких регионах вы работаете?",
                        answer: "Мы работаем по всей территории РФ, включая труднодоступные районы Крайнего Севера и Дальнего Востока."
                    },
                    {
                        id: "2",
                        question: "Какое оборудование используется для вдавливания шпунта?",
                        answer: "Для статического вдавливания мы используем установки Giken Silent Piler F3 и F201, которые позволяют работать вплотную к существующим зданиям без вибрации."
                    },
                    {
                        id: "3",
                        question: "Как AI-Copilot рассчитывает смету?",
                        answer: "Наш алгоритм анализирует загруженное техзадание (чертежи, ведомости), сопоставляет его с актуальными ценами на шпунт из нашего каталога и подбирает оптимальный комплект техники."
                    }
                ];
                // If filtering by service, only show relevant or all if none matched
                setFaqs(demoData);
            } finally {
                setLoading(false);
            }
        }
        fetchFAQ();
    }, [serviceSlug]);

    if (loading) return <div className="h-40 w-full bg-white/5 animate-pulse rounded-xl" />;
    if (faqs.length === 0) return null;

    return (
        <section className="py-32 px-6 bg-[#09090b] relative overflow-hidden" id="faq">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #F97316 1px, transparent 0)', backgroundSize: '48px 48px' }} />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="mb-20 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center lg:justify-start gap-4 mb-6"
                    >
                        <div className="h-px w-10 bg-accent" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-accent">Knowledge Base</h2>
                    </motion.div>
                    <h3 className="text-5xl md:text-6xl font-black uppercase text-white tracking-widest font-outfit">
                        FAQ <span className="text-accent">/</span> Вопросы
                    </h3>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {faqs.map((item, index) => (
                            <AccordionItem
                                key={item.id}
                                value={item.id}
                                className="border-b border-white/5 last:border-0 px-4 transition-all hover:bg-white/[0.02] rounded-2xl"
                            >
                                <AccordionTrigger className="text-left font-black uppercase text-sm md:text-base tracking-widest py-8 text-white/80 hover:text-accent hover:no-underline transition-all">
                                    <span className="flex items-center gap-6">
                                        <span className="text-accent font-mono text-xs opacity-50">0{index + 1}</span>
                                        {item.question}
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-white/60 leading-relaxed pb-8 pl-12 font-medium">
                                    <div
                                        className="prose prose-invert max-w-none text-sm md:text-base"
                                        dangerouslySetInnerHTML={{ __html: item.answer }}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
