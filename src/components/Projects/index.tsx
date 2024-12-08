"use client";

import { useState } from "react";
import CategoryList from "./CategoryList";

export default function Project() {
    const [categories, setCategory] = useState([
        {
            label: "Web Project",
            value: "web"
        },
        {
            label: "Window App",
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

    return (
        <>
            <div className="flex flex-col">
                <label className="text-lg">Select project category</label>
                <select className="select select-bordered w-full max-w-xs">
                    <option value={"all"}>All Project</option>
                    {categories.map((val, index) => (
                        <option value={val.value} key={index}>{val.label}</option>
                    ))}
                </select>
            </div>
            <CategoryList />
        </>
    )
}