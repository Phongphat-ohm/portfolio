"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Project from "@/components/Projects";

export default function Page() {
    const [videoHidden, setVideoHidden] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [particles] = useState(() =>
        Array.from({ length: 45 }, () => ({
            id: Math.random().toString(36).slice(2),
            left: Math.random() * 100,
            top: Math.random() * 100,
            size: 2 + Math.random() * 4,
            delay: Math.random() * 6,
            duration: 3 + Math.random() * 5,
            drift: (Math.random() - 0.5) * 50,
        }))
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Navbar route_id={2} />
            <main className="min-h-screen bg-base-100 text-base-content">
                <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                    <div className="relative overflow-hidden rounded-box">
                        <div className="absolute inset-0 bg-[#050d24]" />
                        <motion.div
                            className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl"
                            animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl"
                            animate={{ x: [0, -70, 0], y: [0, -40, 0], scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                            className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl"
                            animate={{ x: [0, 50, 0], y: [0, -50, 0], opacity: [0.4, 0.8, 0.4] }}
                            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
                        />
                    <div className="absolute inset-0">
                        {mounted &&
                            particles.map((p) => (
                                <motion.span
                                    key={p.id}
                                    className="absolute rounded-full bg-cyan-200"
                                    style={{
                                        left: `${p.left}%`,
                                        top: `${p.top}%`,
                                        width: p.size,
                                        height: p.size,
                                        boxShadow: "0 0 8px rgba(165,243,252,0.9)",
                                    }}
                                    animate={{ opacity: [0.1, 1, 0.1], y: [0, p.drift] }}
                                    transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                                />
                            ))}
                    </div>
                        <motion.video
                            src="https://seaweed-s3.ppkxb.space/portfolio/uploads/bg.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            onError={() => setVideoHidden(true)}
                            initial={{ y: -10, opacity: 0 }}
                            animate={videoHidden ? { opacity: 0 } : { y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative aspect-[16/10] w-full object-cover sm:aspect-[21/9]"
                        >
                        </motion.video>
                        <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black/35 p-5 text-center text-3xl font-bold text-white backdrop-blur-sm nunito sm:text-5xl lg:text-6xl">
                            <span>
                                This is my project <br /> in my <span className="text-primary">Life</span>
                            </span>
                        </motion.h1>
                    </div>
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-8">
                        <Project />
                    </motion.div>
                </div>
                <Footer />
            </main>
        </>
    )
}
