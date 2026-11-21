"use client";

import { useState } from "react";
import ProjectsList from "./CategoryList";

export default function Project() {
    const [categories] = useState([
        {
            label: "Web Project",
            value: "web"
        },
        {
            label: "Windows apps",
            value: "winapp"
        },
        {
            label: "HTML CSS PHP",
            value: "htmlcssphp"
        },
        {
            label: "Vite",
            value: "vite"
        },
        {
            label: "NextJS",
            value: "nextjs"
        },
        {
            label: "Bootstrap",
            value: "bootstrap"
        },
        {
            label: "NextUI",
            value: "nextui"
        },
        {
            label: "C#",
            value: "csharp"
        },
        {
            label: "Full Stack",
            value: "fullstack"
        },
        {
            label: "Frontend",
            value: "frontend"
        },
        {
            label: "Backend",
            value: "backend"
        }
    ]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    return (
        <>
            <div className="project-toolbar"><div>
                <label htmlFor="project-category" className="field-label">Explore by category</label>
                <select
                    id="project-category" className="select select-bordered w-full sm:min-w-72"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value={"all"}>All projects</option>
                    {categories.map((val, index) => (
                        <option value={val.value} key={index}>{val.label}</option>
                    ))}
                </select></div><p className="text-sm text-base-content/70">A little bit of everything I build.</p>
            </div>
            <ProjectsList category={selectedCategory} />
        </>
    )
}
