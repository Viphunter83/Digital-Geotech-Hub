"use client";

import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-white border-t border-primary/5 py-20 px-6">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg">
                                <span className="text-white font-black text-lg">G</span>
                            </div>
                            <span className="font-outfit font-black text-lg leading-none tracking-tighter uppercase">Geotech Hub</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Лидер в области шпунтовых работ и фундаментостроения на Северо-Западе. Инновационный подход к тяжелой технике.
                        </p>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6">Навигация</h5>
                        <ul className="space-y-4">
                            <FooterLink href="/services">Услуги</FooterLink>
                            <FooterLink href="/machinery">Каталог техники</FooterLink>
                            <FooterLink href="/cases">Портфолио</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6">Компания</h5>
                        <ul className="space-y-4">
                            <FooterLink href="/about">О компании</FooterLink>
                            <FooterLink href="/contacts">Контакты</FooterLink>
                            <FooterLink href="/careers">Карьера</FooterLink>
                        </ul>
                    </div>

                    <div>
                        <h5 className="font-black uppercase text-xs tracking-widest mb-6">Контакты</h5>
                        <div className="text-sm text-muted-foreground space-y-2">
                            <p>Санкт-Петербург, ул. Строителей, 10</p>
                            <p className="font-bold text-primary">+7 (812) 555-01-26</p>
                            <p>info@geotech-hub.ru</p>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        © 2026 Digital Geotech Hub. Все права защищены.
                    </p>
                    <div className="flex gap-6 text-[10px] uppercase font-bold tracking-widest">
                        <Link href="/privacy" className="hover:text-accent">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-accent">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {children}
            </Link>
        </li>
    );
}
