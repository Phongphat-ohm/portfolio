"use client";

import { useRouter } from "next/navigation";
import { FaRightFromBracket } from "react-icons/fa6";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/dashboard");
        router.refresh();
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="btn btn-outline btn-sm border-base-content/20 hover:border-error hover:bg-error hover:text-error-content"
        >
            <FaRightFromBracket /> Logout
        </button>
    );
}
