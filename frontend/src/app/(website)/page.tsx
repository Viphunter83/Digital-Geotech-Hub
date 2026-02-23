import { cookies } from "next/headers";
import { EngineeringBackground } from "@/components/ui/EngineeringBackground";
import { WhyUs } from "@/components/layout/WhyUs";
import { ServicesPreview } from "@/components/layout/ServicesPreview";
import { MachineryPreview } from "@/components/layout/MachineryPreview";
import { JournalPreview } from "@/components/layout/JournalPreview";
import { SmartDropzone } from "@/components/layout/SmartDropzone";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/layout/Hero";
import { ServiceFAQ } from "@/components/layout/ServiceFAQ";
import InteractiveMap from "@/components/layout/InteractiveMap";

export default async function Home() {
  const cookieStore = await cookies();
  const region = (cookieStore.get("x-geo-region")?.value as 'msk' | 'spb' | 'all') || 'all';

  return (
    <main className="flex-1 relative">
      <EngineeringBackground />
      <div className="relative z-10">
        <Hero region={region} />
        <WhyUs />
        <ServicesPreview region={region} />
        <SmartDropzone />
        <InteractiveMap region={region} />
        <MachineryPreview />
        <JournalPreview />
        <ServiceFAQ />
        <Footer />
      </div>
    </main>
  );
}
