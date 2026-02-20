"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    FileSearch,
    FolderKanban,
    Settings,
    LogOut,
    ChevronLeft,
    Bell,
    Zap,
    User,
    Menu,
    X,
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Обзор", href: "/dashboard" },
    { icon: FileSearch, label: "Аудит ТЗ", href: "/dashboard/audit" },
    { icon: FolderKanban, label: "Мои проекты", href: "/dashboard/projects" },
    { icon: Settings, label: "Настройки", href: "/dashboard/settings" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [session, setSession] = useState<{ authenticated: boolean; token: string; company: string; email: string; level: string } | null>(null);

    useEffect(() => {
        const raw = localStorage.getItem("geotech_session");
        if (!raw) {
            router.push("/login");
            return;
        }
        try {
            const data = JSON.parse(raw);
            if (!data.authenticated || !data.token) {
                router.push("/login");
                return;
            }
            setSession(data);
        } catch {
            localStorage.removeItem("geotech_session");
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("geotech_session");
        router.push("/login");
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0E1A] text-white flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-40 bg-[#0D1117] border-r border-white/5 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center px-4 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 group overflow-hidden">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center rounded-lg shrink-0 shadow-lg shadow-orange-500/10">
                            <span className="text-white font-black text-lg">T</span>
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col whitespace-nowrap">
                                <span className="font-black text-sm leading-none tracking-tighter uppercase">
                                    Terra Expert
                                </span>
                                <span className="text-[9px] text-white/30 font-medium uppercase tracking-[0.15em]">
                                    Client Portal
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                    ${isActive
                                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                        : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-orange-500" : "text-white/30 group-hover:text-white/60"}`} />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse + Logout */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-all w-full"
                    >
                        <ChevronLeft className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                        {!collapsed && <span>Свернуть</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span>Выйти</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 h-full w-[260px] bg-[#0D1117] border-r border-white/5 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center rounded-lg">
                                    <span className="text-white font-black text-lg">T</span>
                                </div>
                                <span className="font-black text-sm uppercase tracking-tighter">Terra Expert</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)}>
                                <X className="w-5 h-5 text-white/40" />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                            ${isActive
                                                ? "bg-orange-500/10 text-orange-400"
                                                : "text-white/50 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all w-full mt-4"
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            <span>Выйти</span>
                        </button>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
                {/* Top Bar */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0A0E1A]/80 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setMobileOpen(true)}>
                            <Menu className="w-5 h-5 text-white/60" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-white/30 text-xs">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="font-mono uppercase tracking-wider">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
                            <Bell className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-500" />
                        </button>

                        {/* User */}
                        <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500/30 to-purple-500/30 flex items-center justify-center">
                                <User className="w-4 h-4 text-white/60" />
                            </div>
                            <div className="hidden md:block">
                                <div className="text-xs font-bold leading-none">{session.company || "Клиент"}</div>
                                <div className="text-[10px] text-white/30 font-mono">{session.level}</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
