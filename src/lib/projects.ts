import type { Project } from "@/generated/prisma/client";
import { parseOptionalDate, parseStringList, slugify } from "./api";

// Keep upstream's canonical model while serving the earlier dashboard contract.
export function projectForClient(project: Project) {
  return { ...project, title: project.name, imageUrl: project.image, stack: project.tags,
    repoUrl: project.github, liveUrl: project.demo, summary: project.summary || project.description,
    slug: project.slug || project.id };
}

export function projectInput(body: Record<string, unknown>) {
  const name = String(body.name ?? body.title ?? "").trim();
  const summary = String(body.summary ?? body.description ?? "").trim();
  return {
    name, summary, slug: String(body.slug || slugify(name)),
    description: String(body.description || summary),
    image: body.image ? String(body.image) : body.imageUrl ? String(body.imageUrl) : null,
    fileId: body.fileId ? String(body.fileId) : null,
    tags: parseStringList(body.tags ?? body.stack), categories: parseStringList(body.categories),
    github: body.github ? String(body.github) : body.repoUrl ? String(body.repoUrl) : null,
    demo: body.demo ? String(body.demo) : body.liveUrl ? String(body.liveUrl) : null,
    year: String(body.year || new Date().getFullYear()),
    status: body.status === "in_progress" ? "in_progress" as const : "completed" as const,
    startDate: parseOptionalDate(body.startDate), endDate: parseOptionalDate(body.endDate),
    featured: Boolean(body.featured), published: body.published !== false, sortOrder: Number(body.sortOrder || 0),
  };
}
