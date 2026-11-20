"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiBadgeCheck, HiBriefcase, HiCloudUpload, HiCollection, HiLogout, HiRefresh } from "react-icons/hi";

type UploadedFile = {
  id: string;
  filename: string;
  mimeType: string;
  url: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description?: string | null;
  stack: string[];
  repoUrl?: string | null;
  liveUrl?: string | null;
  imageUrl?: string | null;
  fileId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  featured: boolean;
  published: boolean;
  sortOrder?: number;
};

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  fileId?: string | null;
  tags: string[];
  published: boolean;
  sortOrder?: number;
};

const emptyProject: Omit<Project, "id" | "slug"> & { slug?: string } = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  stack: [],
  repoUrl: "",
  liveUrl: "",
  imageUrl: "",
  fileId: "",
  startDate: "",
  endDate: "",
  featured: false,
  published: true,
  sortOrder: 0,
};

const emptyCertificate: Omit<Certificate, "id"> = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
  description: "",
  imageUrl: "",
  fileId: "",
  tags: [],
  published: true,
  sortOrder: 0,
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"projects" | "certificates">("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [certificateForm, setCertificateForm] = useState(emptyCertificate);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingCertificateId, setEditingCertificateId] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    const [meResponse, projectsResponse, certificatesResponse] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/projects?all=true"),
      fetch("/api/certificates?all=true"),
    ]);
    const me = await meResponse.json();

    if (!me.user) {
      router.push("/dashboard");
      return;
    }

    setProjects((await projectsResponse.json()).projects ?? []);
    setCertificates((await certificatesResponse.json()).certificates ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadFile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setMessage("อัปโหลดไม่สำเร็จ รองรับรูปภาพและ PDF ขนาดไม่เกิน 10 MiB");
      return;
    }

    const data = await response.json();
    setUploadedFile(data.file);
    setMessage("อัปโหลดไฟล์สำเร็จ สามารถบันทึกข้อมูลเพื่อแนบไฟล์นี้ได้เลย");
    form.reset();
  };

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...projectForm,
      stack: projectForm.stack,
      fileId: uploadedFile?.id || projectForm.fileId || null,
      imageUrl: uploadedFile?.url || projectForm.imageUrl || null,
    };
    const response = await fetch(editingProjectId ? `/api/projects/${editingProjectId}` : "/api/projects", {
      method: editingProjectId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("บันทึกโปรเจกต์ไม่สำเร็จ");
      return;
    }

    setProjectForm(emptyProject);
    setEditingProjectId(null);
    setUploadedFile(null);
    setMessage("บันทึกโปรเจกต์เรียบร้อย");
    await loadData();
  };

  const saveCertificate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...certificateForm,
      tags: certificateForm.tags,
      fileId: uploadedFile?.id || certificateForm.fileId || null,
      imageUrl: uploadedFile?.url || certificateForm.imageUrl || null,
    };
    const response = await fetch(editingCertificateId ? `/api/certificates/${editingCertificateId}` : "/api/certificates", {
      method: editingCertificateId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage("บันทึกเกียรติบัตรไม่สำเร็จ");
      return;
    }

    setCertificateForm(emptyCertificate);
    setEditingCertificateId(null);
    setUploadedFile(null);
    setMessage("บันทึกเกียรติบัตรเรียบร้อย");
    await loadData();
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/dashboard");
  };

  if (isLoading) {
    return <main className="site-page flex min-h-screen items-center justify-center">กำลังโหลดระบบจัดการ...</main>;
  }

  return (
    <main className="site-page modern-shell min-h-screen">
      <section className="section-shell py-8">
        <div className="dashboard-hero p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">แดชบอร์ด</p>
            <h1 className="section-title mt-2">ระบบจัดการข้อมูล Portfolio</h1>
            <p className="body-copy mt-2">เพิ่ม แก้ไข และแนบรูปภาพสำหรับโปรเจกต์กับเกียรติบัตร</p>
          </div>
          <div className="flex gap-2">
            <button className="apple-button-secondary" onClick={loadData}><HiRefresh /> รีเฟรช</button>
            <button className="apple-button-ghost" onClick={logout}><HiLogout /> ออกจากระบบ</button>
          </div>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="metric-tile">
              <HiBriefcase className="text-2xl" style={{ color: "var(--accent)" }} />
              <p className="mt-3 text-2xl font-semibold">{projects.length}</p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>โปรเจกต์ทั้งหมด</p>
            </div>
            <div className="metric-tile">
              <HiBadgeCheck className="text-2xl" style={{ color: "var(--accent)" }} />
              <p className="mt-3 text-2xl font-semibold">{certificates.length}</p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>เกียรติบัตรทั้งหมด</p>
            </div>
            <div className="metric-tile">
              <HiCollection className="text-2xl" style={{ color: "var(--accent)" }} />
              <p className="mt-3 text-2xl font-semibold">{projects.filter((item) => item.published).length + certificates.filter((item) => item.published).length}</p>
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>รายการที่เผยแพร่</p>
            </div>
          </div>
        </div>

        {message && <p className="modern-card mt-5 p-4 text-sm" style={{ color: "var(--text-secondary)" }}>{message}</p>}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="modern-card p-6">
            <p className="eyebrow">แนบไฟล์</p>
            <h2 className="mt-2 text-xl font-semibold">อัปโหลดรูปภาพหรือ PDF</h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-tertiary)" }}>
              อัปโหลดไฟล์ก่อน แล้วระบบจะนำลิงก์ภายในเว็บไปใส่เป็นรูปหลักให้รายการที่กำลังบันทึก
            </p>
            <form onSubmit={uploadFile} className="mt-5 flex flex-col gap-4">
              <input type="hidden" name="ownerType" value={activeTab === "projects" ? "PROJECT" : "CERTIFICATE"} />
              <input className="apple-input" type="file" name="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" required />
              <button className="apple-button" type="submit"><HiCloudUpload /> อัปโหลดไฟล์</button>
            </form>
            {uploadedFile && (
              <div className="mt-5 text-sm" style={{ color: "var(--text-tertiary)" }}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{uploadedFile.filename}</p>
                <a href={uploadedFile.url} target="_blank" className="break-all" style={{ color: "var(--accent)" }}>{uploadedFile.url}</a>
                {uploadedFile.mimeType.startsWith("image/") ? (
                  <span className="media-frame mt-4">
                    <img src={uploadedFile.url} alt={uploadedFile.filename} className="aspect-video w-full object-cover" />
                  </span>
                ) : uploadedFile.mimeType === "application/pdf" ? (
                  <p className="mt-4">ไฟล์ PDF — เปิดลิงก์ด้านบนเพื่อดูเอกสาร</p>
                ) : null}
              </div>
            )}
          </aside>

          <section className="modern-card p-6">
            <div className="flex flex-wrap gap-2">
              <button className={activeTab === "projects" ? "apple-button" : "apple-button-secondary"} onClick={() => setActiveTab("projects")}><HiBriefcase /> โปรเจกต์</button>
              <button className={activeTab === "certificates" ? "apple-button" : "apple-button-secondary"} onClick={() => setActiveTab("certificates")}><HiBadgeCheck /> เกียรติบัตร</button>
            </div>

            {activeTab === "projects" ? (
              <ProjectEditor
                projects={projects}
                form={projectForm}
                setForm={setProjectForm}
                editingId={editingProjectId}
                setEditingId={setEditingProjectId}
                onSubmit={saveProject}
              />
            ) : (
              <CertificateEditor
                certificates={certificates}
                form={certificateForm}
                setForm={setCertificateForm}
                editingId={editingCertificateId}
                setEditingId={setEditingCertificateId}
                onSubmit={saveCertificate}
              />
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function ProjectEditor(props: {
  projects: Project[];
  form: typeof emptyProject;
  setForm: (value: typeof emptyProject) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <form onSubmit={props.onSubmit} className="form-stack">
        <h2 className="text-xl font-semibold">{props.editingId ? "แก้ไขโปรเจกต์" : "เพิ่มโปรเจกต์ใหม่"}</h2>
        {props.form.imageUrl && <span className="media-frame"><img src={props.form.imageUrl} alt={props.form.title || "Project preview"} className="aspect-video w-full object-cover" /></span>}
        <label><span className="mb-2 block text-sm font-semibold">ชื่อโปรเจกต์</span><input className="apple-input" placeholder="เช่น Portfolio Website" value={props.form.title} onChange={(event) => props.setForm({ ...props.form, title: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">Slug</span><input className="apple-input" placeholder="portfolio-website" value={props.form.slug} onChange={(event) => props.setForm({ ...props.form, slug: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">คำอธิบายสั้น</span><textarea className="apple-input min-h-24" placeholder="สรุปโปรเจกต์แบบสั้นสำหรับหน้าเว็บ" value={props.form.summary} onChange={(event) => props.setForm({ ...props.form, summary: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">รายละเอียดเพิ่มเติม</span><textarea className="apple-input min-h-28" placeholder="รายละเอียด จุดเด่น สิ่งที่ทำ หรือผลลัพธ์ของโปรเจกต์" value={props.form.description ?? ""} onChange={(event) => props.setForm({ ...props.form, description: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">รูปหลัก หรือ URL รูปภาพ</span><input className="apple-input" placeholder="/api/files/... หรือ https://..." value={props.form.imageUrl ?? ""} onChange={(event) => props.setForm({ ...props.form, imageUrl: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">เทคโนโลยีที่ใช้</span><input className="apple-input" placeholder="Next.js, Prisma, PostgreSQL" value={props.form.stack.join(", ")} onChange={(event) => props.setForm({ ...props.form, stack: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">ลิงก์ GitHub</span><input className="apple-input" placeholder="https://github.com/..." value={props.form.repoUrl ?? ""} onChange={(event) => props.setForm({ ...props.form, repoUrl: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">ลิงก์ Demo / เว็บไซต์จริง</span><input className="apple-input" placeholder="https://..." value={props.form.liveUrl ?? ""} onChange={(event) => props.setForm({ ...props.form, liveUrl: event.target.value })} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label><span className="mb-2 block text-sm font-semibold">วันที่เริ่ม</span><input className="apple-input" type="date" value={props.form.startDate?.slice(0, 10) ?? ""} onChange={(event) => props.setForm({ ...props.form, startDate: event.target.value })} /></label>
          <label><span className="mb-2 block text-sm font-semibold">วันที่สิ้นสุด</span><input className="apple-input" type="date" value={props.form.endDate?.slice(0, 10) ?? ""} onChange={(event) => props.setForm({ ...props.form, endDate: event.target.value })} /></label>
        </div>
        <label><span className="mb-2 block text-sm font-semibold">ลำดับการแสดงผล</span><input className="apple-input" type="number" value={props.form.sortOrder ?? 0} onChange={(event) => props.setForm({ ...props.form, sortOrder: Number(event.target.value) })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.form.featured} onChange={(event) => props.setForm({ ...props.form, featured: event.target.checked })} /> โปรเจกต์แนะนำ</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.form.published} onChange={(event) => props.setForm({ ...props.form, published: event.target.checked })} /> เผยแพร่บนหน้าเว็บ</label>
        <button className="apple-button" type="submit">บันทึกโปรเจกต์</button>
      </form>
      <ItemList
        items={props.projects}
        onEdit={(item) => {
          props.setEditingId(item.id);
          props.setForm(item);
        }}
      />
    </div>
  );
}

function CertificateEditor(props: {
  certificates: Certificate[];
  form: typeof emptyCertificate;
  setForm: (value: typeof emptyCertificate) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <form onSubmit={props.onSubmit} className="form-stack">
        <h2 className="text-xl font-semibold">{props.editingId ? "แก้ไขเกียรติบัตร" : "เพิ่มเกียรติบัตรใหม่"}</h2>
        {props.form.imageUrl && <span className="media-frame"><img src={props.form.imageUrl} alt={props.form.title || "Certificate preview"} className="aspect-video w-full object-cover" /></span>}
        <label><span className="mb-2 block text-sm font-semibold">ชื่อเกียรติบัตร</span><input className="apple-input" placeholder="เช่น Web Development Certificate" value={props.form.title} onChange={(event) => props.setForm({ ...props.form, title: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">ผู้ออกเกียรติบัตร</span><input className="apple-input" placeholder="เช่น Coursera, Google, โรงเรียน..." value={props.form.issuer} onChange={(event) => props.setForm({ ...props.form, issuer: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">วันที่ได้รับ</span><input className="apple-input" type="date" value={props.form.issueDate?.slice(0, 10) ?? ""} onChange={(event) => props.setForm({ ...props.form, issueDate: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">รหัส Credential</span><input className="apple-input" placeholder="Credential ID" value={props.form.credentialId ?? ""} onChange={(event) => props.setForm({ ...props.form, credentialId: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">ลิงก์ตรวจสอบเกียรติบัตร</span><input className="apple-input" placeholder="https://..." value={props.form.credentialUrl ?? ""} onChange={(event) => props.setForm({ ...props.form, credentialUrl: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">รูปเกียรติบัตร หรือ URL รูปภาพ</span><input className="apple-input" placeholder="/api/files/... หรือ https://..." value={props.form.imageUrl ?? ""} onChange={(event) => props.setForm({ ...props.form, imageUrl: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">รายละเอียดเพิ่มเติม</span><textarea className="apple-input min-h-28" placeholder="รายละเอียด สิ่งที่ได้รับ หรือทักษะที่เกี่ยวข้อง" value={props.form.description ?? ""} onChange={(event) => props.setForm({ ...props.form, description: event.target.value })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">แท็ก</span><input className="apple-input" placeholder="Frontend, JavaScript, Award" value={props.form.tags.join(", ")} onChange={(event) => props.setForm({ ...props.form, tags: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
        <label><span className="mb-2 block text-sm font-semibold">ลำดับการแสดงผล</span><input className="apple-input" type="number" value={(props.form as typeof emptyCertificate).sortOrder ?? 0} onChange={(event) => props.setForm({ ...props.form, sortOrder: Number(event.target.value) })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={props.form.published} onChange={(event) => props.setForm({ ...props.form, published: event.target.checked })} /> เผยแพร่บนหน้าเว็บ</label>
        <button className="apple-button" type="submit">บันทึกเกียรติบัตร</button>
      </form>
      <ItemList
        items={props.certificates}
        onEdit={(item) => {
          props.setEditingId(item.id);
          props.setForm(item);
        }}
      />
    </div>
  );
}

function ItemList<T extends { id: string; title: string; published: boolean }>(props: {
  items: T[];
  onEdit: (item: T) => void;
}) {
  return (
    <div className="space-y-3">
      {props.items.map((item) => (
        <button key={item.id} onClick={() => props.onEdit(item)} className="modern-card modern-card-interactive w-full p-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">{item.title}</span>
            <span className={item.published ? "status-pill" : "chip"}>
              {item.published ? "เผยแพร่" : "ฉบับร่าง"}
            </span>
          </div>
        </button>
      ))}
      {props.items.length === 0 && <p className="body-copy">ยังไม่มีข้อมูล</p>}
    </div>
  );
}
