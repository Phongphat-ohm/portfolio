"use client";

import { useState, useEffect } from "react";

type Format = "hex" | "base64" | "base64url";

export default function JwtGeneratorPage() {
    const [keyLength, setKeyLength] = useState(64);
    const [format, setFormat] = useState<Format>("hex");
    const [secretKey, setSecretKey] = useState("");
    const [info, setInfo] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        generateKey();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateKey = () => {
        const randomBytes = new Uint8Array(keyLength);
        crypto.getRandomValues(randomBytes);

        let newKey = "";
        let formatName = "";

        switch (format) {
            case "hex":
                newKey = Array.from(randomBytes)
                    .map((byte) => byte.toString(16).padStart(2, "0"))
                    .join("");
                formatName = "Hexadecimal";
                break;

            case "base64":
                newKey = btoa(String.fromCharCode(...randomBytes));
                formatName = "Base64";
                break;

            case "base64url":
                newKey = btoa(String.fromCharCode(...randomBytes))
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=/g, "");
                formatName = "Base64URL";
                break;
        }

        setSecretKey(newKey);
        setInfo(`${keyLength} bytes • ${formatName}`);
        setCopySuccess(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(secretKey);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            // fallback
            const textarea = document.createElement("textarea");
            textarea.value = secretKey;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    return (
        <div data-theme="light" className="gradient-bg min-h-screen flex items-center justify-center p-4">
            <style jsx>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .key-display {
          word-break: break-all;
          font-family: "Courier New", monospace;
        }
      `}</style>

            <div className="glass-effect rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        JWT Secret Key Generator
                    </h1>
                    <p className="text-white/80">
                        สร้าง Secret Key ที่ปลอดภัยสำหรับ JSON Web Token
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Key Length Selection */}
                    <div>
                        <label className="block text-white font-medium mb-3">
                            ความยาวของ Key:
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[32, 64, 128, 256].map((len) => (
                                <button
                                    key={len}
                                    onClick={() => setKeyLength(len)}
                                    className={`py-2 px-4 rounded-lg transition-all duration-200 ${keyLength === len
                                        ? "bg-white/40 border-2 border-white/60 text-white"
                                        : "bg-white/20 border border-white/30 text-white hover:bg-white/30"
                                        }`}
                                >
                                    {len} bytes
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Format Selection */}
                    <div>
                        <label className="block text-white font-medium mb-3">รูปแบบ:</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {(["hex", "base64", "base64url"] as Format[]).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`py-2 px-4 rounded-lg transition-all duration-200 ${format === f
                                        ? "bg-white/40 border-2 border-white/60 text-white"
                                        : "bg-white/20 border border-white/30 text-white hover:bg-white/30"
                                        }`}
                                >
                                    {f === "hex"
                                        ? "Hexadecimal"
                                        : f === "base64"
                                            ? "Base64"
                                            : "Base64URL"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateKey}
                        className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        🎲 สร้าง Secret Key ใหม่
                    </button>

                    {/* Generated Key Display */}
                    {secretKey && (
                        <div>
                            <label className="block text-white font-medium mb-3">
                                Secret Key ที่สร้างขึ้น:
                            </label>
                            <div className="bg-black/30 rounded-lg p-4 border border-white/20">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-white/70 text-sm">{info}</span>
                                    <button
                                        onClick={copyToClipboard}
                                        className={`px-3 py-1 rounded text-sm transition-all duration-200 ${copySuccess
                                            ? "bg-green-500 hover:bg-green-600 text-white"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                                    >
                                        {copySuccess ? "✅ คัดลอกแล้ว!" : "📋 คัดลอก"}
                                    </button>
                                </div>
                                <div className="key-display text-green-300 text-sm leading-relaxed break-all">
                                    {secretKey}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tips */}
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                        <h3 className="text-yellow-200 font-semibold mb-2">
                            💡 คำแนะนำด้านความปลอดภัย:
                        </h3>
                        <ul className="text-yellow-100 text-sm space-y-1">
                            <li>• เก็บ Secret Key ไว้ในที่ปลอดภัยและไม่เปิดเผย</li>
                            <li>• ใช้ Environment Variables ในการเก็บ Key</li>
                            <li>• เปลี่ยน Key เป็นระยะเพื่อความปลอดภัย</li>
                            <li>• แนะนำให้ใช้ความยาวอย่างน้อย 64 bytes</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
