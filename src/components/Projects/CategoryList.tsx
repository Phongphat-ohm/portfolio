"use client";

import Link from "next/link";
import { useState } from "react";

interface Root {

}

export default function ProjectsList() {
    const [isLoading, setLoading] = useState(false);
    const [projects, setProjects] = useState([
        {
            link: "https://github.com",
            image: "http://placehold.co/300x200",
            name: "{Program Name}",
            description: "{Program Description}"
        },
        {
            link: "https://github.com",
            image: "http://placehold.co/300x200",
            name: "{Program Name}",
            description: "{Program Description}"
        },
    ])

    return (
        <>
            <div className="min-h-96 relative">
                <div className="grid grid-cols-5 gap-3 relative mt-5">
                    {projects.map((val, index) => (
                        <Link href={val.link} className="cursor-pointer" key={index}>
                            <div className="card bg-base-200 transition-all duration-200 hover:shadow hover:shadow-base-300">
                                <div className="card-body p-5">
                                    <div className="flex flex-col">
                                        <img src={val.image} alt="" className="rounded-lg" />
                                        <h1 className="text-white mt-2">
                                            {val.name}
                                        </h1>
                                        <label className="text-sm cursor-pointer">
                                            {val.description}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                {isLoading && (
                    <div className="absolute z-10 bg-base-100 top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                        <h1 className="text-lg">
                            กำลังโหลดข้อมูลโปรเจกต์
                        </h1>
                        <span className="loading loading-ring loading-lg mt-3"></span>
                    </div>
                )}
            </div>
        </>
    )
}