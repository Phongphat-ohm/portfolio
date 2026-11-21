"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeading from "@/components/PageHeading";
import Link from "next/link";
import { HiArrowLeft, HiArrowPath, HiCheck, HiOutlineClipboard } from "react-icons/hi2";


import { useState, useEffect } from "react";

type Format = "hex" | "base64" | "base64url";

export default function JwtGeneratorPage() {
    const [keyLength, setKeyLength] = useState(64);
    const [format, setFormat] = useState<Format>("hex");
    const [secretKey, setSecretKey] = useState("");
    const [info, setInfo] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);
    const [copyError, setCopyError] = useState("");

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
        setCopySuccess(false); setCopyError("");
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(secretKey);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch {
            setCopyError("Copy failed. Select the key above and copy it manually.");
        }
    };

    return <><Navbar /><main id="main-content" className="wrap page-content tool-content">
      <Link href="/app" className="breadcrumb"><HiArrowLeft /> Back to playground</Link>
      <PageHeading title="JWT secret generator.">สร้าง Secret Key สำหรับ JSON Web Token — generated in your browser.</PageHeading>
      <div className="tool-panel tool-columns"><div>
        <fieldset className="tool-fieldset"><legend>Key length / ความยาว</legend><div className="choice-row">{[32,64,128,256].map(len => <button key={len} type="button" className="choice" aria-pressed={keyLength === len} onClick={() => setKeyLength(len)}>{len} bytes</button>)}</div></fieldset>
        <fieldset className="tool-fieldset"><legend>Output format / รูปแบบ</legend><div className="choice-row formats">{(["hex","base64","base64url"] as Format[]).map(f => <button key={f} type="button" className="choice" aria-pressed={format === f} onClick={() => setFormat(f)}>{f === "hex" ? "Hexadecimal" : f === "base64" ? "Base64" : "Base64URL"}</button>)}</div></fieldset>
        <button className="btn btn-primary w-full" onClick={generateKey}>Generate a new key <HiArrowPath /></button>
        <p className="tool-help">เก็บ Key ใน Environment Variables และไม่เปิดเผยต่อสาธารณะ แนะนำความยาวอย่างน้อย 64 bytes</p>
      </div><div className="output-panel"><div className="output-toolbar"><h2>Your secret key</h2><button className="btn btn-sm btn-outline" onClick={copyToClipboard} disabled={!secretKey}>{copySuccess ? <HiCheck /> : <HiOutlineClipboard />} {copySuccess ? "Copied" : "Copy key"}</button></div><p className="text-sm text-base-content/70 mb-4">{info || "Generating your key…"}</p><textarea className="code-output" readOnly value={secretKey} aria-label="Generated secret key" spellCheck={false} /><p className="copy-status" role="status">{copySuccess ? "Key copied to clipboard." : copyError}</p></div></div>
    </main><Footer /></>;
}
