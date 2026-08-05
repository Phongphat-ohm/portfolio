"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    FaArrowRight,
    FaFolderOpen,
    FaGaugeHigh,
    FaLock,
    FaShieldCat,
    FaUser,
    FaUserShield,
} from "react-icons/fa6";

export default function DashboardPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => {
                if (res.ok) router.replace("/dashboard/home");
            })
            .finally(() => setChecking(false));
    }, [router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password"),
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "Login failed");
                return;
            }
            router.replace("/dashboard/home");
            router.refresh();
        } catch {
            setError("Something went wrong, please try again");
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-base-100 text-base-content">
                <div className="flex flex-col items-center gap-3">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-sm text-base-content/60">กำลังตรวจสอบสิทธิ์…</p>
                </div>
            </main>
        );
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 px-4 py-10">
            {/* decorative glow */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

            <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-base-content/10 bg-base-200/80 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
                {/* brand panel */}
                <div className="relative hidden flex-col justify-between gap-10 bg-gradient-to-br from-primary via-primary to-secondary p-8 text-primary-content lg:flex">
                    <div className="flex items-center gap-3">
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-content/15 text-2xl backdrop-blur">
                            <FaShieldCat />
                        </div>
                        <span className="text-xl font-bold">Portfolio. Admin</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold leading-tight">
                            จัดการโปรเจกต์
                            <br />
                            ในที่เดียว
                        </h1>
                        <p className="mt-3 text-sm text-primary-content/80">
                            เพิ่ม แก้ไข ลบโปรเจกต์ พร้อมอัปโหลดรูปภาพผ่านระบบบริหารจัดการส่วนตัว
                        </p>
                        <ul className="mt-6 space-y-2 text-sm">
                            <li className="flex items-center gap-2.5">
                                <FaFolderOpen className="text-primary-content/90" />
                                จัดการรูปภาพโปรเจกต์
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FaGaugeHigh className="text-primary-content/90" />
                                ดูสถานะทุกโปรเจกต์
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FaLock className="text-primary-content/90" />
                                เข้าถึงเฉพาะผู้ดูแล
                            </li>
                        </ul>
                    </div>
                    <p className="text-xs text-primary-content/60">
                        © {new Date().getFullYear()} PHONGPHAT
                    </p>
                </div>

                {/* form panel */}
                <div className="p-8 sm:p-10">
                    <div className="mb-8 flex flex-col items-center text-center">
                        <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary text-3xl text-primary-content shadow-lg shadow-primary/30">
                            <FaUserShield />
                        </div>
                        <h2 className="text-2xl font-bold">เข้าสู่ระบบ</h2>
                        <p className="mt-1 text-sm text-base-content/60">
                            ยินดีต้อนรับกลับ กรุณาใส่ข้อมูลเพื่อดำเนินการต่อ
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="form-control w-full">
                            <span className="label-text mb-2 flex items-center gap-1.5">
                                <FaUser className="text-base-content/50" />
                                ชื่อผู้ใช้
                            </span>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                required
                                autoComplete="off"
                                placeholder="phongphat"
                                className="input input-bordered h-12 w-full bg-base-100 focus:border-primary focus:outline-none"
                            />
                        </label>
                        <label className="form-control w-full">
                            <span className="label-text mb-2 flex items-center gap-1.5">
                                <FaLock className="text-base-content/50" />
                                รหัสผ่าน
                            </span>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                required
                                autoComplete="off"
                                placeholder="••••••••"
                                className="input input-bordered h-12 w-full bg-base-100 focus:border-primary focus:outline-none"
                            />
                        </label>

                        {error && (
                            <div className="alert alert-error py-2.5 text-sm">
                                <span>{error}</span>
                            </div>
                        )}

                        <button className="btn btn-primary mt-2 h-12 shadow-lg shadow-primary/30" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    กำลังเข้าสู่ระบบ…
                                </>
                            ) : (
                                <>
                                    เข้าสู่ระบบ <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
