"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HiExternalLink } from "react-icons/hi";
import { FaGithub } from "react-icons/fa6";

type ProjectItem = {
  id?: string;
  link?: string;
  liveUrl?: string | null;
  repoUrl?: string | null;
  image?: string;
  imageUrl?: string | null;
  title?: string;
  name?: string;
  summary?: string;
  description?: string | null;
  stack?: string[];
};

const fallbackProjects: ProjectItem[] = [
  {
    link: "https://github.com",
    image: "https://placehold.co/600x400",
    name: "Portfolio Website",
    description:
      "Responsive portfolio project built with Next.js, Tailwind CSS, and DaisyUI.",
  },
  {
    link: "https://github.com",
    image: "https://placehold.co/600x400",
    name: "Developer Utility",
    description:
      "Small tools and experiments for improving developer workflows.",
  },
];

export default function ProjectsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectItem[]>(fallbackProjects);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects");
        const data = await response.json();

        if (response.ok && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      } catch {
        setProjects(fallbackProjects);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="relative min-h-96">
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => {
          const title = project.title || project.name || "Project";
          const image = project.imageUrl || project.image || "https://placehold.co/600x400";
          const description = project.summary || project.description || "";

          return (
            <article
              className="modern-card modern-card-interactive h-full"
              key={project.id || title}
            >
              <div className="p-5">
                <div className="flex h-full flex-col">
                  <span className="media-frame">
                    <img
                      src={image}
                      alt={title}
                      className="aspect-video w-full object-cover"
                    />
                  </span>
                  <h2 className="mt-4 font-semibold">{title}</h2>
                  <p className="mt-2 cursor-pointer text-sm leading-6" style={{ color: "var(--text-tertiary)" }}>
                    {description}
                  </p>
                  {project.stack && project.stack.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.stack.map((item) => (
                        <span key={item} className="chip">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.repoUrl && (
                      <Link href={project.repoUrl} target="_blank" className="apple-button-secondary min-h-10 px-4 text-sm">
                        <FaGithub /> GitHub
                      </Link>
                    )}
                    {project.liveUrl && (
                      <Link href={project.liveUrl} target="_blank" className="apple-button min-h-10 px-4 text-sm">
                        <HiExternalLink /> Demo
                      </Link>
                    )}
                    {!project.repoUrl && !project.liveUrl && project.link && (
                      <Link href={project.link} target="_blank" className="apple-button-secondary min-h-10 px-4 text-sm">
                        <HiExternalLink /> เปิดลิงก์
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
        )})}
      </div>
      {isLoading && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center" style={{ background: "color-mix(in srgb, var(--surface) 92%, transparent)" }}>
          <h1 className="text-lg">Loading projects...</h1>
          <span className="loading loading-ring loading-lg mt-3"></span>
        </div>
      )}
    </div>
  );
}
