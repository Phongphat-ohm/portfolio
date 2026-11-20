"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash } from "react-icons/fa6";

interface DeleteButtonProps {
    id: string;
    name: string;
}

export default function DeleteButton({ id, name }: DeleteButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("delete failed");
            setOpen(false);
            router.refresh();
        } catch {
            alert("ลบโปรเจกต์ล้มเหลว");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn btn-error btn-sm"
                aria-label={`ลบ ${name}`}
            >
                <FaTrash />
            </button>

            <dialog open={open} className="modal">
                <div className="modal-box">
                    <h3 className="text-lg font-bold">ยืนยันการลบ</h3>
                    <p className="py-4 text-sm text-base-content/80">
                        ต้องการลบโปรเจกต์ <strong className="text-base-content">{name}</strong>{" "}
                        และรูปที่เกี่ยวข้องหรือไม่? การกระทำนี้ย้อนกลับไม่ได้
                    </p>
                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setOpen(false)}
                            disabled={loading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            className="btn btn-error"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                "ลบเลย"
                            )}
                        </button>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button onClick={() => setOpen(false)}>ปิด</button>
                </form>
            </dialog>
        </>
    );
}
