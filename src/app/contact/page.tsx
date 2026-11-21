import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHeading from "@/components/PageHeading";
import Image from "next/image";
import { FaGithub } from "react-icons/fa6";
import { HiArrowUpRight, HiOutlineEnvelope, HiOutlinePhone } from "react-icons/hi2";
const contacts = [
  { label: "Email me", value: "For an idea, a collaboration, or just a hello.", href: "mailto:mr.phongphat.p@gmail.com", icon: HiOutlineEnvelope },
  { label: "Find me on GitHub", value: "Phongphat-ohm", href: "https://github.com/Phongphat-ohm", icon: FaGithub },
  { label: "Give me a call", value: "Let’s talk about what you have in mind.", href: "tel:0654564610", icon: HiOutlinePhone },
];
export default function Page() {
  return <><Navbar /><main id="main-content" className="wrap page-content"><PageHeading title="Let’s say hello.">Have something in mind? I’m happy to talk about software, exchange ideas, or hear what you’re working on.</PageHeading><div className="contact-layout"><div className="contact-list">{contacts.map(({ label, value, href, icon: Icon }) => <a href={href} key={label} className="contact-row" {...(href.startsWith("https") ? { target: "_blank", rel: "noopener noreferrer" } : {})}><Icon className="contact-icon" /><div><h2>{label}</h2><p>{value}</p></div><HiArrowUpRight aria-hidden="true" /></a>)}</div><div className="contact-portrait"><Image src="/images/self-photo2.png" alt="Phongphat Phesatcha" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain object-bottom" /></div></div></main><Footer /></>;
}
