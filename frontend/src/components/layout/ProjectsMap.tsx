"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #F97316; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(249, 115, 22, 0.5);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

const geoIcon = L.divIcon({
    className: 'geo-div-icon',
    html: `<div style="background-color: #0EA5E9; width: 10px; height: 10px; border: 2px solid white; transform: rotate(45deg); box-shadow: 0 0 8px rgba(14, 165, 233, 0.5);"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
});

interface MapProject {
    id: string;
    title: string;
    location: string;
    description: string;
    latitude: number;
    longitude: number;
    category?: string;
}

interface GeologyPoint {
    id: string;
    title: string;
    depth: string;
    soil_layers: string[];
    water_level: string;
    latitude: number;
    longitude: number;
}

const REFERENCE_PROJECTS: MapProject[] = [
    { id: 'ref-1', title: 'МФК «Лахта Центр 2»', location: 'Санкт-Петербург', description: 'Статическое вдавливание шпунта 24м. Оборудование Giken.', latitude: 59.98, longitude: 30.17 },
    { id: 'ref-2', title: 'ЖК в Москва-Сити', location: 'Москва', description: 'Буросекущие сваи 28м. Установки Bauer BG.', latitude: 55.75, longitude: 37.54 },
    { id: 'ref-3', title: 'Терминал ЛПГ', location: 'Усть-Луга', description: 'Трубчатый шпунт с вибропогружением.', latitude: 59.68, longitude: 28.42 },
    { id: 'ref-4', title: 'Эко-Технопарк', location: 'Казань', description: 'Лидерное бурение и погружение ЖБ свай.', latitude: 55.79, longitude: 49.12 },
    { id: 'ref-5', title: 'Порт Тамань', location: 'Краснодарский край', description: 'Ограждение причала из шпунта Ларсена.', latitude: 45.13, longitude: 36.68 }
];

const GEOLOGY_POINTS: GeologyPoint[] = [
    { id: 'geo-1', title: 'Скважина №42 (СПб)', depth: '45.0 м', soil_layers: ['0-8м: Техногенный грунт', '8-22м: Ленточные глины', '22-45м: Моренные суглинки'], water_level: '-1.5 м', latitude: 59.94, longitude: 30.32 },
    { id: 'geo-2', title: 'Скважина №108 (МСК)', depth: '32.0 м', soil_layers: ['0-4м: Насыпь', '4-15м: Пески мелкие', '15-32м: Тяжелые глины'], water_level: '-8.0 м', latitude: 55.74, longitude: 37.59 },
    { id: 'geo-3', title: 'Скважина №15 (Усть-Луга)', depth: '28.0 м', soil_layers: ['0-6м: Пески пылеватые', '6-28м: Глины плотные'], water_level: '-0.5 м', latitude: 59.70, longitude: 28.40 }
];

const GEO_REGIONS = [
    { id: 'spb-zone', name: 'Балтийский щит (край)', soil: 'Водонасыщенные глины', color: '#F97316', lat: 59.93, lng: 30.33, r: 50000 },
    { id: 'msk-zone', name: 'Московская синеклиза', soil: 'Карстовые опасности', color: '#0EA5E9', lat: 55.75, lng: 37.61, r: 60000 }
];

interface ProjectMapProps {
    region: 'msk' | 'spb';
}

export default function ProjectsMap({ region }: ProjectMapProps) {
    const [projects, setProjects] = useState<MapProject[]>(REFERENCE_PROJECTS);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState<'projects' | 'geology'>('projects');

    const defaultCenter: [number, number] = region === 'msk' ? [55.75, 37.6] : [59.93, 30.3];
    const defaultZoom = 11;

    useEffect(() => {
        async function fetchPoints() {
            try {
                const CMS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8055';
                const res = await fetch(`${CMS_URL}/items/cases?fields=id,title,geo_location,latitude,longitude`);
                if (res.ok) {
                    const { data } = await res.json();
                    if (data && data.length > 0) {
                        const mappedData = data.map((item: any) => ({
                            ...item,
                            location: item.geo_location || 'Объект',
                            description: 'Информация из базы данных.'
                        })).filter((p: any) => p.latitude && p.longitude);

                        // Merge with reference projects avoiding duplicates
                        setProjects([...REFERENCE_PROJECTS, ...mappedData]);
                    }
                }
            } catch (err) {
                console.error('Map fetch failed, using fallback.');
            } finally {
                setLoading(false);
            }
        }
        fetchPoints();
    }, []);

    if (loading) return <div className="h-[600px] w-full bg-[#0F172A] animate-pulse rounded-2xl flex items-center justify-center text-white/20 font-black uppercase tracking-widest text-xl">Loading Digital Soil...</div>;

    return (
        <section className="py-24 px-6 bg-transparent" id="map">
            <div className="container mx-auto">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 mb-16">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="h-[2px] w-12 bg-orange-500"></span>
                            <h2 className="text-sm font-bold uppercase tracking-[0.5em] text-orange-500">Geotechnical Intelligence Layer</h2>
                        </div>
                        <h3 className="text-5xl lg:text-7xl font-black uppercase text-white leading-[0.9] tracking-tighter">
                            {activeLayer === 'projects' ? 'Центры\nКомпетенций' : 'Карта\nГрунтов'}
                        </h3>
                    </div>

                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shrink-0">
                        <button
                            onClick={() => setActiveLayer('projects')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeLayer === 'projects' ? 'bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.4)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Реализованные проекты
                        </button>
                        <button
                            onClick={() => setActiveLayer('geology')}
                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${activeLayer === 'geology' ? 'bg-sky-500 text-white shadow-[0_0_30px_rgba(14,165,233,0.4)]' : 'text-white/40 hover:text-white'}`}
                        >
                            Геология v2.1
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Map Sidebar/Legend */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Легенда карты</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Объекты в работе</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 bg-sky-500 transform rotate-45 shadow-[0_0_10px_rgba(14,165,233,0.5)]" />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Архивные скважины</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full border border-sky-500/50 bg-sky-500/10" />
                                    <span className="text-[11px] font-bold text-white uppercase tracking-wider">Зоны риска</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 border-dashed">
                            <p className="text-[10px] text-white/40 leading-relaxed uppercase font-mono">
                                <span className="text-orange-500 font-bold">INFO:</span> Карта в режиме реального времени отображает текущие проекты и геологические изыскания из базы Directus CMS.
                            </p>
                        </div>
                    </div>

                    {/* Main Map Area */}
                    <div className="lg:col-span-3 h-[600px] w-full rounded-[40px] overflow-hidden border border-white/10 relative z-0 shadow-2xl">
                        <MapContainer
                            key={region}
                            center={defaultCenter}
                            zoom={defaultZoom}
                            scrollWheelZoom={false}
                            attributionControl={false}
                            className="h-full w-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            {activeLayer === 'projects' ? (
                                projects.map((project) => (
                                    <Marker key={project.id} position={[project.latitude, project.longitude]} icon={icon}>
                                        <Popup className="custom-brutalist-popup">
                                            <div className="p-4 border-l-4 border-orange-500 bg-[#0F172A] text-white -m-2 min-w-[200px]">
                                                <h4 className="font-black uppercase text-sm mb-1">{project.title}</h4>
                                                <p className="text-[9px] text-orange-500 font-bold uppercase mb-3">{project.location}</p>
                                                <p className="text-[11px] font-mono leading-relaxed text-white/70">{project.description}</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))
                            ) : (
                                <>
                                    {GEO_REGIONS.map(region => (
                                        <Circle
                                            key={region.id}
                                            center={[region.lat, region.lng]}
                                            radius={region.r}
                                            pathOptions={{
                                                fillColor: region.color,
                                                fillOpacity: 0.05,
                                                color: region.color,
                                                weight: 1,
                                                dashArray: '10, 20'
                                            }}
                                        />
                                    ))}
                                    {GEOLOGY_POINTS.map((point) => (
                                        <Marker key={point.id} position={[point.latitude, point.longitude]} icon={geoIcon}>
                                            <Popup className="custom-brutalist-popup">
                                                <div className="p-5 border-l-4 border-sky-500 bg-[#0F172A] text-white -m-2 min-w-[280px]">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <h4 className="font-black uppercase text-sky-400 text-sm">{point.title}</h4>
                                                        <span className="text-[9px] bg-sky-500/20 px-2 py-0.5 rounded-full border border-sky-500/30 text-sky-300 font-bold">DATA POINT</span>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-white/30 mb-1">Глубина зондирования</p>
                                                            <p className="text-xs font-mono text-white/90">{point.depth}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-white/30 mb-2">Разрез отложений</p>
                                                            <div className="space-y-1">
                                                                {point.soil_layers.map((layer, i) => (
                                                                    <div key={i} className="text-[10px] flex items-center gap-2">
                                                                        <span className="w-1 h-1 rounded-full bg-sky-500/50" />
                                                                        {layer}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="pt-2 border-t border-white/5">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="text-white/30">УРОВЕНЬ ГРУНТОВЫХ ВОД:</span>
                                                                <span className="font-mono text-sky-400">{point.water_level}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </>
                            )}
                        </MapContainer>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-brutalist-popup .leaflet-popup-content-wrapper {
          background: #0F172A !important;
          color: white !important;
          border-radius: 20px !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .custom-brutalist-popup .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .custom-brutalist-popup .leaflet-popup-tip {
          background: #0F172A !important;
        }
        .leaflet-container {
          background: transparent !important;
          outline: none;
        }
      `}</style>
        </section>
    );
}
