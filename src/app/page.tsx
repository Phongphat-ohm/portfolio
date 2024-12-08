"use client";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion"
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar route_id={0} />
      <div className="h-screen flex items-center justify-center gap-52 text-white">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col gap-5 w-1/3">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl">
              Hello, It's me
            </h2>
            <h1 className="text-5xl">
              Ohm Phongphat
            </h1>
            <h2 className="text-2xl">
              And I'm a <label className="text-blue-400">Full Stack Developer</label>
            </h2>
          </div>
          <label>
            Welcome to my portfolio website! This site was created as a platform to introduce myself, share my experiences, and showcase the skills and projects I’ve worked on. I truly appreciate you taking the time to explore and learn more about me. Thank you for visiting, and I hope you enjoy your time here!
          </label>
          <div className="flex">
            <Link href={"/certificate"} className="transition-all duration-200 hover:shadow-lg hover:shadow-blue-600 bg-blue-500 p-3 px-6 rounded-xl">
              Go to my Certificate...
            </Link>
          </div>
        </motion.div>
        <motion.img initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} src="https://placehold.co/300x600" className="w-64" />
      </div>
    </>
  );
}
