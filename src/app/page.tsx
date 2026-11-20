"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar route_id={0} />
      <main className="site-page home-gradient overflow-hidden">
        <section className="section-shell grid min-h-screen items-center gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="order-2 flex flex-col gap-6 text-center lg:order-1 lg:text-left"
          >
            <div className="flex flex-col gap-3">
              <p className="body-copy">
                Hello, It's me
              </p>
              <h1 className="display-title">
                Ohm Phongphat
              </h1>
              <h2 className="text-2xl font-semibold leading-8 sm:text-[34px] sm:leading-[50px]" style={{ color: "var(--text-secondary)" }}>
                And I'm a{" "}
                <span style={{ color: "var(--accent)" }}>
                  Full Stack Developer
                </span>
              </h2>
            </div>
            <p className="body-copy mx-auto max-w-2xl lg:mx-0">
              Welcome to my portfolio website. This space introduces who I am,
              the skills I use, and the projects I have built across frontend,
              backend, and full stack work.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href={"/projects"} className="apple-button">
                View Projects
              </Link>
              <Link href={"/skills"} className="apple-button-secondary">
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
            <div className="hero-portrait relative aspect-[4/5] w-full overflow-visible px-6 pt-8">
              <div className="absolute -inset-x-8 bottom-2 h-3/5 rounded-full blur-3xl" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 34%, transparent), rgba(52, 211, 153, 0.24), rgba(255, 214, 102, 0.2))" }} />
              <div className="absolute inset-x-6 bottom-4 h-24 rounded-full blur-2xl" style={{ background: "rgba(0, 0, 0, 0.18)" }} />
              <Image
              src="/images/self-photo2.png"
              alt="Ohm Phongphat"
                fill
                priority
                sizes="(min-width: 1024px) 38rem, (min-width: 640px) 24rem, 20rem"
                className="object-contain object-bottom"
              />
            </div>
          </motion.div>
        </section>
      </main>
    </>
  );
}
