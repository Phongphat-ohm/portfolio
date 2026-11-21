import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PageHeading from "@/components/PageHeading";
import Project from "@/components/Projects";
import { HiArrowUpRight } from "react-icons/hi2";
export default function Page() {
  return <><Navbar /><main id="main-content" className="page-content wrap"><PageHeading title="Things I’ve built." aside={<a href="https://github.com/Phongphat-ohm" target="_blank" rel="noopener noreferrer" className="text-link">Explore GitHub <HiArrowUpRight /></a>}>A collection of web projects, desktop apps, and ideas brought to life. Take a look around.</PageHeading><Project /></main><Footer /></>;
}
