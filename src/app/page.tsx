"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar route_id={0} />
      <main className="min-h-screen overflow-hidden bg-base-100 text-base-content">
        <section className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-4 pb-16 pt-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="order-2 flex flex-col gap-6 text-center lg:order-1 lg:text-left"
          >
            <div className="flex flex-col gap-3">
              <p className="text-lg text-base-content/70 sm:text-2xl">
                Hello, It's me
              </p>
              <h1 className="text-4xl font-bold leading-tight text-base-content nunito sm:text-6xl lg:text-7xl">
                Ohm Phongphat
              </h1>
              <h2 className="text-xl text-base-content/80 sm:text-3xl">
                And I'm a{" "}
                <span className="font-semibold text-primary">
                  Full Stack Developer
                </span>
              </h2>
            </div>
            <p className="mx-auto max-w-2xl text-base leading-8 text-base-content/70 lg:mx-0">
              Welcome to my portfolio website. This space introduces who I am,
              the skills I use, and the projects I have built across frontend,
              backend, and full stack work.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href={"/projects"} className="btn btn-primary">
                View Projects
              </Link>
              <Link href={"/skills"} className="btn btn-outline">
                Explore Skills
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="order-1 mx-auto flex w-full max-w-xs justify-center sm:max-w-sm md:max-w-md lg:order-2 lg:max-w-lg"
          >
            <div className="relative aspect-[4/5] w-full overflow-visible">
              <div className="absolute inset-x-4 bottom-4 h-1/2 rounded-full bg-primary/20 blur-3xl" />
              <Image
              src="/images/self-photo2.png"
              alt="Ohm Phongphat"
                fill
                priority
                sizes="(min-width: 1024px) 38rem, (min-width: 640px) 24rem, 20rem"
                className="object-contain object-bottom drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
