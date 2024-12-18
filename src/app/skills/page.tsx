"use client"
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { FaComputerMouse, FaHtml5 } from "react-icons/fa6";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function Page() {
    return (
        <>
            <Navbar route_id={1} showScroll />
            <main>
                <div className="h-screen flex items-center justify-around text-white relative">
                    <div className="flex flex-col items-center">
                        <motion.img initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} transition={{ duration: 0.5 }} src="images/competence.png" alt="" className="w-96" />
                        <motion.h2 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="text-2xl mt-5">
                            This is the skill of <label className="text-cyan-400 font-bold nunito">Ohm Phongphat</label>
                        </motion.h2>
                        <motion.label initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>Scroll down to view my skills</motion.label>
                    </div>

                    <motion.span
                        className="w-full absolute bottom-10 left-0 flex justify-center text-lg"
                        animate={{
                            y: [0, -10, 0], // ขยับขึ้น -10px แล้วกลับลงมา
                        }}
                        transition={{
                            duration: 1.5, // ระยะเวลาหนึ่งรอบ (ขึ้น-ลง)
                            repeat: Infinity, // ทำซ้ำไม่สิ้นสุด
                        }}
                    >
                        <FaComputerMouse className="rotate-180 text-2xl" />
                    </motion.span>
                </div>
                <div className="bg-base-200">
                    <div className="container mx-auto px-36 p-10">
                        <h1 className="text-lg mb-5">
                            Program Skill
                        </h1>
                        <div className="grid grid-cols-4 gap-3">
                            <div>
                                <Link href={"https://code.visualstudio.com/"} target="_blank" className="card bg-base-100 shadow transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body flex flex-col items-center justify-center">
                                        <img src="/images/program/vscode.png" alt="program vs code" className="w-1/2" />
                                        <h1 className="text-xl">
                                            Visual Studio Code
                                        </h1>
                                        <label>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visual Studio Code เป็นโปรแกรมแก้ไขโค้ดฟรีที่พัฒนาโดย Microsoft รองรับหลายภาษาโปรแกรมและมีฟีเจอร์เด่น ใช้งานได้บนทุกแพลตฟอร์ม เหมาะสำหรับนักพัฒนาทุกระดับ!
                                        </label>
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <Link href={"https://visualstudio.microsoft.com/"} target="_blank" className="card bg-base-100 shadow transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body flex flex-col items-center justify-center">
                                        <img src="/images/program/Visual_Studio_Icon_2022.png" alt="program vs code" className="w-1/2" />
                                        <h1 className="text-xl">
                                            Visual Studio
                                        </h1>
                                        <label>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visual Studio คือ IDE จาก Microsoft สำหรับพัฒนาโปรแกรมในหลายภาษา เช่น C# และ C++, เหมาะสำหรับโปรเจกต์ขนาดใหญ่และแอปพลิเคชันที่ซับซ้อน.
                                        </label>
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <Link href={"https://unity.com/"} target="_blank" className="card bg-base-100 shadow transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body flex flex-col items-center justify-center">
                                        <img src="/images/program/unity.png" alt="program vs code" className="w-1/2" />
                                        <h1 className="text-xl">
                                            Unity
                                        </h1>
                                        <label>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Unity คือแพลตฟอร์มพัฒนาเกมและแอปพลิเคชัน 3D และ 2D ที่ใช้ในการสร้างเกมและสื่ออินเตอร์แอคทีฟ รองรับหลายแพลตฟอร์ม เช่น PC, คอนโซล, โมบาย และ VR/AR.
                                        </label>
                                    </div>
                                </Link>
                            </div>
                            <div>
                                <Link href={"https://www.microsoft.com/th-th/microsoft-365/microsoft-office"} target="_blank" className="card bg-base-100 shadow transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body flex flex-col items-center justify-center">
                                        <img src="/images/program/Microsoft_365.png" alt="program vs code" className="w-1/2" />
                                        <h1 className="text-xl">
                                            Microsoft office
                                        </h1>
                                        <label>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Microsoft Office คือชุดโปรแกรมสำหรับการทำงานเอกสารที่รวมถึง Word, Excel, PowerPoint, Outlook และอื่น ๆ ที่ใช้ในการสร้างและจัดการเอกสาร, สเปรดชีต, งานนำเสนอ, และการสื่อสาร.
                                        </label>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100">
                    <div className="container mx-auto px-36 p-10">
                        <h1 className="text-lg mb-5">
                            Language Skills
                        </h1>
                        <div className="grid grid-cols-5 gap-5 w-full">
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/html5.png" alt="html icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/css.png" alt="css icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/javascript.png" alt="javascript icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/php.png" alt="php icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body flex items-center justify-center">
                                    <img src="images/language/mysql.png" alt="mysql icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/csharp.png" alt="csharp icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/python.png" alt="python icon" />
                                </div>
                            </div>
                            <div className="card bg-base-200 transition-all duration-200">
                                <div className="card-body">
                                    <img src="images/language/google_script.png" alt="google script icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-base-200">
                    <div className="container mx-auto px-36 p-10">
                        <h1 className="text-lg mb-5">
                            Runtime Skills
                        </h1>
                        <div className="grid grid-cols-3 gap-4 text-white">
                            <div>
                                <div className="card bg-base-100 transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex gap-5">
                                            <img src="/images/runtime/jsIconGreen.svg" alt="node js" className="w-1/4" />
                                            <div className="flex flex-col justify-center">
                                                <h1 className="text-xl">NodeJS Runtime</h1>
                                                <label>Node.js คือสภาพแวดล้อมที่ใช้ในการรัน JavaScript บนเซิร์ฟเวอร์</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="card bg-base-100 transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex gap-5">
                                            <img src="/images/runtime/bun.svg" alt="node js" className="w-1/4" />
                                            <div className="flex flex-col justify-center">
                                                <h1 className="text-xl">BunJS Runtime</h1>
                                                <label>Bun.js คือสภาพแวดล้อมที่ใช้ในการรัน JavaScript บนเซิร์ฟเวอร์</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="card bg-base-100 transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex gap-5">
                                            <img src="/images/runtime/dotnet.png" alt="node js" className="w-1/4" />
                                            <div className="flex flex-col justify-center">
                                                <h1 className="text-xl">DotNet Runtime</h1>
                                                <label>คือสภาพแวดล้อมที่รันแอปพลิเคชัน .NET และจัดการการทำงานต่าง ๆ</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="card bg-base-100 transition-all duration-200 hover:shadow-xl">
                                    <div className="card-body">
                                        <div className="flex gap-10">
                                            <img src="/images/runtime/apache.png" alt="node js" className="w-1/12" />
                                            <div className="flex flex-col justify-center">
                                                <h1 className="text-xl">Apache Runtime</h1>
                                                <label>คือสภาพแวดล้อมที่ใช้รัน Apache HTTP Server ซึ่งเป็นเว็บเซิร์ฟเวอร์ที่ช่วยให้สามารถโฮสต์เว็บไซต์และแอปพลิเคชันได้.</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-base-100">
                    <div className="container mx-auto px-36 p-10">
                        <h1 className="text-lg mb-5">
                            Any Skills
                        </h1>
                        <div className="grid grid-cols-6 gap-4">
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/next-js.png" alt="next js icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/vite.png" alt="vite icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/express-js.png" alt="express icon" className="bg-white p-2 rounded-xl transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/socketjs.png" alt="socket js icon" className="bg-white p-2 rounded-full transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/prisma.png" alt="prisma icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/elysia.png" alt="elysia icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow flex h-auto justify-center items-center">
                                <img src="/images/library/bootstrap.png" alt="bootstrap icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/nextui.png" alt="next ui icon" className="transition-all duration-200 hover:scale-110" />
                            </div>
                            <div className="card card-body bg-base-200 transition-all duration-200 hover:shadow">
                                <img src="/images/library/fontawesome.svg" alt="fontawesome icon" className="bg-white rounded-2xl transition-all duration-200 hover:scale-110" />
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    )
}