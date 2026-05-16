import Link from "next/link";

const tools = [
  {
    href: "/app/dbcons",
    image: "/icons/cloud-computing.png",
    title: "Connection String Generator",
  },
  {
    href: "/app/jwt-secret",
    image: "/icons/key.png",
    title: "JWT Secret Key Generator",
  },
];

export default function AppPage() {
  return (
    <main data-theme="light" className="min-h-screen bg-blue-50 px-4 py-10 text-slate-900 sm:px-6">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase text-blue-600">Developer tools</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-5xl">
            Helpful utilities for building software faster.
          </h1>
        </div>
        <div className="mt-8 grid w-full gap-5 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="card bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="card-body items-center text-center">
                <img src={tool.image} alt={tool.title} className="h-32 w-32 object-contain sm:h-40 sm:w-40" />
                <h2 className="card-title text-lg text-slate-700">{tool.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
