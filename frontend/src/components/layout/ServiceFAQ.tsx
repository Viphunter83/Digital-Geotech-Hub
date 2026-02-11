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
                let url = `${process.env.NEXT_PUBLIC_CMS_URL}/items/faq?fields=id,question,answer,service_relation.slug`;
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
        <section className="py-20 px-6 bg-white" id="faq">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-12">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-accent mb-4">FAQ</h2>
                    <h3 className="text-4xl font-black uppercase text-primary">База знаний и вопросы</h3>
                </div>

                <Accordion type="single" collapsible className="w-full border-t border-primary/10">
                    {faqs.map((item) => (
                        <AccordionItem key={item.id} value={item.id} className="border-b border-primary/10">
                            <AccordionTrigger className="text-left font-bold uppercase tracking-tight py-6 hover:text-accent transition-colors">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
