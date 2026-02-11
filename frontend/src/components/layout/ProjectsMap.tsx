"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface MapProject {
    id: string;
    title: string;
    location: string;
    description: string;
    latitude: number;
    longitude: number;
    stats?: string;
}

interface GeoContext {
    id: string;
    region: string;
    soil_type: string;
    geology_desc: string;
    recommended_methods: string[];
    lat: number;
    lng: number;
    radius: number;
}

const GEO_DATA: GeoContext[] = [
    {
        id: 'spb',
        region: 'Санкт-Петербург',
        soil_type: 'Слабые водонасыщенные грунты',
        geology_desc: 'Преобладают ленточные глины и супеси с высоким УГВ. Сложная гидрогеологическая обстановка.',
        recommended_methods: ['Статическое вдавливание', 'Вибропогружение с подмывом'],
        lat: 59.93,
        lng: 30.33,
        radius: 100000
    },
    {
        id: 'msk',
        region: 'Москва и МО',
        soil_type: 'Глины и моренные суглинки',
        geology_desc: 'Относительно стабильные грунты, но высокая плотность застройки требует щадящих методов.',
        recommended_methods: ['Лидерное бурение', 'Вдавливание шпунта'],
        lat: 55.75,
        lng: 37.61,
        radius: 120000
    }
];

export default function ProjectsMap() {
    const [projects, setProjects] = useState<MapProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeLayer, setActiveLayer] = useState<'projects' | 'geology'>('projects');

    useEffect(() => {
        async function fetchPoints() {
            try {
                const CMS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8055';
                const res = await fetch(`${CMS_URL}/items/cases?fields=id,title,location,description,latitude,longitude`);
                if (!res.ok) throw new Error('Failed to fetch points');
                const { data } = await res.json();

                // Filter out projects without coordinates
                setProjects(data.filter((p: MapProject) => p.latitude && p.longitude));
            } catch (err) {
                console.error('Map fetch error:', err);
                // Fallback for demo
                setProjects([
                    { id: '1', title: 'МФК «Лахта Центр 2»', location: 'Санкт-Петербург', description: 'Разработка котлована под высотную часть. Шпунт корытного профиля, 24м, статический метод вдавливания GIKEN.', latitude: 59.98, longitude: 30.17 },
                    { id: '2', title: 'ЖК в Москва-Сити', location: 'Москва', description: 'Устройство ограждения из буросекущих свай. Глубина 28м. Применение тяжелых роторных установок Bauer.', latitude: 55.75, longitude: 37.54 },
                    { id: '3', title: 'Терминал ЛПГ', location: 'Усть-Луга', description: 'Устройство причальной стенки из трубчатого шпунта. Вибропогружение с использованием резонансных безредукторных машин.', latitude: 59.68, longitude: 28.42 },
                    { id: '4', title: 'Эко-Технопарк', location: 'Казань', description: 'Лидерное бурение и погружение железобетонных свай. Подготовка основания под производственный корпус.', latitude: 55.79, longitude: 49.12 },
                    { id: '5', title: 'Мостовой переход', location: 'Новосибирск', description: 'Устройство опор русловой части на буронабивных сваях в обсадной трубе. Диаметр 1500мм.', latitude: 55.03, longitude: 82.93 }
                ]);
            } finally {
                setLoading(false);
            }
        }
        fetchPoints();
    }, []);

    if (loading) return <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-2xl" />;

    return (
        <section className="py-20 px-6 bg-[#0F172A]" id="map">
            <div className="container mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">Интеллектуальная карта</h2>
                        <h3 className="text-4xl font-black uppercase text-white">
                            {activeLayer === 'projects' ? 'География присутствия' : 'Геологический контекст'}
                        </h3>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-sm self-start md:self-auto">
                        <button
                            onClick={() => setActiveLayer('projects')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeLayer === 'projects' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white'}`}
                        >
                            Проекты
                        </button>
                        <button
                            onClick={() => setActiveLayer('geology')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeLayer === 'geology' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/40 hover:text-white'}`}
                        >
                            Геология (Beta)
                        </button>
                    </div>
                </div>

                <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
                    <MapContainer
                        center={[58, 35]}
                        zoom={5}
                        scrollWheelZoom={false}
                        className="h-full w-full"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        // Brutalist dark filter for map (via CSS)
                        />
                        {activeLayer === 'projects' ? (
                            projects.map((project) => (
                                <Marker key={project.id} position={[project.latitude, project.longitude]} icon={icon}>
                                    <Popup className="custom-brutalist-popup">
                                        <div className="p-2 border-t-4 border-orange-500 bg-[#0F172A] text-white -m-2">
                                            <h4 className="font-black uppercase text-sm mb-1">{project.title}</h4>
                                            <p className="text-[10px] text-white/60 uppercase mb-2">{project.location}</p>
                                            <p className="text-xs font-mono">{project.description}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))
                        ) : (
                            GEO_DATA.map((zone) => (
                                <Circle
                                    key={zone.id}
                                    center={[zone.lat, zone.lng]}
                                    radius={zone.radius}
                                    pathOptions={{
                                        fillColor: '#F97316',
                                        fillOpacity: 0.1,
                                        color: '#F97316',
                                        weight: 1,
                                        dashArray: '5, 10'
                                    }}
                                >
                                    <Popup className="custom-brutalist-popup">
                                        <div className="p-4 border-l-4 border-orange-500 bg-[#0F172A] text-white -m-2 min-w-[240px]">
                                            <h4 className="font-black uppercase text-orange-500 text-sm mb-2">{zone.region}</h4>
                                            <p className="text-xs font-bold uppercase mb-2">Грунты: {zone.soil_type}</p>
                                            <p className="text-[11px] text-white/70 mb-4 italic leading-relaxed">{zone.geology_desc}</p>

                                            <div className="space-y-2">
                                                <p className="text-[10px] font-bold uppercase text-white/40">Рекомендуем:</p>
                                                <div className="flex flex-col gap-1">
                                                    {zone.recommended_methods.map((m, i) => (
                                                        <div key={i} className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/5">
                                                            {m}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Popup>
                                </Circle>
                            ))
                        )}
                    </MapContainer>
                </div>
            </div>

            <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #0F172A !important;
          color: white !important;
          border-radius: 0 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
        }
        .leaflet-popup-tip {
          background: #0F172A !important;
        }
        .leaflet-container {
          filter: grayscale(1) invert(1) contrast(1.2) brightness(0.8);
        }
      `}</style>
        </section>
    );
}
