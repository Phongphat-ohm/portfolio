export interface Project {
    id: string;
    name: string;
    description: string;
    image: string | null;
    tags: string[];
    categories: string[];
    year: string;
    status: "completed" | "in_progress";
    github: string | null;
    demo: string | null;
}

export const CATEGORY_OPTIONS = [
    { label: "Web Project", value: "web" },
    { label: "Window App", value: "winapp" },
    { label: "HTML CSS PHP", value: "htmlcssphp" },
    { label: "Vite", value: "vite" },
    { label: "NextJS", value: "nextjs" },
    { label: "Bootstrap", value: "bootstrap" },
    { label: "NextUI", value: "nextui" },
    { label: "C#", value: "csharp" },
    { label: "Full Stack", value: "fullstack" },
    { label: "Frontend", value: "frontend" },
    { label: "Backend", value: "backend" },
] as const;

export const STATUS_LABELS: Record<Project["status"], string> = {
    completed: "Completed",
    in_progress: "In Progress",
};
