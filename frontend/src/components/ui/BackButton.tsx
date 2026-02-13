"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
    href?: string;
    label?: string;
    className?: string;
}

export function BackButton({ href = "/", label = "На главную", className }: BackButtonProps) {
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-6 group",
                className
            )}
        >
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
            </div>
            {label}
        </Link>
    );
}
