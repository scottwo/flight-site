import fs from "node:fs/promises";
import path from "node:path";

type Stats = typeof import("../../public/data/stats.json");
type HeatmapEntry = typeof import("../../public/data/heatmap.json")[number];

const statsPath = path.join(process.cwd(), "public", "data", "stats.json");
const heatmapPath = path.join(process.cwd(), "public", "data", "heatmap.json");

export async function getStats() {
  const raw = await fs.readFile(statsPath, "utf-8");
  return JSON.parse(raw) as Stats;
}

export async function getHeatmap(): Promise<HeatmapEntry[]> {
  const raw = await fs.readFile(heatmapPath, "utf-8");
  return JSON.parse(raw) as HeatmapEntry[];
}

export function formatHours(hours: number) {
  const fractionDigits = Number.isInteger(hours) ? 0 : 1;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(hours);
}

export function formatCount(count: number) {
  return new Intl.NumberFormat("en-US").format(count);
}
