"use client";

import dynamic from "next/dynamic";

const ProjectsMap = dynamic(() => import("./ProjectsMap"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-[#0F172A] animate-pulse rounded-2xl flex items-center justify-center text-white/10 font-black uppercase tracking-widest">Initialising Geo-Engine...</div>
});

export default function InteractiveMap({ region }: { region: 'msk' | 'spb' }) {
    return <ProjectsMap region={region} />;
}
