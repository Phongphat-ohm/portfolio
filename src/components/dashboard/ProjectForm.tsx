"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen, FaPlus, FaXmark } from "react-icons/fa6";
import ImageUpload from "./ImageUpload";
import { CATEGORY_OPTIONS, type Project } from "./types";

interface ProjectFormProps {
    project: Project | null;
    onClose: () => void;
}

export default function ProjectForm({ project, onClose }: ProjectFormProps) {
    const router = useRouter();
    const isEdit = project !== null;

    const [name, setName] = useState(project?.name ?? "");
    const [description, setDescription] = useState(project?.description ?? "");
    const [year, setYear] = useState(project?.year ?? String(new Date().getFullYear()));
    const [status, setStatus] = useState<Project["status"]>(project?.status ?? "completed");
    const [tags, setTags] = useState(project?.tags.join(", ") ?? "");
    const [categories, setCategories] = useState<string[]>(project?.categories ?? []);
    const [github, setGithub] = useState(project?.github ?? "");
    const [demo, setDemo] = useState(project?.demo ?? "");
    const [image, setImage] = useState<string | null>(project?.image ?? null);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const toggleCategory = (value: string) => {
        setCategories((prev) =>
            prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
        );
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        const payload = {
            name: name.trim(),
            description: description.trim(),
            year: year.trim(),
            status,
            tags: tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean),
            categories,
            image,
            github: github.trim() || null,
            demo: demo.trim() || null,
        };

        try {
            const res = await fetch(
                isEdit ? `/api/admin/projects/${project.id}` : "/api/admin/projects",
                {
                    method: isEdit ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "บันทึกโปรเจกต์ล้มเหลว");
                return;
            }
            router.refresh();
            onClose();
        } catch {
            setError("เกิดข้อผิดพลาดระหว่างบันทึก");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="card my-8 w-full max-w-2xl overflow-hidden rounded-2xl bg-base-200 shadow-2xl">
                <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-info" />
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-xl font-bold">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-sm text-primary-content shadow-md shadow-primary/30">
                                {isEdit ? <FaPen /> : <FaPlus />}
                            </span>
                            {isEdit ? "แก้ไขโปรเจกต์" : "เพิ่มโปรเจกต์"}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost btn-sm btn-square"
                            aria-label="ปิด"
                        >
                            <FaXmark className="text-xl" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-4">
                        <label className="form-control w-full">
                            <span className="label-text mb-1">ชื่อโปรเจกต์ *</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="input input-bordered w-full"
                                placeholder="ชื่อโปรเจกต์"
                            />
                        </label>

                        <label className="form-control w-full">
                            <span className="label-text mb-1">คำอธิบาย *</span>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="textarea textarea-bordered w-full"
                                rows={4}
                                placeholder="รายละเอียดโปรเจกต์"
                            />
                        </label>

                        <ImageUpload value={image} onChange={setImage} />

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="form-control w-full">
                                <span className="label-text mb-1">ปี</span>
                                <input
                                    type="text"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="เช่น 2026"
                                />
                            </label>
                            <label className="form-control w-full">
                                <span className="label-text mb-1">สถานะ</span>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as Project["status"])}
                                    className="select select-bordered w-full"
                                >
                                    <option value="completed">Completed</option>
                                    <option value="in_progress">In Progress</option>
                                </select>
                            </label>
                        </div>

                        <label className="form-control w-full">
                            <span className="label-text mb-1">Tags (คั่นด้วย ,)</span>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="input input-bordered w-full"
                                placeholder="Next.js, TypeScript, Tailwind CSS"
                            />
                        </label>

                        <div className="form-control w-full">
                            <span className="label-text mb-2">Categories</span>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_OPTIONS.map((option) => {
                                    const active = categories.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => toggleCategory(option.value)}
                                            className={`badge badge-lg cursor-pointer transition-colors ${
                                                active
                                                    ? "badge-primary"
                                                    : "badge-outline bg-base-100"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="form-control w-full">
                                <span className="label-text mb-1">GitHub URL</span>
                                <input
                                    type="url"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://github.com/..."
                                />
                            </label>
                            <label className="form-control w-full">
                                <span className="label-text mb-1">Demo URL</span>
                                <input
                                    type="url"
                                    value={demo}
                                    onChange={(e) => setDemo(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://..."
                                />
                            </label>
                        </div>

                        {error && <p className="text-sm text-error">{error}</p>}

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="btn btn-ghost">
                                ยกเลิก
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary shadow-lg shadow-primary/30"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <span className="loading loading-spinner loading-sm" />
                                ) : isEdit ? (
                                    "บันทึกการแก้ไข"
                                ) : (
                                    "เพิ่มโปรเจกต์"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
