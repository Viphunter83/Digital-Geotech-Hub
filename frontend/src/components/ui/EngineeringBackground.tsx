"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";

export function EngineeringBackground() {
    const { scrollYProgress } = useScroll();
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<{ top: string; left: string; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setMounted(true);
            setParticles([...Array(20)].map(() => ({
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                duration: 5 + Math.random() * 10,
                delay: Math.random() * 5
            })));
        });
        return () => cancelAnimationFrame(frame);
    }, []);

    // Create smooth spring-based motion
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Layer 1 (Blueprint): Deep background
    const y1 = useTransform(smoothProgress, [0, 1], ["0%", "5%"]);
    const scale1 = useTransform(smoothProgress, [0, 1], [1, 1.05]);

    // Layer 2 (Mesh): Mid-ground
    const y2 = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);
    const scale2 = useTransform(smoothProgress, [0, 1], [1.1, 1.25]);
    const blur2 = useTransform(smoothProgress, [0, 1], ["2px", "0px"]);

    // Layer 3 (Technique 1 - Amber): Mid-Close
    const y3a = useTransform(smoothProgress, [0, 0.5], ["0%", "20%"]);
    const x3a = useTransform(smoothProgress, [0, 0.5], ["0%", "5%"]);
    const scale3a = useTransform(smoothProgress, [0, 1], [0.8, 1.2]);
    const rotate3a = useTransform(smoothProgress, [0, 1], [-5, 5]);

    // Layer 4 (Technique 2 - Amber): Very Close (Fly-by)
    const y4 = useTransform(smoothProgress, [0.3, 1], ["-20%", "60%"]);
    const x4 = useTransform(smoothProgress, [0.3, 1], ["10%", "-10%"]);
    const scale4 = useTransform(smoothProgress, [0.3, 1], [1.2, 1.8]);
    const blur4 = useTransform(smoothProgress, [0.3, 1], ["0px", "8px"]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#09090b]">
            {/* Background Layer 1: Isometric Blueprint Grid */}
            <motion.div
                style={{ y: y1, scale: scale1 }}
                className="absolute inset-0 opacity-[0.2] grayscale mix-blend-screen"
            >
                <div className="absolute inset-0 bg-[url('/assets/cad-base-3d.png')] bg-repeat bg-[length:800px_auto]" />
            </motion.div>

            {/* Background Layer 2: Abstract Cyan Mesh with Blur */}
            <motion.div
                style={{ y: y2, scale: scale2, filter: `blur(${blur2})` }}
                className="absolute inset-0 opacity-[0.5] mix-blend-screen"
            >
                <div className="absolute top-[-5%] left-[-5%] w-[110%] h-[110%] bg-[url('/assets/engineering-mesh.png')] bg-no-repeat bg-cover opacity-60" />
            </motion.div>

            {/* Layer 3: Machinery Hero 1 (Amber) - Mid Depth - SHARP */}
            <motion.div
                style={{ y: y3a, x: x3a, scale: scale3a, rotate: rotate3a }}
                className="absolute inset-0 opacity-[0.8] mix-blend-screen"
            >
                <div className="absolute bottom-[5%] right-[2%] w-[85%] h-[85%] bg-[url('/assets/machinery-wireframe-3d.png')] bg-no-repeat bg-contain shadow-[0_0_100px_rgba(255,255,255,0.05)]" />
            </motion.div>

            {/* Layer 4: Machinery Hero 2 (Amber) - Foreground Fly-by - SLIGHT BLUR */}
            <motion.div
                style={{ y: y4, x: x4, scale: scale4, filter: `blur(${blur4})` }}
                className="absolute inset-0 opacity-[0.4] mix-blend-screen"
            >
                <div className="absolute top-[5%] left-[-15%] w-[95%] h-[95%] bg-[url('/assets/machinery-wireframe-3d.png')] bg-no-repeat bg-contain rotate-12" />
            </motion.div>

            {/* Floating Particles for Volume - Only on Client */}
            {mounted && (
                <div className="absolute inset-0">
                    {particles.map((p, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-accent/30 rounded-full"
                            initial={{
                                top: p.top,
                                left: p.left,
                                opacity: 0
                            }}
                            animate={{
                                y: [0, -100],
                                opacity: [0, 0.8, 0],
                                scale: [0.5, 1.2, 0.5]
                            }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                delay: p.delay
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Dynamic Light Rays and Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-[#09090b]/40 backdrop-blur-[0.5px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#09090b_95%)] opacity-90" />
        </div>
    );
}
