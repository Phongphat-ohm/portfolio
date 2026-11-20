"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { IconType } from "react-icons";
import { HiBadgeCheck, HiBriefcase, HiHome, HiMail, HiMenuAlt3, HiMoon, HiSparkles, HiSun, HiX } from "react-icons/hi";

interface LinkRoute {
    label: string;
    href: string;
    icon: IconType;
}

interface Root {
    route_id: number
    showScroll?: boolean
}

export default function Navbar({ route_id, showScroll: showscroll }: Root) {
    const { scrollYProgress } = useScroll()
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [isReady, setIsReady] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const route: LinkRoute[] = [
        {
            label: "Home",
            href: "/",
            icon: HiHome
        },
        {
            label: "Skills",
            href: "/skills",
            icon: HiSparkles
        },
        {
            label: "Projects",
            href: "/projects",
            icon: HiBriefcase
        },
        {
            label: "Certificates",
            href: "/certificates",
            icon: HiBadgeCheck
        },
        {
            label: "Contact",
            href: "/contact",
            icon: HiMail
        }
    ]

    useEffect(() => {
        const savedTheme = window.localStorage.getItem("theme");
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const nextTheme = savedTheme === "dark" || savedTheme === "light" ? savedTheme : prefersDark ? "dark" : "light";

        document.documentElement.dataset.theme = nextTheme;
        setTheme(nextTheme);
        setIsReady(true);
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = nextTheme;
        window.localStorage.setItem("theme", nextTheme);
        setTheme(nextTheme);
    };

    return (
        <motion.nav initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="fixed z-50 flex w-full flex-col">
            <nav className="border-b backdrop-blur-xl" style={{ background: "var(--surface-glass)", borderColor: "var(--border-nav)", color: "var(--text-primary)" }}>
                <div className="section-shell flex h-14 items-center justify-between">
                <Link href={"/"} onClick={() => setIsMenuOpen(false)} className="text-xl font-bold tracking-normal nunito sm:text-2xl">
                    Portfolio.
                </Link>
                <ul className="navbar-desktop-links items-center gap-3">
                    {route.map((val, index) => (
                        <li key={index}>
                            <Link href={val.href} className={index == route_id ? "nav-link nav-link-active" : "nav-link"}>
                                <val.icon className="nav-link-icon" aria-hidden="true" />
                                {val.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="apple-button-ghost h-11 min-w-11 px-0"
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                        title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
                    >
                        {isReady && theme === "dark" ? <HiSun className="text-xl" /> : <HiMoon className="text-xl" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((value) => !value)}
                        className="navbar-mobile-button apple-button-ghost h-11 min-w-11 px-0"
                        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={isMenuOpen}
                    >
                        {isMenuOpen ? <HiX className="text-2xl" /> : <HiMenuAlt3 className="text-2xl" />}
                    </button>
                </div>
                </div>
            </nav >
            {isMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="navbar-mobile-panel border-b backdrop-blur-xl"
                    style={{ background: "var(--surface-glass)", borderColor: "var(--border-nav)" }}
                >
                    <div className="section-shell py-3">
                        <div className="grid gap-2">
                            {route.map((val, index) => (
                                <Link
                                    key={val.href}
                                    href={val.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={index == route_id ? "apple-button w-full" : "apple-button-ghost w-full justify-start"}
                                    style={index == route_id ? undefined : { color: "var(--text-secondary)" }}
                                >
                                    <val.icon className="text-xl" aria-hidden="true" />
                                    {val.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
            {showscroll && (
                <motion.span style={{ scaleX: scrollYProgress, transformOrigin: "0%", background: "var(--accent)" }} className="h-1"></motion.span>
            )}
        </motion.nav>
    )
}
