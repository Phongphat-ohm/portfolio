import { FaCopyright } from "react-icons/fa6";

export default function Footer() {
    return (
        <>
            <footer className="flex flex-col items-center justify-center gap-2 bg-base-300 p-8 text-center text-sm text-base-content/70 sm:flex-row">
                <FaCopyright />
                <span>Create By Ohm Phongphat Phesatcha</span>
            </footer>
        </>
    )
}
