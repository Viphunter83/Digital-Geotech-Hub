"use client";

import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import { fetchSingleton } from "@/lib/directus-fetch";

interface CompanyInfo {
    phone: string;
    email: string;
    address: string;
}

export function Footer() {
    const [info, setInfo] = useState<CompanyInfo | null>(null);

    useEffect(() => {
        fetchSingleton<CompanyInfo>('company_info', {
            fields: ['phone', 'email', 'address']
        }).then(data => setInfo(data));
    }, []);

    return (
        <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/10 py-32 px-6 relative z-10">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-12 h-12 relative overflow-hidden rounded-lg">
                                <Image
                                    src="/logo.png"
                                    alt="Terra Expert"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <span className="font-outfit font-black text-lg leading-none tracking-tighter uppercase text-white">Terra Expert</span>
                        </Link>
                        <p className="text-sm text-white/40 leading-relaxed">
                            15+ лет лидерства в области шпунтовых работ и фундаментостроения. Свой парк современной техники для проектов любой сложности по всей России.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6 text-white">Навигация</h5>
                        <ul className="space-y-4">
                            <FooterLink href="/services">Услуги</FooterLink>
                            <FooterLink href="/machinery">Каталог техники</FooterLink>
                            <FooterLink href="/portfolio">Портфолио</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6 text-white">Компания</h5>
                        <ul className="space-y-4">
                            <FooterLink href="/about">О компании</FooterLink>
                            <FooterLink href="/contacts">Контакты</FooterLink>
                            <FooterLink href="/careers">Карьера</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6 text-white">Контакты</h5>
                        <div className="text-sm text-white/40 space-y-2">
                            <p>{info?.address || 'Санкт-Петербург, тер. промзона Парнас'}</p>
                            <p className="font-bold text-accent">{info?.phone || '+7 (921) 884-44-03'}</p>
                            <p>{info?.email || 'drilling.rigs.info@yandex.ru'}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">
                        © 2026 Terra Expert. Все права защищены.
                    </p>
                    <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest">
                        <Link href="/privacy" className="text-white/40 hover:text-accent">Privacy Policy</Link>
                        <Link href="/terms" className="text-white/40 hover:text-accent">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-white/40 hover:text-accent transition-colors">
                {children}
            </Link>
        </li>
    );
}
