"use client";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";

interface LinkRoute {
    label: string;
    href: string
}

interface Root {
    route_id: number
    showScroll?: boolean
}

export default function Navbar({ route_id, showScroll: showscroll }: Root) {
    const { scrollYProgress } = useScroll()

    const route: LinkRoute[] = [
        {
            label: "Home",
            href: "/"
        },
        {
            label: "Skills",
            href: "/skills"
        },
        {
            label: "Projects",
            href: "/projects"
        },
        {
            label: "Certificate",
            href: "/certificate"
        },
        {
            label: "Contact",
            href: "/contact"
        }
    ]

    return (
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="flex flex-col fixed z-50 w-full">
            <nav className="p-5 flex justify-around items-center text-white backdrop-blur w-full">
                <Link href={"/"} className="text-2xl font-bold nunito">
                    Portfolio.
                </Link>
                <ul className="flex gap-12">
                    {route.map((val, index) => (
                        <li key={index}>
                            <Link href={val.href} className={index == route_id ? "text-blue-500" : "hover:text-gray-400 transition-all duration-200"}>
                                {val.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav >
            {showscroll && (
                <motion.span style={{ scaleX: scrollYProgress }} className="h-1 bg-yellow-400"></motion.span>
            )}
        </motion.nav>
    )
}