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
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
          tickLine={false}
          axisLine={false}
          width={56}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            fontSize: "14px",
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, "Price"]}
        />
        {sma20 && <ReferenceLine y={sma20} stroke="var(--chart-3)" strokeDasharray="4 4" />}
        {sma50 && <ReferenceLine y={sma50} stroke="var(--chart-2)" strokeDasharray="4 4" />}
        <Line
          type="monotone"
          dataKey="close"
          stroke="var(--foreground)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
