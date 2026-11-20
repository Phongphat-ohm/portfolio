"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { HiLockClosed } from "react-icons/hi";

export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    router.push("/dashboard/admin");
  };

  return (
    <main className="site-page modern-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="modern-card w-full max-w-md p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
          <HiLockClosed className="text-2xl" />
        </div>
        <p className="eyebrow mt-6">เข้าสู่ระบบผู้ดูแล</p>
        <h1 className="section-title mt-2">ระบบจัดการ Portfolio</h1>
        <p className="body-copy mt-3">
          เข้าสู่ระบบเพื่อจัดการโปรเจกต์ เกียรติบัตร รูปภาพ และไฟล์แนบ
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <label>
            <span className="mb-2 block text-sm font-semibold">ชื่อผู้ใช้หรืออีเมล</span>
            <input name="username" required autoComplete="username" className="apple-input" />
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold">รหัสผ่าน</span>
            <input name="password" type="password" required autoComplete="current-password" className="apple-input" />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="apple-button mt-2">
            {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </section>
    </main>
  );
}
