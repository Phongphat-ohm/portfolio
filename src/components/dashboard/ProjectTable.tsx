"use client";

import { useState } from "react";
import {
    FaCalendar,
    FaFolder,
    FaFolderOpen,
    FaLink,
    FaPen,
    FaPlus,
} from "react-icons/fa6";
import DeleteButton from "./DeleteButton";
import ProjectForm from "./ProjectForm";
import { STATUS_LABELS, type Project } from "./types";
import { imageSrc } from "@/lib/image";

const statusStyles: Record<Project["status"], { label: string; className: string; dot: string }> = {
    completed: {
        label: STATUS_LABELS.completed,
        className: "badge-success/20 text-success",
        dot: "bg-success",
    },
    in_progress: {
        label: STATUS_LABELS.in_progress,
        className: "badge-warning/20 text-warning",
        dot: "bg-warning",
    },
};

export default function ProjectTable({ projects }: { projects: Project[] }) {
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);

    const openCreate = () => {
        setEditing(null);
        setShowForm(true);
    };

    const openEdit = (project: Project) => {
        setEditing(project);
        setShowForm(true);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/50 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <FaFolderOpen className="text-primary" />
                    รายการโปรเจกต์
                    <span className="badge badge-ghost badge-sm">{projects.length} รายการ</span>
                </h2>
                <button
                    type="button"
                    onClick={openCreate}
                    className="btn btn-primary btn-sm shadow-md shadow-primary/30"
                >
                    <FaPlus /> เพิ่มโปรเจกต์
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                    <thead>
                        <tr className="text-base-content/60">
                            <th>รูป</th>
                            <th>ชื่อ</th>
                            <th>ปี</th>
                            <th>สถานะ</th>
                            <th>Categories</th>
                            <th>ลิงก์</th>
                            <th className="text-right">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project.id} className="transition-colors hover:bg-base-200">
                                <td>
                                    <div className="avatar">
                                        <div className="h-12 w-20 overflow-hidden rounded-box bg-base-100 ring-1 ring-base-content/10">
                                            {project.image ? (
                                                <img
                                                    src={imageSrc(project.image) ?? undefined}
                                                    alt={project.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-base-content/40">
                                                    <FaFolder />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="max-w-56 font-semibold">
                                    <p className="truncate">{project.name}</p>
                                </td>
                                <td className="text-xs">
                                    <span className="flex items-center gap-1.5 text-base-content/70">
                                        <FaCalendar className="text-base-content/50" />
                                        {project.year}
                                    </span>
                                </td>
                                <td>
                                    <span
                                        className={`badge badge-sm gap-1 border-0 font-semibold ${statusStyles[project.status].className}`}
                                    >
                                        <span
                                            className={`size-1.5 rounded-full ${statusStyles[project.status].dot}`}
                                        />
                                        {statusStyles[project.status].label}
                                    </span>
                                </td>
                                <td className="max-w-56">
                                    <div className="flex flex-wrap gap-1">
                                        {project.categories.map((category) => (
                                            <span
                                                key={category}
                                                className="badge badge-outline badge-sm bg-base-100"
                                            >
                                                {category}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    {(project.github || project.demo) && (
                                        <span className="flex gap-1.5">
                                            {project.github && (
                                                <a
                                                    href={project.github}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-xs btn-square"
                                                    aria-label="GitHub"
                                                >
                                                    <FaLink />
                                                </a>
                                            )}
                                            {project.demo && (
                                                <a
                                                    href={project.demo}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-ghost btn-xs btn-square"
                                                    aria-label="Demo"
                                                >
                                                    <FaLink />
                                                </a>
                                            )}
                                        </span>
                                    )}
                                </td>
                                <td className="text-right">
                                    <div className="flex justify-end gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(project)}
                                            className="btn btn-warning btn-sm shadow-sm shadow-warning/20"
                                            aria-label={`แก้ไข ${project.name}`}
                                        >
                                            <FaPen />
                                        </button>
                                        <DeleteButton id={project.id} name={project.name} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                        <div className="flex size-20 items-center justify-center rounded-full border-2 border-dashed border-base-content/20 text-4xl text-base-content/30">
                            <FaFolder />
                        </div>
                        <div>
                            <p className="font-semibold">ยังไม่มีโปรเจกต์</p>
                            <p className="mt-1 text-sm text-base-content/60">
                                กดปุ่ม "เพิ่มโปรเจกต์" เพื่อเริ่มสร้างรายการแรกของคุณ
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <ProjectForm project={editing} onClose={() => setShowForm(false)} />
            )}
        </div>
    );
}
