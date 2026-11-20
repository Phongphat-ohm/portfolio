"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem("visit_tracked")) return;
    sessionStorage.setItem("visit_tracked", "1");
    fetch("/api/analytics/track", { method: "POST", keepalive: true }).catch(
      () => {}
    );
  }, []);
  return null;
}
