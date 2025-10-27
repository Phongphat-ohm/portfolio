"use client";

import { useRouter } from "next/navigation";

export default function DashbiardPage() {
    const router = useRouter();

    const handleSubmit = (e: FormData) => {
        const username = e.get("username")
        const password = e.get("password")

        if (username === "phongphat" && password === "ohm331040"){
            router.push("/dashboard/home")
        }
    }
    return (
        <>
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <div className="card bg-base-200 shadow-xl w-96">
                    <div className="card-body">
                        <h1 className="text-2xl font-bold">Signin</h1>
                        <form action={handleSubmit} className="flex flex-col gap-3 mt-4">
                            <div className="flex flex-col w-full">
                                <label>Username</label>
                                <input type="text" name="username" id="username" required autoComplete="off" className="input mt-2 w-full" />
                            </div>
                            <div className="flex flex-col w-full">
                                <label>Password</label>
                                <input type="password" name="password" id="password" required autoComplete="off" className="input mt-2 w-full" />
                            </div>
                            <button className="btn btn-success mt-3">
                                Continue
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}