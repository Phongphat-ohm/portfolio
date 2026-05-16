"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaComputerMouse } from "react-icons/fa6";

const programSkills = [
  {
    name: "Visual Studio Code",
    image: "/images/program/vscode.png",
    href: "https://code.visualstudio.com/",
    description:
      "A lightweight editor for daily web development, extensions, debugging, and Git workflows.",
  },
  {
    name: "Visual Studio",
    image: "/images/program/Visual_Studio_Icon_2022.png",
    href: "https://visualstudio.microsoft.com/",
    description:
      "An IDE for larger .NET, C#, desktop, and service-based application development.",
  },
  {
    name: "Unity",
    image: "/images/program/unity.png",
    href: "https://unity.com/",
    description:
      "A game and interactive 3D platform for building 2D, 3D, AR, and VR experiences.",
  },
  {
    name: "Microsoft 365",
    image: "/images/program/Microsoft_365.png",
    href: "https://www.microsoft.com/th-th/microsoft-365/microsoft-office",
    description:
      "Productivity tools for documents, spreadsheets, presentations, communication, and planning.",
  },
];

const languageSkills = [
  ["HTML5", "/images/language/html5.png"],
  ["CSS", "/images/language/css.png"],
  ["JavaScript", "/images/language/javascript.png"],
  ["PHP", "/images/language/php.png"],
  ["MySQL", "/images/language/mysql.png"],
  ["C#", "/images/language/csharp.png"],
  ["Python", "/images/language/python.png"],
  ["Google Apps Script", "/images/language/google_script.png"],
];

const runtimeSkills = [
  {
    name: "Node.js Runtime",
    image: "/images/runtime/jsIconGreen.svg",
    description: "Runtime for server-side JavaScript APIs, tools, and services.",
  },
  {
    name: "Bun Runtime",
    image: "/images/runtime/bun.svg",
    description: "Fast JavaScript runtime and package manager for modern projects.",
  },
  {
    name: ".NET Runtime",
    image: "/images/runtime/dotnet.png",
    description: "Runtime for C# and .NET applications, services, and tools.",
  },
  {
    name: "Apache Runtime",
    image: "/images/runtime/apache.png",
    description: "Web server runtime for hosting websites and backend applications.",
  },
];

const libraries = [
  ["Next.js", "/images/library/next-js.png"],
  ["Vite", "/images/library/vite.png", ""],
  ["Express", "/images/library/express-js.png", "bg-white p-2"],
  ["Socket.IO", "/images/library/socketjs.png", "bg-white p-2 rounded-full"],
  ["Prisma", "/images/library/prisma.png", ""],
  ["Elysia", "/images/library/elysia.png", ""],
  ["Bootstrap", "/images/library/bootstrap.png", ""],
  ["NextUI", "/images/library/nextui.png", ""],
  ["Font Awesome", "/images/library/fontawesome.svg", "bg-white p-2"],
];

export default function Page() {
  return (
    <>
      <Navbar route_id={1} showScroll />
      <main className="bg-base-100 text-base-content">
        <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 pb-20 pt-28 sm:px-6 lg:px-8">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2">
            <motion.img
              initial={{ opacity: 0, rotate: 8, scale: 0.96 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              src="/images/competence.png"
              alt="Skill illustration"
              className="mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-md"
            />
            <div className="text-center lg:text-left">
              <motion.p
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-sm font-semibold uppercase text-primary"
              >
                Skills
              </motion.p>
              <motion.h1
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-3 text-3xl font-bold nunito sm:text-5xl"
              >
                Tools and technologies I use to build practical software.
              </motion.h1>
              <motion.p
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-5 text-base leading-8 text-base-content/70"
              >
                A compact overview of my editor, language, runtime, framework,
                and library experience.
              </motion.p>
            </div>
          </div>

          <motion.span
            className="absolute bottom-8 left-0 flex w-full justify-center text-lg"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <FaComputerMouse className="rotate-180 text-2xl text-primary" />
          </motion.span>
        </section>

        <section className="bg-base-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle title="Program Skill" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {programSkills.map((skill) => (
                <Link
                  key={skill.name}
                  href={skill.href}
                  target="_blank"
                  className="card h-full bg-base-100 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="card-body items-center text-center">
                    <img src={skill.image} alt={skill.name} className="h-24 w-24 object-contain" />
                    <h2 className="card-title text-lg">{skill.name}</h2>
                    <p className="text-sm leading-6 text-base-content/70">
                      {skill.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle title="Language Skills" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {languageSkills.map(([name, image]) => (
                <div key={name} className="card bg-base-200 shadow-sm">
                  <div className="card-body items-center justify-center p-5">
                    <img src={image} alt={`${name} icon`} className="h-20 w-20 object-contain" />
                    <span className="text-center text-sm font-medium">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-base-200">
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle title="Runtime Skills" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {runtimeSkills.map((skill) => (
                <div key={skill.name} className="card bg-base-100 shadow-sm transition hover:shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <img src={skill.image} alt={skill.name} className="h-16 w-16 object-contain" />
                      <div>
                        <h2 className="font-semibold">{skill.name}</h2>
                        <p className="mt-1 text-sm leading-6 text-base-content/70">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle title="Frameworks and Libraries" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {libraries.map(([name, image, imageClass]) => (
                <div key={name} className="card bg-base-200 shadow-sm">
                  <div className="card-body items-center justify-center p-5">
                    <img
                      src={image}
                      alt={`${name} icon`}
                      className={`h-20 w-20 rounded-lg object-contain transition hover:scale-105 ${imageClass}`}
                    />
                    <span className="text-center text-sm font-medium">{name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="mb-5 text-xl font-bold text-base-content sm:text-2xl">
      {title}
    </h2>
  );
}
