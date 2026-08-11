import Link from "next/link";
import { FaCopyright, FaGithub, FaHeart, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Skills", href: "/skills" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
];

const socials = [
    { label: "GitHub", href: "https://github.com/Phongphat-ohm", icon: FaGithub },
    { label: "Email", href: "mailto:mr.phongphat.p@gmail.com", icon: MdEmail },
    { label: "Phone", href: "tel:0654564610", icon: FaPhone },
];

export default function Footer() {
    return (
        <footer className="relative mt-auto overflow-hidden bg-base-300">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col gap-3">
                        <Link href={"/"} className="text-2xl font-bold tracking-wide nunito">
                            Portfolio<span className="text-primary">.</span>
                        </Link>
                        <p className="max-w-xs text-sm leading-6 text-base-content/60">
                            A personal portfolio showcasing my skills and projects as a full stack developer.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                            Quick Links
                        </h3>
                        <ul className="grid grid-cols-2 gap-2">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-base-content/60 transition-colors hover:text-primary"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-base-content/70">
                            Connect
                        </h3>
                        <div className="flex gap-3">
                            {socials.map(({ label, href, icon: Icon }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex size-10 items-center justify-center rounded-full border border-base-content/10 bg-base-100 text-base-content/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                                >
                                    <Icon className="text-lg" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-base-content/10 pt-6 text-sm text-base-content/60 sm:flex-row">
                    <span className="flex items-center gap-2">
                        &copy; {new Date().getFullYear()} Ohm Phongphat Phesatcha
                    </span>
                    <span className="flex items-center gap-1.5">
                        Made with <FaHeart className="text-primary" /> using Next.js
                    </span>
                </div>
            </div>
        </footer>
    );
}
