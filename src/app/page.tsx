import FeaturedProjectVisual from "@/components/FeaturedProjectVisual";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import VisitorStats from "@/components/VisitorStats";
import Image from "next/image";
import Link from "next/link";
import { HiArrowDown, HiArrowRight, HiArrowUpRight } from "react-icons/hi2";
export default function Home() {
  return <><Navbar /><main id="main-content">
    <section className="hero home-hero" data-enter><div className="wrap hero-grid">
      <div className="hero-copy"><h1>Ohm Phongphat.<br /><em>Full stack</em><br />developer.</h1><p>I build with Next.js, JavaScript, and C#. From the interface to the backend, I follow the ideas that make me curious.</p>
        <div className="hero-actions"><Link href="/projects" className="btn btn-primary">Explore projects <HiArrowUpRight aria-hidden="true" /></Link><Link href="/contact" className="text-link">Say hello <HiArrowRight aria-hidden="true" /></Link></div>
        <div className="hero-note"><span>Next.js · JavaScript · C#</span><a href="#explore" aria-label="Scroll to explore"><HiArrowDown /></a></div>
      </div>
      <div className="portrait-frame" data-visual><span className="portrait-type" aria-hidden="true">hello.</span><Image src="/images/self-photo.webp" alt="Ohm Phongphat" width={720} height={960} priority sizes="(min-width: 1024px) 50vw, 100vw" className="portrait-image" /></div>
    </div></section>
    <section id="explore" className="explore-section screen-section"><div className="wrap">
      <div className="section-heading"><h2>Projects, skills & experiments.</h2></div>
      <div className="explore-layout">
        <Link href="/projects" className="explore-feature"><div><h3>Things I’ve built.</h3><p>Web projects, desktop apps, and the work in between.</p></div><HiArrowUpRight className="feature-arrow" aria-hidden="true" /><FeaturedProjectVisual /></Link>
        <div className="explore-links"><Link href="/skills"><div><h3>Skills & tools.</h3><p>The languages and tools I work with.</p><div className="icon-row" aria-hidden="true"><img src="/images/language/javascript.png" alt="" width={30} height={30} loading="lazy" /><img src="/images/library/next-js.png" alt="" width={30} height={30} loading="lazy" /><img src="/images/language/csharp.png" alt="" width={30} height={30} loading="lazy" /><img src="/images/database/postgresql.webp" alt="" width={30} height={30} loading="lazy" /></div></div><HiArrowUpRight /></Link><Link href="/app"><div><h3>Room to experiment.</h3><p>Small tools. Practical ideas. Try them out.</p><span className="text-link">Open the playground <HiArrowRight /></span></div><HiArrowUpRight /></Link><Link href="/certificates"><div><h3>Certificates & milestones.</h3><p>Certificates and milestones along the way.</p></div><HiArrowUpRight /></Link></div>
      </div>
    </div></section>
    <section className="statement-section screen-section" data-moment="word-highlight"><div className="wrap"><h2 className="mo-wh__text">From the first interface to the last API call, I like making the pieces <strong>work together.</strong></h2><Link href="/skills" className="btn btn-primary">Explore my toolkit <HiArrowRight /></Link><VisitorStats /></div></section>
  </main><Footer /></>;
}
