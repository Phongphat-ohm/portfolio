import Link from "next/link"

export default function AppPage() {
    return (
        <>
            <div data-theme="light" className="w-full h-screen flex flex-col bg-blue-200 items-center justify-center">
                <h1 className="text-3xl font-bold">
                    เมนูโปรแกรมเสริมช่วยเขียนโปรแกรม
                </h1>
                <div className="w-1/3 grid grid-cols-2 gap-5 mt-4">
                    <Link href={"/app/dbcons"}>
                        <div className="p-5 bg-white rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center">
                            <img src="/icons/cloud-computing.png" alt="" className="w-2/3" />
                            <label className="text-gray-500">โปรแกรมสร้าง Connection String</label>
                        </div>
                    </Link>
                    <Link href={"/app/jwt-secret"}>
                        <div className="p-5 bg-white rounded-xl hover:scale-105 hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center">
                            <img src="/icons/key.png" alt="" className="w-2/3" />
                            <label className="text-gray-500">โปรแกรมสร้าง JWT Secret Key</label>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    )
}