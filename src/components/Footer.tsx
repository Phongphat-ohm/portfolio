import Link from "next/link";
import { HiArrowUpRight } from "react-icons/hi2";
export default function Footer() {
  return <footer className="site-footer closing"><div className="wrap">
    <div className="footer-top"><Link href="/contact" className="footer-invitation">Good things start<br />with a hello.<HiArrowUpRight aria-hidden="true" /></Link><div className="footer-links"><a href="https://github.com/Phongphat-ohm" target="_blank" rel="noopener noreferrer">GitHub <HiArrowUpRight /></a><a href="mailto:mr.phongphat.p@gmail.com">Email <HiArrowUpRight /></a><a href="tel:0654564610">Phone <HiArrowUpRight /></a><Link href="/dashboard">Admin <HiArrowUpRight /></Link></div></div>
    <div className="footer-bottom"><Link href="/" className="wordmark">ohm<span>.</span></Link><span>© {new Date().getFullYear()} Phongphat Phesatcha</span><span>Built with Next.js. Made by me.</span></div>
  </div></footer>;
}
