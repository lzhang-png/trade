"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PriceBar } from "@/lib/types";

interface PriceChartProps {
  data: PriceBar[];
  sma20?: number;
  sma50?: number;
  height?: number;
}

export function PriceChart({ data, sma20, sma50, height = 200 }: PriceChartProps) {
  const chartData = data.slice(-60).map((bar) => ({
    date: bar.date.slice(5),
    close: bar.close,
    volume: bar.volume,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={50}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
        />
        {sma20 && (
          <ReferenceLine y={sma20} stroke="#f59e0b" strokeDasharray="3 3" />
        )}
        {sma50 && (
          <ReferenceLine y={sma50} stroke="#8b5cf6" strokeDasharray="3 3" />
        )}
        <Line
          type="monotone"
          dataKey="close"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
