import { fetchProjects, Project } from "@/lib/projects-data";
import { SubPageHero } from "@/components/layout/SubPageHero";
import { PortfolioHeroDecorations } from "@/components/portfolio/PortfolioHeroDecorations";
import { PortfolioClient } from "@/components/portfolio/PortfolioClient";

export default async function PortfolioPage() {
    const allProjects = await fetchProjects();

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
                        description="Портфолио Digital Geotech Hub. От работы в условиях исторической застройки до реализации масштабных инфраструктурных объектов государственного значения."
                        badgeText="Portfolio & Cases"
                        backLink="/"
                        backLabel="На главную"
                    >
                        <PortfolioHeroDecorations />
                    </SubPageHero>
                </div>

                {/* Client Component for Interactive Grid */}
                <PortfolioClient initialProjects={allProjects} />
            </div>
        </main>
    );
}
