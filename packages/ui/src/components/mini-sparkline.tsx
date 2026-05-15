"use client";

import * as React from "react";
import { cn } from "../utils";
import type { SparklinePoint } from "../fixtures";

export interface MiniSparklineProps {
  data: SparklinePoint[];
  className?: string;
  width?: number;
  height?: number;
  tone?: "positive" | "negative" | "neutral";
  showArea?: boolean;
}

const TONE_COLORS = {
  positive: "hsl(var(--verdict-clean))",
  negative: "hsl(var(--verdict-critical))",
  neutral: "hsl(var(--primary))"
};

export function MiniSparkline({
  data,
  className,
  width = 160,
  height = 40,
  tone = "neutral",
  showArea = true
}: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[10px] text-muted-foreground",
          className
        )}
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  const values = data.map((d) => d.v);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d.v - min) / range) * height;
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaPath = showArea
    ? `${path} L ${(points[points.length - 1]?.x ?? width).toFixed(
        2
      )} ${height} L 0 ${height} Z`
    : "";

  const stroke = TONE_COLORS[tone];

  return (
    <svg
      role="img"
      aria-label="Sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
    >
      {showArea && (
        <path
          d={areaPath}
          fill={stroke}
          fillOpacity={0.12}
          stroke="none"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
