"use client";
import { useEffect, useState } from "react";
export default function VisitorStats() {
  const [stats, setStats] = useState<{ today: number; total: number } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/analytics/stats", { signal: controller.signal }).then(async response => {
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.today === "number" && typeof data.total === "number") setStats(data);
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  return <div className="visitor-line" aria-live="polite"><span>Thanks for stopping by.</span>{stats ? <span>{stats.total.toLocaleString()} visits · {stats.today.toLocaleString()} today</span> : <span>A little corner of the internet, made by Ohm.</span>}</div>;
}
