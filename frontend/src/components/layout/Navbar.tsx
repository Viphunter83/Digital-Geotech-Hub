"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSingleton } from "@/lib/directus-fetch";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [contact, setContact] = useState<{ phone: string } | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        fetchSingleton<{ phone: string }>('company_info', { fields: ['phone'] })
            .then(data => setContact(data));
    }, []);

    if (pathname?.startsWith('/dashboard') || pathname === '/login') return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg group-hover:bg-accent transition-colors">
                        <span className="text-white font-black text-xl">T</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-outfit font-black text-lg leading-none tracking-tighter uppercase text-white">Terra Expert</span>
                        <span className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em]">Engineering Group</span>
                    </div>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-10">
                    <NavLink href="/services">Услуги</NavLink>
                    <NavLink href="/machinery">Техника</NavLink>
                    <NavLink href="/portfolio">Проекты</NavLink>
                    <NavLink href="/#faq">FAQ</NavLink>
                    <NavLink href="/contacts">Контакты</NavLink>

                    <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                        <a href={`tel:${contact?.phone || '+79218844403'}`} className="flex flex-col items-end group">
                            <span className="text-xs font-bold text-white group-hover:text-orange-500 transition-colors">
                                {contact?.phone || '+7 (921) 884-44-03'}
                            </span>
                            <span className="text-[10px] text-white/40 uppercase tracking-wider">Отдел аренды</span>
                        </a>
                    </div>

                    <Link href="/login" className="bg-primary text-white px-6 py-2 rounded-md font-bold text-sm hover:bg-accent transition-all whitespace-nowrap">
                        Личный кабинет
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-primary/10 p-6 flex flex-col gap-4 shadow-2xl"
                >
                    <Link href="/services" className="font-bold py-2">Услуги</Link>
                    <Link href="/machinery" className="font-bold py-2">Техника</Link>
                    <Link href="/portfolio" className="font-bold py-2">Проекты</Link>
                    <Link href="/#faq" className="font-bold py-2" onClick={() => setIsOpen(false)}>FAQ</Link>
                    <Link href="/contacts" className="font-bold py-2">Контакты</Link>
                </motion.div>
            )}
        </nav>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm font-bold uppercase tracking-widest text-white/60 hover:text-white transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full" />
        </Link>
    );
}
