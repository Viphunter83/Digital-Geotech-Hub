import { MachineryPreview } from "@/components/layout/MachineryPreview";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  return (
    <main className="flex-1">
      <GridBackground />
      <Hero />
      <ServicesPreview />
      <MachineryPreview />
      <SmartDropzone />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#F97316_0,rgba(249,115,22,0)_50%)] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[conic-gradient(from_0deg_at_50%_50%,#0F172A_0,#F97316_50%,#0F172A_100%)] blur-[100px]" />
      </div>

      <div className="container relative z-10 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
          </span>
          Цифровая экосистема 2026
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
        >
          Digital <span className="text-accent">Geotech</span> Hub
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mb-10 max-w-3xl text-lg text-muted-foreground sm:text-xl"
        >
          Профессиональные решения для нулевого цикла, шпунтовых работ и аренды тяжелой техники.
          Интеллектуальное контрактование с применением AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <button className="group relative overflow-hidden rounded-md bg-primary px-8 py-4 font-bold text-white transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              Смотреть каталог <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-accent to-orange-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <button className="rounded-md border-2 border-primary/10 bg-white/50 px-8 py-4 font-bold text-primary backdrop-blur-md transition-all hover:bg-white hover:shadow-lg active:scale-95">
            Нанять технику
          </button>
        </motion.div>
      </div>

      {/* Floating Technical Icons */}
      <TechnicalBadge icon={<Drill />} className="top-1/4 left-10 delay-75" label="Буровые" />
      <TechnicalBadge icon={<Construction />} className="bottom-1/3 right-12 delay-150" label="Шпунт" />
      <TechnicalBadge icon={<HardHat />} className="top-1/2 right-1/4 delay-300" label="Спецтехника" />
    </section>
  );
}
    </main >
  );
}

function TechnicalBadge({ icon, className, label }: { icon: React.ReactNode, className?: string, label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 0.4, scale: 1 }}
      whileHover={{ opacity: 1, scale: 1.1 }}
      className={`absolute hidden lg:flex flex-col items-center gap-2 text-primary ${className}`}
    >
      <div className="p-3 bg-white/40 ring-1 ring-primary/10 rounded-xl backdrop-blur-xl shadow-2xl">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </motion.div>
  );
}
