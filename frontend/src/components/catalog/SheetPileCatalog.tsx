"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ArrowRight, Download } from "lucide-react";
import { sheetPiles, sheetPileSeries } from "@/lib/sheet-pile-data";
import { Button } from "@/components/ui/button";
import { LeadMagnetModal } from "@/components/layout/LeadMagnetModal";

export function SheetPileCatalog() {
    const [activeSeries, setActiveSeries] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        let items = sheetPiles;

        if (activeSeries !== "all") {
            items = items.filter(item => item.series === activeSeries);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.model.toLowerCase().includes(query)
            );
        }

        return items;
    }, [activeSeries, searchQuery]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: "", subtitle: "", magnet: "" });

    const openModal = (title: string, subtitle: string, magnet: string) => {
        setModalConfig({ title, subtitle, magnet });
        setIsModalOpen(true);
    };

    return (
        <div className="w-full relative z-10" id="catalog">
            {/* ... keeping existing Buy-Back Info Banner ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-black uppercase text-blue-400 mb-4">Обратный выкуп (Buy-Back)</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-6 font-medium">
                        Мы предлагаем уникальную программу работы со шпунтом: вы покупаете материал, а после завершения работ мы выкупаем его обратно.
                        <br /><br />
                        <span className="text-white">Вы платите только за время использования и амортизацию.</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-blue-300">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> Экономия до 80%
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" /> без залога
                        </span>
                    </div>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-black uppercase text-orange-400 mb-4">Продажа и Аренда</h3>
                    <p className="text-sm text-white/70 leading-relaxed mb-6 font-medium">
                        В наличии на складе более 3000 тонн шпунта Ларсена различных марок (Л5-УМ, VL, AZ, AU, GU).
                        <br /><br />
                        <span className="text-white">Оперативная отгрузка в день оплаты. Сертификаты качества на всю продукцию.</span>
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-orange-300">
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Новые и Б/У
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full" /> Доставка по РФ
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {sheetPileSeries.map((series) => (
                        <button
                            key={series.id}
                            onClick={() => setActiveSeries(series.id)}
                            className={`
                                px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all backdrop-blur-sm
                                ${activeSeries === series.id
                                    ? "bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/30"}
                            `}
                        >
                            {series.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-64 group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-white/30 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Поиск по модели..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-white/20 backdrop-blur-sm"
                    />
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Модель</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Ширина (мм)</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Высота (мм)</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Толщина (мм)</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Масса (кг/м)</th>
                                <th className="p-6 text-[10px] uppercase tracking-widest text-white/50 font-black">Момент (см³/м)</th>
                                <th className="p-6 text-right text-[10px] uppercase tracking-widest text-white/50 font-black">Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredItems.map((item, idx) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-6 font-bold text-white group-hover:text-blue-400 transition-colors">{item.model}</td>
                                        <td className="p-6 text-white/70 font-mono">{item.width}</td>
                                        <td className="p-6 text-white/70 font-mono">{item.height}</td>
                                        <td className="p-6 text-white/70 font-mono">{item.thickness}</td>
                                        <td className="p-6 text-white/70 font-mono">{item.weight}</td>
                                        <td className="p-6 text-white/70 font-mono">{item.moment}</td>
                                        <td className="p-6 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openModal(`Цена: ${item.model}`, "Получить коммерческое предложение", `Price_Request_${item.model}`)}
                                                className="bg-transparent border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all whitespace-nowrap"
                                            >
                                                Узнать цену
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                {filteredItems.length === 0 && (
                    <div className="p-12 text-center text-white/30 text-sm uppercase tracking-widest">
                        Ничего не найдено
                    </div>
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => openModal("Скачать каталог", "Полный каталог шпунта с техническими характеристиками", "Catalog_Download_Full")}
                    className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-[#0F172A] hover:border-white gap-2 font-bold uppercase text-xs tracking-widest px-8 py-4 h-auto rounded-xl transition-all"
                >
                    <Download className="w-4 h-4" />
                    Скачать полный каталог (PDF)
                </Button>
            </div>

            <LeadMagnetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalConfig.title}
                subtitle={modalConfig.subtitle}
                magnetName={modalConfig.magnet}
            />
        </div>
    );
}
