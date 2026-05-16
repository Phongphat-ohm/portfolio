"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    const username = formData.get("username");
    const password = formData.get("password");

    if (username === "phongphat" && password === "ohm331040") {
      router.push("/dashboard/home");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-4 py-10">
      <div className="card w-full max-w-md bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold">Signin</h1>
          <form action={handleSubmit} className="mt-4 flex flex-col gap-4">
            <label className="form-control w-full">
              <span className="label-text mb-2">Username</span>
              <input
                type="text"
                name="username"
                id="username"
                required
                autoComplete="off"
                className="input input-bordered w-full"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text mb-2">Password</span>
              <input
                type="password"
                name="password"
                id="password"
                required
                autoComplete="off"
                className="input input-bordered w-full"
              />
            </label>
            <button className="btn btn-success mt-2">Continue</button>
          </form>
        </div>
      </div>
    </main>
  );
}
