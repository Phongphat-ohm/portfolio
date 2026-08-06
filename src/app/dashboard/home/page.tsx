import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyVisits } from "@/lib/analytics";
import LogoutButton from "@/components/dashboard/LogoutButton";
import ProjectTable from "@/components/dashboard/ProjectTable";
import VisitorsChart from "@/components/dashboard/VisitorsChart";
import {
    FaCircleCheck,
    FaFolderOpen,
    FaHourglassHalf,
    FaShieldCat,
    FaTags,
} from "react-icons/fa6";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/dashboard");
    }

    const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
    });

    const dailyVisits = await getDailyVisits(30);

    const total = projects.length;
    const completed = projects.filter((p) => p.status === "completed").length;
    const inProgress = projects.filter((p) => p.status === "in_progress").length;
    const categories = new Set(projects.flatMap((p) => p.categories)).size;

    const stats = [
        {
            label: "โปรเจกต์ทั้งหมด",
            value: total,
            icon: <FaFolderOpen />,
            accent: "from-primary to-secondary",
            shadow: "shadow-primary/30",
        },
        {
            label: "เสร็จแล้ว",
            value: completed,
            icon: <FaCircleCheck />,
            accent: "from-success to-emerald-700",
            shadow: "shadow-success/30",
        },
        {
            label: "กำลังพัฒนา",
            value: inProgress,
            icon: <FaHourglassHalf />,
            accent: "from-warning to-amber-600",
            shadow: "shadow-warning/30",
        },
        {
            label: "หมวดหมู่",
            value: categories,
            icon: <FaTags />,
            accent: "from-info to-sky-600",
            shadow: "shadow-info/30",
        },
    ];

    return (
        <main className="min-h-screen bg-base-100 text-base-content">
            <header className="sticky top-0 z-40 border-b border-base-content/10 bg-base-200/70 backdrop-blur-xl">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-lg text-primary-content shadow-md shadow-primary/30">
                            <FaShieldCat />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold nunito sm:text-xl">
                                Portfolio. Admin
                            </h1>
                            <p className="text-xs text-base-content/60">
                                ระบบจัดการโปรเจกต์ส่วนตัว
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden items-center gap-2 rounded-full border border-base-content/10 bg-base-100 px-3 py-1.5 sm:flex">
                            <span className="size-2 rounded-full bg-success" />
                            <span className="text-sm font-medium">{user.username}</span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="card border border-base-content/10 bg-base-200/60 shadow-sm transition-transform duration-200 hover:-translate-y-0.5"
                        >
                            <div className="card-body flex-row items-center gap-4 p-5">
                                <div
                                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.accent} text-xl text-white shadow-lg ${stat.shadow}`}
                                >
                                    {stat.icon}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm text-base-content/60">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold leading-tight">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <VisitorsChart data={dailyVisits} />

                <div className="mt-5">
                    <ProjectTable projects={projects} />
                </div>
            </div>
        </main>
    );
}
