"use client";

import { useRef, useState } from "react";
import { FaImage, FaTrash } from "react-icons/fa6";
import { imageSrc } from "@/lib/image";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]);

interface ImageUploadProps {
    value: string | null;
    onChange: (value: string | null) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (file: File | undefined) => {
        if (!file) return;
        setError("");

        if (!ALLOWED_TYPES.has(file.type)) {
            setError("ประเภทไฟล์ต้องเป็น png/jpg/webp/gif/svg เท่านั้น");
            return;
        }
        if (file.size > MAX_SIZE) {
            setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setError(data?.error ?? "อัปโหลดไฟล์ล้มเหลว");
                return;
            }

            onChange(data.filename as string);
        } catch {
            setError("เกิดข้อผิดพลาดระหว่างอัปโหลด");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        setError("");
        if (value) {
            try {
                await fetch(`/api/uploads/${value}`, { method: "DELETE" });
            } catch {
                // ไม่เป็นไรถ้าลบไฟล์ไม่สำเร็จ
            }
        }
        onChange(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    const preview = imageSrc(value);

    return (
        <div className="flex flex-col gap-2">
            <span className="label-text mb-1">รูปโปรเจกต์</span>
            {preview ? (
                <div className="relative w-full overflow-hidden rounded-box border border-base-content/10">
                    <img
                        src={preview}
                        alt="Preview"
                        className="aspect-video w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="btn btn-error btn-sm absolute right-2 top-2"
                    >
                        <FaTrash /> ลบรูป
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-box border-2 border-dashed border-base-content/20 bg-base-100 text-base-content/60 transition-colors hover:border-primary hover:text-primary"
                >
                    {uploading ? (
                        <span className="loading loading-spinner loading-lg" />
                    ) : (
                        <>
                            <FaImage className="text-3xl" />
                            <span className="text-sm font-medium">
                                คลิกเพื่อเลือกรูป หรือลากวางได้ (≤ 5MB)
                            </span>
                        </>
                    )}
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {error && <p className="text-sm text-error">{error}</p>}
        </div>
    );
}
