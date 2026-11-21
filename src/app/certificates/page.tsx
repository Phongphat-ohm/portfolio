"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeading from "@/components/PageHeading";
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
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const loadCertificates = async () => {
      setIsLoading(true); setError(false);
      try {
        const response = await fetch("/api/certificates", { signal: controller.signal });
        const data = await response.json();

        if (!response.ok) throw new Error("Certificates unavailable");
        if (response.ok) {
          setCertificates(data.certificates ?? []);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadCertificates();
    return () => controller.abort();
  }, [attempt]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="wrap page-content">
        <section>
          <PageHeading title="Always learning.">Certificates, awards, and milestones from my learning journey.</PageHeading>
          {isLoading ? (
            <p className="text-base leading-7 text-base-content/70 mt-10">กำลังโหลดเกียรติบัตร...</p>
          ) : error ? (
            <div className="empty-state" role="alert"><HiBadgeCheck /><h2>Certificates couldn’t be loaded.</h2><p>Please try again in a moment.</p><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again</button></div>
          ) : certificates.length === 0 ? (
            <div className="empty-state">
              <HiBadgeCheck className="text-4xl" style={{ color: "var(--color-primary)" }} />
              <h2 className="mt-4 text-xl font-semibold">ยังไม่มีเกียรติบัตร</h2>
              <p className="text-base leading-7 text-base-content/70 mt-2">
                กลับมาชมเส้นทางการเรียนรู้ของฉันได้อีกครั้งในภายหลัง
              </p>
            </div>
          ) : (
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {certificates.map((certificate) => (
                <article key={certificate.id} className="rounded-2xl bg-base-200 p-6">
                  {certificate.imageUrl && (
                    <span className="mb-5 block overflow-hidden rounded-box">
                      <img src={certificate.imageUrl} alt={certificate.title} className="aspect-video w-full object-cover" />
                    </span>
                  )}
                  <p className="text-sm font-semibold text-primary">{certificate.issuer}</p>
                  <h2 className="mt-2 text-xl font-semibold">{certificate.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm" style={{ color: "color-mix(in srgb, var(--color-base-content) 70%, transparent)" }}>
                    {certificate.issueDate && <span>วันที่ได้รับ: {new Date(certificate.issueDate).toLocaleDateString("th-TH")}</span>}
                    {certificate.credentialId && <span>Credential ID: {certificate.credentialId}</span>}
                  </div>
                  {certificate.description && <p className="mt-3 text-sm leading-6" style={{ color: "color-mix(in srgb, var(--color-base-content) 70%, transparent)" }}>{certificate.description}</p>}
                  {certificate.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {certificate.tags.map((tag) => (
                        <span key={tag} className="badge badge-outline">{tag}</span>
                      ))}
                    </div>
                  )}
                  {certificate.credentialUrl && (
                    <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold" style={{ color: "var(--color-primary)" }}>
                      ตรวจสอบเกียรติบัตร <HiExternalLink />
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main><Footer />
    </>
  );
}
