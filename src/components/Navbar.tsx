"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { HiArrowUpRight, HiBars3, HiXMark } from "react-icons/hi2";
const routes = [["Home", "/"], ["Projects", "/projects"], ["Skills", "/skills"], ["Certificates", "/certificates"], ["Playground", "/app"]];
export default function Navbar({ route_id: _routeId, showScroll: _showScroll }: { route_id?: number; showScroll?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
      if (event.key === "Tab") {
        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("#site-navigation a"));
        const first = links[0];
        const last = toggle.current;
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.querySelector<HTMLAnchorElement>("#site-navigation a")?.focus();
    document.addEventListener("keydown", escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", escape); };
  }, [open]);
  return <header className="site-header nav"><a className="skip-link" href="#main-content">Skip to content</a><div className="wrap nav-bar">
    <Link href="/" className="wordmark" aria-label="Ohm Phongphat home" onClick={() => setOpen(false)}>ohm<span>.</span></Link>
    <nav aria-label="Main navigation" id="site-navigation" className={`site-nav ${open ? "is-open" : ""}`}>
      {routes.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
      <Link href="/contact" className="nav-contact" aria-current={pathname === "/contact" ? "page" : undefined} onClick={() => setOpen(false)}>Say hello <HiArrowUpRight aria-hidden="true" /></Link>
    </nav>
    <button ref={toggle} type="button" className="menu-toggle" aria-controls="site-navigation" aria-expanded={open} aria-label={open ? "Close navigation menu" : "Open navigation menu"} onClick={() => setOpen(!open)}>{open ? <HiXMark /> : <HiBars3 />}</button>
  </div></header>;
}
