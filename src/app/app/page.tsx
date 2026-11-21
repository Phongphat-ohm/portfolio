import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeading from "@/components/PageHeading";
import { HiArrowUpRight, HiOutlinePuzzlePiece } from "react-icons/hi2";
const tools = [
 { href: "/app/dbcons", image: "/icons/cloud-computing.png", title: "Connection string generator", description: "Put your database connection details into the right format." },
 { href: "/app/jwt-secret", image: "/icons/key.png", title: "JWT secret generator", description: "Generate a random key, choose a format, and copy it." },
 { href: "/app/christmas_game", image: "", title: "Christmas adventure", description: "A small puzzle game. Take a break and try it out." },
];
export default function AppPage() {
  return <><Navbar /><main id="main-content" className="wrap page-content"><PageHeading title="Room to experiment.">A collection of small tools and side projects. Some help with the work. Some are just for fun.</PageHeading><div className="tool-list">{tools.map(tool => <Link href={tool.href} key={tool.href} className="tool-card">{tool.image ? <img src={tool.image} alt="" width={60} height={60} /> : <HiOutlinePuzzlePiece className="text-primary" size={44} />}<div><h2>{tool.title}</h2><p>{tool.description}</p></div><HiArrowUpRight aria-hidden="true" /></Link>)}</div></main><Footer /></>;
}
