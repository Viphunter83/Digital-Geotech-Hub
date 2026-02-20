"use client";

import { motion } from "framer-motion";
import { EngineeringBackground } from "@/components/ui/EngineeringBackground";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { Phone, Mail, MapPin, Clock, Globe, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { fetchSingleton } from "@/lib/directus-fetch";

interface ContactItem {
    icon: any;
    label: string;
    value: string;
    link: string | null;
    color: string;
}

const contactInfoFallback: ContactItem[] = [
    {
        icon: Phone,
        label: "Телефон нашей линии",
        value: "+7 (921) 884-44-03",
        link: "tel:+79218844403",
        color: "text-orange-500"
    },
    {
        icon: Mail,
        label: "Почта для тендеров",
        value: "drilling.rigs.info@yandex.ru",
        link: "mailto:drilling.rigs.info@yandex.ru",
        color: "text-blue-500"
    },
    {
        icon: MapPin,
        label: "Главный офис",
        value: "Санкт-Петербург, тер. промзона Парнас",
        link: "#map",
        color: "text-red-500"
    },
    {
        icon: Clock,
        label: "Режим работы",
        value: "Пн-Пт: 09:00 - 20:00 (МСК)",
        link: null,
        color: "text-green-500"
    }
];

export default function ContactsPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [contactInfo, setContactInfo] = useState<ContactItem[]>(contactInfoFallback);

    useEffect(() => {
        work_hours: string;
        map_link: string | null;
        production_image: string | null;
    }> ('company_info', { fields: ['*', 'production_image'] }).then(data => {
        if (data) {
            setContactInfo([
                { icon: Phone, label: "Телефон нашей линии", value: data.phone, link: `tel:${data.phone.replace(/[\s()-]/g, '')}`, color: "text-orange-500" },
                { icon: Mail, label: "Почта для тендеров", value: data.email, link: `mailto:${data.email}`, color: "text-blue-500" },
                { icon: MapPin, label: "Главный офис", value: data.address, link: data.map_link ?? "#map", color: "text-red-500" },
                { icon: Clock, label: "Режим работы", value: data.work_hours, link: null, color: "text-green-500" },
            ]);
        }
    });
}, []);

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
    }, 1500);
};

