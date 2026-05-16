"use client";
import Link from "next/link";
import { motion, useScroll } from "framer-motion";
import { HiMenuAlt3 } from "react-icons/hi";

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
            label: "Contact",
            href: "/contact"
        }
    ]

    return (
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="fixed z-50 flex w-full flex-col">
            <nav className="border-b border-white/10 bg-base-100/70 text-base-content shadow-sm backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                <Link href={"/"} className="text-xl font-bold tracking-wide nunito sm:text-2xl">
                    Portfolio.
                </Link>
                <ul className="hidden items-center gap-2 md:flex">
                    {route.map((val, index) => (
                        <li key={index}>
                            <Link href={val.href} className={index == route_id ? "btn btn-sm btn-primary" : "btn btn-ghost btn-sm"}>
                                {val.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="dropdown dropdown-end md:hidden">
                    <button type="button" tabIndex={0} className="btn btn-ghost btn-square" aria-label="Open navigation menu">
                        <HiMenuAlt3 className="text-2xl" />
                    </button>
                    <ul tabIndex={0} className="menu dropdown-content z-[60] mt-3 w-52 rounded-box bg-base-100 p-2 shadow-xl">
                        {route.map((val, index) => (
                            <li key={index}>
                                <Link href={val.href} className={index == route_id ? "active" : ""}>
                                    {val.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                </div>
            </nav >
            {showscroll && (
                <motion.span style={{ scaleX: scrollYProgress, transformOrigin: "0%" }} className="h-1 bg-primary"></motion.span>
            )}
        </motion.nav>
    )
}
