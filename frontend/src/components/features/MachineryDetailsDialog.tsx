"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Machinery } from "@/lib/machinery-data";
import { X, ArrowRight, CheckCircle2, Ruler, Zap, Weight, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface MachineryDetailsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    machinery: Machinery | null;
    onRentRequest: (machineryName: string) => void;
}

export function MachineryDetailsDialog({ isOpen, onClose, machinery, onRentRequest }: MachineryDetailsDialogProps) {
    if (!machinery) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="max-w-6xl 2xl:max-w-7xl bg-[#0F172A] border-white/10 p-0 overflow-hidden text-white rounded-[40px]">
                <DialogTitle className="sr-only">{machinery.name}</DialogTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
                    {/* Left Side: Image & Technical Blueprint */}
                    <div className="relative bg-[#0b101e] p-6 xl:p-8 2xl:p-12 flex flex-col justify-between min-h-[300px] lg:h-full lg:overflow-y-auto custom-scrollbar">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-px bg-orange-500/30" />
                            <div className="absolute top-0 left-0 w-px h-full bg-orange-500/30" />
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.1]" />
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black uppercase tracking-widest mb-4">
                                {machinery.categoryLabel}
                            </span>
                            <h2 className="text-3xl lg:text-5xl font-black uppercase leading-none mb-2">
                                {machinery.name}
                            </h2>
                            <p className="text-white/30 font-mono text-xs uppercase tracking-widest">
                                UNIT_ID: #{String(machinery.id).toUpperCase()}
                            </p>
                        </div>

                        <div className="relative flex-1 flex items-center justify-center py-6 min-h-[200px]">
                            <div className="absolute inset-0 bg-orange-500/5 blur-[100px] rounded-full" />
                            <img
                                src={machinery.image}
                                alt={machinery.name}
                                className="relative z-10 w-full max-h-[300px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                            />
                        </div>

                        <div className="relative z-10 hidden xl:flex flex-col gap-3 w-full mt-auto">
                            {machinery.specs.slice(0, 3).map((spec, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between w-full h-auto gap-4 shrink-0 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3 opacity-80">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                                            <spec.icon className="w-4 h-4 text-orange-500" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest leading-tight">{spec.label}</span>
                                    </div>
                                    <div className="text-base font-bold font-mono text-white text-right shrink-0">{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Description & Actions */}
                    <div className="p-6 lg:p-12 bg-[#0F172A] flex flex-col lg:h-full lg:overflow-y-auto w-full relative">
                        <div className="flex-1">
                            <div className="mb-8">
                                <h3 className="text-xl font-black uppercase text-white mb-6 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                        <Settings className="w-4 h-4 text-orange-500" />
                                    </span>
                                    Описание техники
                                </h3>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-white/70 text-sm leading-relaxed font-medium">
                                        {machinery.description}
                                    </p>
                                </div>
                            </div>

                            {/* Full Specs List */}
                            <div className="mb-10">
                                <h4 className="text-xs font-black uppercase text-white/40 tracking-widest mb-4 border-b border-white/10 pb-2">
                                    Технические характеристики
                                </h4>
                                <div className="space-y-4">
                                    {machinery.specs.map((spec, idx) => (
                                        <div key={idx} className="flex items-center justify-between group gap-4">
                                            <div className="flex items-center gap-3 text-white/60 group-hover:text-white transition-colors flex-1 min-w-0">
                                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                                                    <spec.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-wide leading-tight truncate">{spec.label}</span>
                                            </div>
                                            <div className="h-px flex-1 bg-white/10 hidden sm:block mx-2" />
                                            <span className="text-sm font-mono font-bold text-orange-500 whitespace-nowrap text-right shrink-0">{spec.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Related Services */}
                            {machinery.relatedServiceIds && machinery.relatedServiceIds.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-xs font-black uppercase text-white/40 tracking-widest mb-4">
                                        Применяется в работах
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {machinery.relatedServiceIds.map((srv, i) => (
                                            <span key={i} className="px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider">
                                                {srv}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* CTA Button pinned to bottom */}
                        <div className="mt-8 pt-4 border-t border-white/10 sticky bottom-0 bg-[#0F172A] pb-0 z-30">
                            <Button
                                onClick={() => {
                                    onClose();
                                    onRentRequest(machinery.name);
                                }}
                                className="relative w-full h-12 lg:h-14 bg-orange-500 hover:bg-orange-600 text-[#0F172A] text-xs lg:text-sm font-black uppercase tracking-wide rounded-lg lg:rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.2)] flex items-center justify-center gap-2 lg:gap-3 transition-all"
                            >
                                <span className="whitespace-normal text-center leading-tight">Рассчитать смену</span>
                                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 shrink-0 hidden sm:block" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
