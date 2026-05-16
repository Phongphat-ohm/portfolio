"use client";

import Link from "next/link";
import { useState } from "react";

export default function ProjectsList() {
  const [isLoading] = useState(false);
  const [projects] = useState([
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
  ]);

  return (
    <div className="relative min-h-96">
      <div className="relative mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <Link
            href={project.link}
            className="cursor-pointer"
            key={project.name}
            target="_blank"
          >
            <div className="card h-full bg-base-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
              <div className="card-body p-5">
                <div className="flex h-full flex-col">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="aspect-video w-full rounded-lg object-cover"
                  />
                  <h2 className="mt-4 font-semibold">{project.name}</h2>
                  <p className="mt-2 cursor-pointer text-sm leading-6 text-base-content/70">
                    {project.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {isLoading && (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center bg-base-100/90">
          <h1 className="text-lg">Loading projects...</h1>
          <span className="loading loading-ring loading-lg mt-3"></span>
        </div>
      )}
    </div>
  );
}
