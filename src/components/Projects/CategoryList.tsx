"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowUpRightFromSquare, FaCalendar, FaFolder, FaGithub, FaLocationArrow } from "react-icons/fa6";
import { imageSrc } from "@/lib/image";

interface Project {
    id: string;
    name: string;
    description: string;
    image: string | null;
    tags: string[];
    categories: string[];
    year: string;
    status: "completed" | "in_progress";
    github: string | null;
    demo: string | null;
}

type UiStatus = "completed" | "in-progress";

const statusStyles = {
    completed: {
        label: "Completed",
        className: "bg-success text-success-content",
    },
    "in-progress": {
        label: "In Progress",
        className: "bg-warning text-warning-content",
    },
} as const;

export default function ProjectsList({ category }: { category: string }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const params = new URLSearchParams();
        if (category && category !== "all") params.set("category", category);

        fetch(`/api/projects?${params.toString()}`)
            .then((res) => res.json())
            .then((data) => {
                if (!cancelled) setProjects(data.projects ?? []);
            })
            .catch(() => {
                if (!cancelled) setProjects([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [category]);

    const mainLink = (project: Project) =>
        project.demo ?? project.github ?? "https://github.com";

    return (
        <div className="relative min-h-96">
            {loading ? (
                <div className="mt-5 flex min-h-72 flex-col items-center justify-center gap-3 rounded-box bg-base-200 text-center">
                    <span className="loading loading-spinner loading-lg" />
                    <h1 className="text-lg font-semibold">Loading projects...</h1>
                </div>
            ) : (
                <div className="relative mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {projects.map((project) => {
                        const status: UiStatus =
                            project.status === "in_progress" ? "in-progress" : "completed";
                        const style = statusStyles[status];
                        const isInProgress = status === "in-progress";

                        return (
                            <article
                                key={project.id}
                                className="group card overflow-hidden bg-base-200 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                            >
                                <Link
                                    href={mainLink(project)}
                                    target="_blank"
                                    className="relative block aspect-video overflow-hidden"
                                >
                                    {project.image ? (
                                        <img
                                            src={imageSrc(project.image) ?? undefined}
                                            alt={project.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/40 to-secondary/40">
                                            <FaFolder className="text-5xl text-base-content/50" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                    <div className="absolute bottom-3 right-3 flex translate-y-2 items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-content opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        View project <FaArrowUpRightFromSquare />
                                    </div>
                                </Link>

                                <div className="flex flex-1 flex-col gap-4 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span
                                            className={`badge badge-sm font-semibold ${style.className}`}
                                        >
                                            {style.label}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-base-content/60">
                                            <FaCalendar /> {project.year}
                                        </span>
                                    </div>

                                    <Link href={mainLink(project)} target="_blank">
                                        <h2 className="text-lg font-bold text-base-content transition-colors group-hover:text-primary">
                                            {project.name}
                                        </h2>
                                    </Link>
                                    <p className="line-clamp-3 flex-1 text-sm leading-6 text-base-content/70">
                                        {project.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5">
                                        {project.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="badge badge-sm badge-outline badge-primary bg-base-100 font-medium"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 border-t border-base-content/10 pt-4">
                                        {project.demo && (
                                            <Link
                                                href={project.demo}
                                                target="_blank"
                                                className="btn btn-primary btn-sm flex-1"
                                            >
                                                {isInProgress ? "Live Preview" : "Demo"} <FaLocationArrow />
                                            </Link>
                                        )}
                                        {project.github && (
                                            <Link
                                                href={project.github}
                                                target="_blank"
                                                aria-label={`${project.name} on GitHub`}
                                                className="btn btn-ghost btn-sm btn-square border border-base-content/10"
                                            >
                                                <FaGithub className="text-lg" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!loading && projects.length === 0 && (
                <div className="mt-5 flex min-h-72 flex-col items-center justify-center gap-3 rounded-box bg-base-200 text-center">
                    <FaFolder className="text-5xl text-base-content/30" />
                    <h1 className="text-lg font-semibold">No projects in this category yet</h1>
                    <p className="max-w-sm text-sm text-base-content/60">
                        Please select another category to explore more projects.
                    </p>
                </div>
            )}
        </div>
    );
}
