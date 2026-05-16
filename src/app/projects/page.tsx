"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Project from "@/components/Projects";

export default function Page() {
    return (
        <>
            <Navbar route_id={2} />
            <main className="min-h-screen bg-base-100 text-base-content">
            <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-box">
                    <motion.video
                        src="/vdo/bg.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="aspect-[16/10] w-full object-cover sm:aspect-[21/9]"
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
            </main>
        </>
    )
}
