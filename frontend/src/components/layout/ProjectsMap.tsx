"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

export default function ProjectsMap() {
    const [projects, setProjects] = useState<MapProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPoints() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/items/cases?fields=id,title,location,description,latitude,longitude`);
                if (!res.ok) throw new Error('Failed to fetch points');
                const { data } = await res.json();

                // Filter out projects without coordinates
                setProjects(data.filter((p: MapProject) => p.latitude && p.longitude));
            } catch (err) {
                console.error('Map fetch error:', err);
                // Fallback for demo
                setProjects([
                    { id: '1', title: 'Лахта Центр 2', location: 'СПб', description: 'Шпунтовое ограждение, 12м, метод вдавливания, Bauer.', latitude: 59.98, longitude: 30.17 },
                    { id: '2', title: 'ММДЦ Москва-Сити', location: 'Москва', description: 'Буронабивные сваи, 24м, Enteco E400.', latitude: 55.75, longitude: 37.54 }
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
                <div className="mb-12">
                    <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500 mb-4">География проектов</h2>
                    <h3 className="text-4xl font-black uppercase text-white">Масштаб присутствия</h3>
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
                        {projects.map((project) => (
                            <Marker key={project.id} position={[project.latitude, project.longitude]} icon={icon}>
                                <Popup className="custom-brutalist-popup">
                                    <div className="p-2 border-t-4 border-orange-500 bg-[#0F172A] text-white -m-2">
                                        <h4 className="font-black uppercase text-sm mb-1">{project.title}</h4>
                                        <p className="text-[10px] text-white/60 uppercase mb-2">{project.location}</p>
                                        <p className="text-xs font-mono">{project.description}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
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
