"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FaChartColumn } from "react-icons/fa6";

interface DailyVisit {
  date: string;
  count: number;
}

function useThemeColor(variable: string, fallback: string) {
  const [color, setColor] = useState(fallback);
  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
    if (value) setColor(value);
  }, [variable]);
  return color;
}

function formatTick(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export default function VisitorsChart({ data }: { data: DailyVisit[] }) {
  const primary = useThemeColor("--color-primary", "oklch(58% 0.233 277.117)");
  const grid = useThemeColor("--color-base-content", "rgba(255,255,255,0.15)");
  const axis = useThemeColor("--color-base-content", "rgba(255,255,255,0.6)");

  return (
    <div className="card border border-base-content/10 bg-base-200/60 shadow-sm">
      <div className="card-body p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-base text-white shadow-lg shadow-primary/30">
            <FaChartColumn />
          </div>
          <div>
            <h2 className="text-lg font-bold">ผู้เข้าชมเว็บไซต์</h2>
            <p className="text-xs text-base-content/60">
              จำนวนผู้เข้าชมไม่ซ้ำต่อวัน (30 วันล่าสุด)
            </p>
          </div>
        </div>
        <div className="h-64 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={formatTick}
                tick={{ fill: axis, fontSize: 12 }}
                axisLine={{ stroke: grid }}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(128,128,128,0.1)" }}
                contentStyle={{
                  background: "var(--color-base-200)",
                  border: "1px solid var(--color-base-content)",
                  borderRadius: "12px",
                  color: "var(--color-base-content)",
                }}
                labelFormatter={(label) => {
                  const [year, month, day] = String(label).split("-");
                  return `${day}/${month}/${year}`;
                }}
                formatter={(value) => [`${value} คน`, "ผู้เข้าชม"]}
              />
              <Bar dataKey="count" fill={primary} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
