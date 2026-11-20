"use client";

import { animate, motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FaChartLine, FaUserGroup } from "react-icons/fa6";

interface Stats {
  today: number;
  total: number;
}

function CountUp({ value, inView }: { value: number; inView: boolean }) {
  const [text, setText] = useState("0");
  const ref = useRef(value);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        ref.current = latest;
        setText(Math.round(latest).toLocaleString("th-TH"));
      },
    });
    return () => controls.stop();
  }, [inView, value]);

  return <>{text}</>;
}

export default function VisitorStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/analytics/stats", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setStats({
          today: typeof data?.today === "number" ? data.today : 0,
          total: typeof data?.total === "number" ? data.total : 0,
        });
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const cards = [
    {
      label: "ผู้เข้าชมทั้งหมด",
      icon: <FaUserGroup />,
      accent: "from-primary to-secondary",
      shadow: "shadow-primary/30",
      value: stats?.total,
    },
    {
      label: "ผู้เข้าชมวันนี้",
      icon: <FaChartLine />,
      accent: "from-info to-sky-600",
      shadow: "shadow-info/30",
      value: stats?.today,
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Visitor Stats
          </p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            จำนวนผู้เข้าชมเว็บไซต์
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ y: 16, opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="card border border-base-content/10 bg-base-200/60 shadow-sm"
            >
              <div className="card-body flex-row items-center gap-4 p-6">
                <div
                  className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-2xl text-white shadow-lg ${card.shadow}`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm text-base-content/60">
                    {card.label}
                  </p>
                  <p className="nunito text-4xl font-bold leading-tight">
                    {card.value === undefined ? (
                      <span className="inline-block h-9 w-20 animate-pulse rounded-md bg-base-content/10 align-middle" />
                    ) : (
                      <CountUp value={card.value} inView={inView} />
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
