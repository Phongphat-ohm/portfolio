"use client";
import { useEffect, useState } from "react";
import { HiArrowPath, HiArrowUpRight, HiOutlineFolderOpen } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa6";
import { imageSrc } from "@/lib/image";
interface Project { id: string; name: string; description: string; image: string | null; tags: string[]; categories: string[]; year: string; status: "completed" | "in_progress"; github: string | null; demo: string | null; }
export default function ProjectsList({ category }: { category: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    fetch(`/api/projects?${params}`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error("Projects unavailable");
      const data = await response.json(); setProjects(data.projects ?? []);
    }).catch(error => { if (error.name !== "AbortError") setError(true); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [category, attempt]);
  if (loading) return <div className="project-grid" aria-busy="true" aria-label="Loading projects">{[0,1].map(i => <div key={i}><div className="skeleton-frame" /><div className="skeleton-line" /><div className="skeleton-line" style={{ width: "85%" }} /></div>)}</div>;
  if (error) return <div className="empty-state" role="alert"><HiOutlineFolderOpen /><h2>Projects are taking a break.</h2><p>I couldn’t load this collection. Try again, or explore the code on GitHub.</p><div className="flex flex-wrap justify-center gap-4"><button className="btn btn-primary" onClick={() => setAttempt(attempt + 1)}>Try again <HiArrowPath /></button><a className="btn btn-outline" href="https://github.com/Phongphat-ohm" target="_blank" rel="noopener noreferrer">Explore GitHub <HiArrowUpRight /></a></div></div>;
  if (!projects.length) return <div className="empty-state"><HiOutlineFolderOpen /><h2>No projects here just yet.</h2><p>{category === "all" ? "This collection is still growing. You can explore my code on GitHub." : "Try another category to see more of my work."}</p><a className="text-link" href="https://github.com/Phongphat-ohm" target="_blank" rel="noopener noreferrer">Explore GitHub <HiArrowUpRight /></a></div>;
  return <div className="project-grid">{projects.map(project => <article key={project.id} className="project-card">
    {project.demo || project.github ? <a className="project-image" href={project.demo || project.github || undefined} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${project.name}`}>{project.image ? <img src={imageSrc(project.image) ?? undefined} alt={project.name} loading="lazy" /> : <span className="project-image-fallback">{project.name.slice(0,2)}</span>}</a> : <div className="project-image">{project.image ? <img src={imageSrc(project.image) ?? undefined} alt={project.name} loading="lazy" /> : <span className="project-image-fallback">{project.name.slice(0,2)}</span>}</div>}
    <div className="project-meta"><span className={`project-status ${project.status === "in_progress" ? "in-progress" : ""}`}>{project.status === "in_progress" ? "In progress" : "Completed"}</span><span>{project.year}</span></div>
    <h2>{project.name}</h2><p>{project.description}</p><div className="tag-list">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
    <div className="project-actions">{project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer" className="text-link">{project.status === "in_progress" ? "View live preview" : "Open project"} <HiArrowUpRight /></a>}{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-link">View code <FaGithub /></a>}</div>
  </article>)}</div>;
}
