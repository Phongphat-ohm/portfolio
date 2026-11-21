"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
export default function PortfolioMotion() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.querySelector("main");
    if (!root) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const moduleUrl = "/assets/moments/moments.js";
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ moduleUrl).then(async api => {
      if (cancelled) return;
      await api.mountAll(root);
      if (cancelled) api.unmountAll(root);
      else dispose = () => api.unmountAll(root);
    }).catch(() => { /* The statement remains readable if motion cannot load. */ });
    return () => { cancelled = true; dispose?.(); };
  }, [pathname]);
  return null;
}