return (
    <main className="min-h-screen text-white pt-32 pb-20 px-6 overflow-hidden relative">
        <EngineeringBackground />

        <div className="container mx-auto relative z-10">
            <SubPageHero
                title="Прямая"
                accentTitle="связь"
                description="Мы всегда открыты для новых проектов и технического консультирования. Свяжитесь с нашими инженерами удобным для вас способом."
                badgeText="HQ Communication Center"
                backLink="/"
                backLabel="На главную"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Left Column - Info & Cards */}
                <div className="lg:col-span-5 space-y-6">
                    {contactInfo.map((info, idx) => (
                        <motion.a
                            key={idx}
                            href={info.link || undefined}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="block p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl hover:bg-black/80 hover:border-orange-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:scale-110 transition-transform`}>
                                    <info.icon className={`w-6 h-6 ${info.color}`} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{info.label}</div>
                                    <div className="text-sm font-bold text-white group-hover:text-orange-500 transition-colors uppercase tracking-widest">{info.value}</div>
                                </div>
                            </div>
                        </motion.a>
                    ))}

                    <div className="p-10 bg-orange-500 rounded-3xl text-[#0F172A] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.05)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.05)_50%,rgba(0,0,0,0.05)_75%,transparent_75%,transparent)] bg-[size:15px_15px] opacity-20" />
                        <h4 className="text-xl font-black uppercase mb-4 relative z-10">WhatsApp / Telegram</h4>
                        <p className="text-sm font-bold uppercase tracking-widest mb-8 relative z-10 leading-tight">Присылайте ТЗ напрямую в мессенджеры для быстрого расчета</p>
                        <Button className="w-full bg-[#0F172A] text-white hover:bg-black rounded-2xl py-6 font-black uppercase tracking-widest text-[10px] relative z-10">
                            Открыть чат
                        </Button>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="lg:col-span-7">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[40px] p-12 relative overflow-hidden"
                    >
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-20"
                            >
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-3xl font-black uppercase mb-4">Заявка принята</h3>
                                <p className="text-white/40 font-bold uppercase tracking-widest text-sm max-w-sm mx-auto">Наши инженеры свяжутся с вами в ближайшее время для обсуждения деталей проекта.</p>
                                <Button onClick={() => setSubmitted(false)} variant="link" className="mt-10 text-orange-500 uppercase font-black text-[10px] tracking-[0.3em]">
                                    Отправить еще раз
                                </Button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="relative z-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight">Отправить запрос</h3>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Мы ответим в течение 15 минут</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Ваше имя</label>
                                        <Input
                                            placeholder="ИВАН ИВАНОВ"
                                            required
                                            className="bg-white/5 border-white/10 h-16 rounded-2xl focus:border-orange-500/50 text-sm font-bold uppercase tracking-widest px-6"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Телефон</label>
                                        <Input
                                            placeholder="+7 (___) ___-__-__"
                                            type="tel"
                                            required
                                            className="bg-white/5 border-white/10 h-16 rounded-2xl focus:border-orange-500/50 text-sm font-bold uppercase tracking-widest px-6"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 mb-10">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-white/20 ml-2">Суть проекта / Сообщение</label>
                                    <textarea
                                        placeholder="ОПИШИТЕ ВАШ ЗАДАЧУ (ШПУНТ, СВАИ, КОТЛОВАН)"
                                        required
                                        className="w-full min-h-[160px] bg-white/5 border border-white/10 rounded-2xl focus:border-orange-500/50 text-sm font-bold uppercase tracking-widest px-6 py-4 outline-none transition-all placeholder:text-white/10"
                                    />
                                </div>

                                <Button
                                    disabled={isSubmitting}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-[#0F172A] h-20 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-orange-500/20 group"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-3">
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                                <Send className="w-5 h-5" />
                                            </motion.div>
                                            ОТПРАВКА...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            ОТПРАВИТЬ ЗАПРОС
                                            <Send className="w-5 h-5 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                                        </span>
                                    )}
                                </Button>

                                <p className="text-[9px] text-white/60 text-center mt-6 font-bold uppercase tracking-widest leading-relaxed">
                                    Нажимая кнопку, вы соглашаетесь с <a href="/privacy" className="underline hover:text-orange-500 transition-colors">политикой конфиденциальности</a> <br />
                                    и обработкой персональных данных согласно стандартам ФЗ-152
                                </p>
                            </form>
                        )}

                        {/* Decorative Grid */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_100%_0%,#F97316_0,transparent_70%)] opacity-10 pointer-events-none" />
                    </motion.div>
                </div>
            </div>

            <div id="map" className="mt-32 rounded-[40px] overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl aspect-[21/9] relative group">
                <img
                    src={contactInfo.length > 0 && (contactInfo as any).production_image
                        ? `${process.env.NEXT_PUBLIC_CMS_URL}/assets/${(contactInfo as any).production_image}`
                        : "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=2000"}
                    alt="Location Map"
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/40">
                        <MapPin className="w-8 h-8 text-[#0F172A]" />
                    </div>
                    <h4 className="text-3xl font-black uppercase mb-2">Наше производство</h4>
                    <p className="text-sm font-bold uppercase tracking-widest text-white/40">Санкт-Петербург, тер. промзона Парнас, 2-й Верхний переулок</p>
                    <Button asChild variant="outline" className="mt-8 bg-white/5 border-white/10 hover:bg-orange-500 hover:text-[#0F172A] rounded-xl px-10">
                        <a
                            href="https://yandex.ru/maps/?text=60.062108,30.375741"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Открыть в Навигаторе
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    </main>
);
}
