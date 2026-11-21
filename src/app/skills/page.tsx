"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHeading from "@/components/PageHeading";
import Link from "next/link";


const operatingSystemSkills = [
  ["Windows", "/images/os/windows.webp"],
  ["Linux Ubuntu", "/images/os/ubuntu.webp"]
];

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
  ["SQL", "/images/language/sqlscript.png"],
  ["C#", "/images/language/csharp.png"],
  ["Python", "/images/language/python.png"],
  ["Google Apps Script", "/images/language/google_script.png"],
];

const databaseSkill = [
  {
    name: "MySQL",
    image: "/images/database/mysql.png",
    description: "Relational database management system for structured data storage.",
  },
  {
    name: "PostgreSQL",
    image: "/images/database/postgresql.webp",
    description: "Open-source relational database management system for structured data storage.",
  }
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
  ["HeroUI", "/images/library/heroui.png", ""],
  ["Font Awesome", "/images/library/fontawesome.svg", "bg-white p-2"],
];

const groups = [
  { title: "Languages", description: "The building blocks behind the interface.", items: languageSkills.map(([name, image]) => ({ name, image, href: "", description: "" })) },
  { title: "Frameworks & libraries", description: "Tools for putting the pieces together.", items: libraries.map(([name, image]) => ({ name, image, href: "", description: "" })) },
  { title: "Editors & programs", description: "Where the work happens.", items: programSkills },
  { title: "Runtimes", description: "What keeps the code running.", items: runtimeSkills.map(item => ({ ...item, href: "" })) },
  { title: "Databases", description: "A home for structured data.", items: databaseSkill.map(item => ({ ...item, href: "" })) },
  { title: "Operating systems", description: "The environments I work in.", items: operatingSystemSkills.map(([name, image]) => ({ name, image, href: "", description: "" })) },
];
export default function Page() {
  return <><Navbar /><main id="main-content" className="wrap page-content"><PageHeading title="My working toolkit.">From frontend interfaces to backend services. These are the languages, platforms, and tools I use along the way.</PageHeading>
    {groups.map(group => <section key={group.title} className="skill-section"><div><h2>{group.title}</h2><p>{group.description}</p></div><div className="skill-grid">{group.items.map(item => {
      const content = <><img src={item.image} alt="" loading="lazy" width={36} height={36} /><div><h3>{item.name}</h3>{item.description && <p>{item.description}</p>}</div></>;
      return item.href ? <Link key={item.name} className="skill-item" href={item.href} target="_blank" rel="noopener noreferrer">{content}</Link> : <div className="skill-item" key={item.name}>{content}</div>;
    })}</div></section>)}
  </main><Footer /></>;
}
