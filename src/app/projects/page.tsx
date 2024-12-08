"use client";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Project from "@/components/Projects";
import { ReactTyped } from "react-typed";

export default function Page() {
    return (
        <>
            <Navbar route_id={2} />
            <div className="container mx-auto px-36">
                <br /><br /><br /><br />
                <div className="relative overflow-hidden rounded-xl">
                    <motion.video
                        src="/vdo/bg.mp4"
                        autoPlay
                        loop
                        muted
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                    </motion.video>
                    <motion.h1 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="text-6xl absolute top-0 left-0 w-full h-full flex justify-center items-center text-white backdrop-blur rounded-xl">
                        <label className="nunito font-bold">
                            This is my project <br /> in my <label className="text-blue-500">Life</label>
                        </label>
                    </motion.h1>
                </div>
                <br />
                <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1 }}>
                    <Project />
                </motion.div>
            </div>
        </>
    )
}