"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PROJECTS } from '@/lib/projects-data';

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


const GEOLOGY_POINTS: GeologyPoint[] = [
    {
        id: 'g1',
        title: 'Скважина №14-2',
        depth: '24.5м',
        soil_layers: ['Насыпной грунт (2.1м)', 'Суглинок тугоплавкий (4.5м)', 'Песок средней крупности (8.2м)', 'Известняк (9.7м)'],
        water_level: '-3.2м',
        latitude: 59.94,
        longitude: 30.32
    },
    {
        id: 'g2',
        title: 'Скважина №18-1',
        depth: '18.0м',
        soil_layers: ['Торф (1.5м)', 'Супесь пластичная (3.2м)', 'Глина кембрийская (13.3м)'],
        water_level: '-1.8м',
        latitude: 59.92,
        longitude: 30.29
    },
    {
        id: 'g3',
        title: 'Скважина №11-5',
        depth: '32.0м',
        soil_layers: ['Насыпной слой (3.0м)', 'Песок пылеватый (5.0м)', 'Суглинок мягкоплавкий (12.0м)', 'Глина твердая (12.0м)'],
        water_level: '-4.5м',
        latitude: 55.76,
        longitude: 37.62
    },
    {
        id: 'g4',
        title: 'Скважина №22-3',
        depth: '28.5м',
        soil_layers: ['Техногенный грунт (2.8м)', 'Песок мелкий (6.2м)', 'Суглинок полутвердый (19.5м)'],
        water_level: '-5.1м',
        latitude: 55.74,
        longitude: 37.59
    }
];

const GEO_REGIONS = [
    { id: 'r1', lat: 59.93, lng: 30.3, r: 5000, color: '#0EA5E9' },
    { id: 'r2', lat: 55.75, lng: 37.6, r: 8000, color: '#F97316' }
];



const REFERENCE_PROJECTS: MapProject[] = PROJECTS.map(p => ({
    id: p.id,
    title: p.title,
    location: p.location,
    description: p.description,
    latitude: p.coordinates[0],
    longitude: p.coordinates[1]
}));


interface ProjectMapProps {
    region: 'msk' | 'spb';
}

export default function ProjectsMap({ region }: ProjectMapProps) {
    const [projects, setProjects] = useState<MapProject[]>(REFERENCE_PROJECTS);
    const [geologyPoints, setGeologyPoints] = useState<GeologyPoint[]>(GEOLOGY_POINTS);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState<'projects' | 'geology'>('projects');

    const defaultCenter: [number, number] = region === 'msk' ? [55.75, 37.6] : [59.93, 30.3];
    const defaultZoom = 11;

    useEffect(() => {
        async function fetchPoints() {
            try {
                const CMS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8055';

                // Fetch Unified Projects
                const projRes = await fetch(`${CMS_URL}/items/projects?fields=id,title,location,latitude,longitude,description&filter[status][_eq]=published`);
                if (projRes.ok) {
                    const { data } = (await projRes.json()) as { data: { id: string; title: string; location: string | null; latitude: string | number; longitude: string | number; description: string | null }[] };
                    if (data && data.length > 0) {
                        const mappedData = data.map((item) => ({
                            id: item.id,
                            title: item.title,
                            latitude: Number(item.latitude),
                            longitude: Number(item.longitude),
                            location: item.location || 'Объект',
                            description: item.description || 'Информация из базы данных.'
                        })).filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude) && p.latitude !== 0);

                        setProjects(mappedData);
                    }
                }

                // Fetch Geology Points
                const geoRes = await fetch(`${CMS_URL}/items/geology_points?fields=id,title,depth,soil_layers,water_level,latitude,longitude`);
                if (geoRes.ok) {
                    const { data } = (await geoRes.json()) as { data: { id: string; title: string; depth: string; soil_layers: string[] | string; water_level: string; latitude: string | number; longitude: string | number }[] };
                    if (data && data.length > 0) {
                        const validatedGeo = data.map((point) => ({
                            id: point.id,
                            title: point.title,
                            depth: point.depth,
                            water_level: point.water_level,
                            latitude: Number(point.latitude),
                            longitude: Number(point.longitude),
                            soil_layers: Array.isArray(point.soil_layers) ? point.soil_layers : []
                        })).filter((p) => !isNaN(p.latitude) && !isNaN(p.longitude) && p.latitude !== 0);
                        setGeologyPoints(validatedGeo);
                    }
                }
            } catch {
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
                                attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            />
                            <TileLayer
                                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
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
                                    {geologyPoints.map((point) => (
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
                                                                {Array.isArray(point.soil_layers) && point.soil_layers.map((layer: string, i: number) => (
                                                                    <div key={i} className="text-[10px] flex items-center gap-2">
                                                                        <span className="w-1 h-1 rounded-full bg-sky-500/50" />
                                                                        {layer}
                                                                    </div>
                                                                ))}
                                                                {(!point.soil_layers || point.soil_layers.length === 0) && (
                                                                    <div className="text-[10px] text-white/30 italic">Данные разреза отсутствуют</div>
                                                                )}
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
