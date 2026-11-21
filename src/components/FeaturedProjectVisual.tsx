"use client";

import { useEffect, useState } from "react";
import { imageSrc } from "@/lib/image";

type Preview = { name: string; image: string; year: string };

export default function FeaturedProjectVisual() {
  const [preview, setPreview] = useState<Preview | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/projects", { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const data = await response.json();
      const project = data.projects?.find((item: Preview) => imageSrc(item.image));
      if (project) setPreview(project);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  return preview ? <div className="work-preview real-project-preview">
    <div className="preview-toolbar"><span>{preview.name}</span><span>{preview.year}</span></div>
    <img src={imageSrc(preview.image) ?? undefined} alt={`${preview.name} project interface`} onError={() => setPreview(null)} loading="lazy" width={1200} height={750} />
  </div> : <div className="work-preview" aria-hidden="true"><div className="preview-toolbar"><i /><i /><i /><span>phongphat / projects</span></div><div className="preview-body"><span>Ideas into interfaces.</span><div className="preview-rule" /><strong>Build.<br />Learn.<br />Repeat.</strong><span className="preview-stack">Next.js / JavaScript / C#</span></div></div>;
}
