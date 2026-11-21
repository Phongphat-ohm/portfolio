"use client";

import Link from "next/link";
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);
        fetch("/api/auth/me", { signal: controller.signal })
            .then((res) => {
                if (res.ok) router.replace("/dashboard/home");
            })
            .catch(() => {})
            .finally(() => {
                clearTimeout(timeout);
                setChecking(false);
            });
        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, [router]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError("");
        setLoading(true);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: formData.get("username"),
                    password: formData.get("password"),
                }),
                signal: controller.signal,
            });
            clearTimeout(timeout);
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล");
                return;
            }
            router.replace("/dashboard/home");
            router.refresh();
        } catch (error) {
            setError(
                (error as Error)?.name === "AbortError"
                    ? "ระบบใช้เวลาตอบสนองนานเกินไป (ฐานข้อมูลอาจไม่สามารถเชื่อมต่อได้) กรุณาลองใหม่อีกครั้ง"
                    : "การเชื่อมต่อขัดข้อง กรุณาลองใหม่"
            );
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <main id="main-content" className="flex min-h-screen items-center justify-center bg-base-100 text-base-content">
                <div className="flex flex-col items-center gap-3">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="text-sm text-base-content/60">กำลังตรวจสอบสิทธิ์…</p>
                </div>
            </main>
        );
    }

    return <main id="main-content" className="login-shell"><div className="login-layout">
      <aside className="login-story"><Link href="/" className="wordmark">ohm<span>.</span></Link><div><h2>A space for<br />what comes next.</h2><p>จัดการโปรเจกต์ รูปภาพ และติดตามผลงานทั้งหมดในที่เดียว</p></div><p>Phongphat · Portfolio admin</p></aside>
      <div className="login-form"><h1>Welcome back.</h1><p>เข้าสู่ระบบเพื่อจัดการผลงานของคุณ</p><form className="form-stack" onSubmit={handleSubmit}>
        <label><span className="field-label">ชื่อผู้ใช้ / Username</span><input className="input w-full" name="username" autoComplete="username" required placeholder="Your username" /></label>
        <label><span className="field-label">รหัสผ่าน / Password</span><input className="input w-full" name="password" type="password" autoComplete="current-password" required placeholder="Your password" /></label>
        {error && <div className="alert alert-error text-sm" role="alert">{error}</div>}
        <button className="btn btn-primary w-full" disabled={loading}>{loading ? <><span className="loading loading-spinner loading-sm" /> Signing in…</> : <>Sign in <FaArrowRight /></>}</button>
      </form><Link href="/" className="text-link mt-8">Back to portfolio</Link></div>
    </div></main>;
}
