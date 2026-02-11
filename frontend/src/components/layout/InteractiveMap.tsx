"use client";

import dynamic from "next/dynamic";

const ProjectsMap = dynamic(() => import("./ProjectsMap"), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-2xl" />
});

export default function InteractiveMap() {
    return <ProjectsMap />;
}
