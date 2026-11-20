"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { HiBadgeCheck, HiExternalLink } from "react-icons/hi";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  tags: string[];
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const response = await fetch("/api/certificates");
        const data = await response.json();

        if (response.ok) {
          setCertificates(data.certificates ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCertificates();
  }, []);

  return (
    <>
      <Navbar route_id={3} />
      <main className="site-page">
        <section className="section-shell min-h-screen pb-16 pt-28 sm:pt-32">
          <p className="eyebrow">Certificates</p>
          <h1 className="display-title mt-3">เกียรติบัตรและผลงานรับรอง</h1>
          <p className="body-copy mt-5 max-w-3xl">
            รวมเกียรติบัตร รางวัล และหลักฐานการเรียนรู้ที่ดึงข้อมูลจากระบบจัดการหลังบ้าน
          </p>

          {isLoading ? (
            <p className="body-copy mt-10">กำลังโหลดเกียรติบัตร...</p>
          ) : certificates.length === 0 ? (
            <div className="apple-panel mt-10 p-8">
              <HiBadgeCheck className="text-4xl" style={{ color: "var(--accent)" }} />
              <h2 className="mt-4 text-xl font-semibold">ยังไม่มีเกียรติบัตร</h2>
              <p className="body-copy mt-2">
                เพิ่มข้อมูลจากหน้า dashboard แล้วระบบจะแสดงบนหน้านี้อัตโนมัติ
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {certificates.map((certificate) => (
                <article key={certificate.id} className="modern-card modern-card-interactive p-6">
                  {certificate.imageUrl && (
                    <span className="media-frame mb-5">
                      <img src={certificate.imageUrl} alt={certificate.title} className="aspect-video w-full object-cover" />
                    </span>
                  )}
                  <p className="eyebrow">{certificate.issuer}</p>
                  <h2 className="mt-2 text-xl font-semibold">{certificate.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ color: "var(--text-tertiary)" }}>
                    {certificate.issueDate && <span>วันที่ได้รับ: {new Date(certificate.issueDate).toLocaleDateString("th-TH")}</span>}
                    {certificate.credentialId && <span>Credential ID: {certificate.credentialId}</span>}
                  </div>
                  {certificate.description && <p className="mt-3 text-sm leading-6" style={{ color: "var(--text-tertiary)" }}>{certificate.description}</p>}
                  {certificate.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {certificate.tags.map((tag) => (
                        <span key={tag} className="chip">{tag}</span>
                      ))}
                    </div>
                  )}
                  {certificate.credentialUrl && (
                    <a href={certificate.credentialUrl} target="_blank" className="mt-5 inline-flex items-center gap-2 font-semibold" style={{ color: "var(--accent)" }}>
                      ตรวจสอบเกียรติบัตร <HiExternalLink />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
