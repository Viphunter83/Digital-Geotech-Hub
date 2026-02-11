import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { GridBackground } from "@/components/ui/GridBackground";
import { ServicesPreview } from "@/components/layout/ServicesPreview";
import { MachineryPreview } from "@/components/layout/MachineryPreview";
import { SmartDropzone } from "@/components/layout/SmartDropzone";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { ServiceFAQ } from "@/components/layout/ServiceFAQ";

const ProjectsMap = dynamic(() => import("@/components/layout/ProjectsMap"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-white/5 animate-pulse rounded-2xl" />
});

export default async function Home() {
  const cookieStore = await cookies();
  const region = (cookieStore.get("x-geo-region")?.value as 'msk' | 'spb') || 'spb';

  return (
    <main className="flex-1">
      <GridBackground />
      <Hero region={region} />
      <ServicesPreview />
      <ProjectsMap />
      <MachineryPreview />
      <SmartDropzone />
      <ServiceFAQ />
      <Footer />
    </main>
  );
}
