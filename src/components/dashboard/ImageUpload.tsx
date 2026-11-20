"use client";
import { useRef, useState } from "react";
import { imageSrc } from "@/lib/image";
export default function ImageUpload({ value, onChange }: { value: string | null; onChange: (value: string | null) => void }) {
 const input = useRef<HTMLInputElement>(null); const [uploading,setUploading] = useState(false); const [error,setError] = useState("");
 async function upload(file?: File) { if (!file) return; setError(""); if (file.size > 10*1024*1024) { setError("ขนาดไฟล์ต้องไม่เกิน 10 MiB"); return; } setUploading(true);
 try { const form = new FormData(); form.set("file",file); form.set("ownerType","PROJECT"); const response = await fetch("/api/uploads",{ method:"POST", body:form }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "อัปโหลดไม่สำเร็จ"); onChange(data.file.url); } catch(e) {setError(e instanceof Error ? e.message : "อัปโหลดไม่สำเร็จ");} finally {setUploading(false);} }
 const preview = imageSrc(value);
 return <div className="flex flex-col gap-2"><span>รูปโปรเจกต์</span>{preview && <img src={preview} alt="Preview" className="aspect-video w-full rounded-box object-cover"/>}<div className="flex gap-2"><button type="button" className="btn btn-outline" disabled={uploading} onClick={()=>input.current?.click()}>{uploading ? "กำลังอัปโหลด…" : "เลือกรูปภาพ (ไม่เกิน 10 MiB)"}</button>{value && <button type="button" className="btn btn-error" onClick={()=>onChange(null)}>นำรูปออก</button>}</div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e=>upload(e.target.files?.[0])}/>{error && <p role="alert" className="text-error">{error}</p>}</div>;
}
