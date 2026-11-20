import { FaCopyright } from "react-icons/fa6";

export default function Footer() {
    return (
        <>
            <footer className="flex flex-col items-center justify-center gap-2 border-t p-8 text-center text-sm sm:flex-row" style={{ background: "var(--surface-soft)", borderColor: "var(--border-soft)", color: "var(--text-tertiary)" }}>
                <FaCopyright />
                <span>Create By Ohm Phongphat Phesatcha</span>
            </footer>
        </>
    )
}
