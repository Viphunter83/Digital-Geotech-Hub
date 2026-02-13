import { SubPageHero } from "@/components/layout/SubPageHero";
import { PROJECTS, Project } from "@/lib/projects-data";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";

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

// Transform Directus data to Project interface
function transformDirectusCase(item: ProjectCase): Project {
    return {
        id: item.id,
        title: item.title,
        location: item.location || 'РФ',
        region: 'regions', // Default fallback
        category: 'industrial', // Default fallback
        description: item.description,
        challenge: 'Уточняется...',
        solution: item.description,
        year: item.duration,
        latitude: 0,
        longitude: 0,
        image: `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${item.image}`,
        tags: [item.soil_type],
        stats: [
            { label: 'Грунт', value: item.soil_type },
            { label: 'Срок', value: item.duration }
        ]
    };
}

async function getPortfolioCases() {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/items/cases?fields=*,machinery.machinery_id.name`, {
            next: { revalidate: 60 },
        });

        if (!res.ok) return [];
        const { data } = await res.json();
        return (data as ProjectCase[]).map(transformDirectusCase);
    } catch (e) {
        return [];
    }
}

export default async function PortfolioPage() {
    const directusCases = await getPortfolioCases();
    // Combine static premium projects with dynamic CMS projects
    // Put static projects first as they are "featured"
    const allProjects = [...PROJECTS, ...directusCases];

    return (
        <main className="min-h-screen bg-[#0F172A] text-white pt-32 pb-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.05] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />
            </div>

            <div className="relative z-10">
                <div className="container mx-auto px-4">
                    <SubPageHero
                        title="Знаковые"
                        accentTitle="проекты"
                        description="Портфолио GIP. От работы в условиях исторической застройки до реализации масштабных инфраструктурных объектов государственного значения."
                        badgeText="Portfolio & Cases"
                        backLink="/"
                        backLabel="На главную"
                    />
                </div>

                {/* Client Component for Interactive Grid */}
                <PortfolioClient initialProjects={allProjects} />
            </div>
        </main>
    );
}
