import { motion } from "framer-motion";
import { MapPin, Drill, Calendar, Info, Tractor } from "lucide-react";
import Image from "next/image";

// Типизация данных из Directus
interface ProjectCase {
    id: string;
    title: string;
    location: string;
    soil_type: string;
    duration: string;
    description: string;
    image: string; // ID файла в Directus
    machinery: Array<{
        machinery_id: {
            name: string;
        };
    }>;
}

async function getPortfolioCases() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/cases?fields=*,machinery.machinery_id.name`, {
        next: { revalidate: 60 }, // ISR / Cache
    });

    if (!res.ok) {
        // Если коллекции еще нет, возвращаем пустой массив для демонстрации
        return [];
    }

    const { data } = await res.json();
    return data as ProjectCase[];
}

export default async function PortfolioPage() {
    const cases = await getPortfolioCases();

    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 px-6">
            <div className="container mx-auto">
                <header className="mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-500 text-xs font-bold uppercase tracking-widest mb-6">
                        <Info className="w-3 h-3" /> Proof of Work
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase mb-8 leading-tight">
                        Реализованные <span className="text-orange-500">кейсы</span>
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl font-medium border-l-4 border-orange-500 pl-6">
                        Проекты нулевого цикла любой сложности: от центра Москвы до удаленных регионов РФ. Технический брутализм в действии.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cases.length > 0 ? (
                        cases.map((project) => (
                            <div key={project.id} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-500">
                                {/* Изображение */}
                                <div className="aspect-[16/10] relative overflow-hidden">
                                    {project.image ? (
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${project.image}`}
                                            alt={project.title}
                                            fill
                                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                            <Tractor className="w-12 h-12 text-white/10" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent opacity-60" />
                                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-orange-500 px-3 py-1 text-[10px] font-black uppercase">
                                        <MapPin className="w-3 h-3" /> {project.location}
                                    </div>
                                </div>

                                {/* Контент */}
                                <div className="p-8">
                                    <h3 className="text-2xl font-black uppercase mb-4 group-hover:text-orange-500 transition-colors">
                                        {project.title}
                                    </h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex items-center gap-3 text-sm text-white/70">
                                            <Drill className="w-4 h-4 text-orange-500" />
                                            <span>Грунт: <span className="text-white font-bold">{project.soil_type}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-white/70">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            <span>Срок: <span className="text-white font-bold">{project.duration}</span></span>
                                        </div>
                                    </div>

                                    {/* Техника */}
                                    <div className="flex flex-wrap gap-2">
                                        {project.machinery?.map((m, idx) => (
                                            <span key={idx} className="text-[10px] bg-white/10 px-2 py-1 rounded-md font-mono text-white/50 group-hover:bg-orange-500/20 group-hover:text-orange-500 transition-colors">
                                                {m.machinery_id.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Placeholder cards for demo if no data
                        [1, 2, 3].map((i) => (
                            <div key={i} className="aspect-[16/20] bg-white/5 border border-dashed border-white/10 rounded-2xl flex items-center justify-center p-12 text-center opacity-50 grayscale">
                                <p className="font-mono text-xs uppercase tracking-tighter">Настройте коллекцию 'cases' в Directus для отображения кейсов</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
