import type { Metadata } from "next";
import { Kanit, Hanken_Grotesk, Newsreader } from "next/font/google";
import Script from "next/script";
import VisitTracker from "@/components/VisitTracker";
import PortfolioMotion from "@/components/PortfolioMotion";
import "./globals.css";

const kanitFont = Kanit({
  weight: ["400", "500", "600"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  preload: false,
});

const textFont = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" });
const displayFont = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: { default: "Ohm Phongphat — Full stack developer", template: "%s | Ohm Phongphat" },
  description: "Portfolio website of Ohm Phongphat, Full Stack Developer.",
  openGraph: { title: "Ohm Phongphat — Full stack developer", description: "Projects, skills, and experiments by Phongphat Phesatcha.", images: [{ url: "/images/self-photo.webp", alt: "Ohm Phongphat" }], type: "website" },
  twitter: { card: "summary", title: "Ohm Phongphat — Full stack developer" },
  other: { "page-type": "service", "site-kind": "other" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kanitFont.variable} ${textFont.variable} ${displayFont.variable}`} data-theme="light" data-type="service" data-radius="soft" data-buttons="solid" data-motion="live">
      <head><link rel="stylesheet" href="/assets/motion/motion.css" /></head>
      <Script id="portfolio-entrance" strategy="beforeInteractive">{`document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)`}</Script>
      <body
        className="antialiased"
      >
        {children}
        <VisitTracker />
        <PortfolioMotion />
        <Script src="/assets/motion/motion.js" type="module" strategy="afterInteractive" />
      </body>
    </html>
  );
}
