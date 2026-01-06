import fs from "node:fs/promises";
import path from "node:path";

type Stats = typeof import("../../public/data/stats.json");
type HeatmapEntry = typeof import("../../public/data/heatmap.json")[number];

const statsPath = (baseDir: string) =>
  path.join(process.cwd(), "public", baseDir, "stats.json");
const heatmapPath = (baseDir: string) =>
  path.join(process.cwd(), "public", baseDir, "heatmap.json");

export async function getStats(baseDir = "data") {
  const raw = await fs.readFile(statsPath(baseDir), "utf-8");
  return JSON.parse(raw) as Stats;
}

export async function getHeatmap(baseDir = "data"): Promise<HeatmapEntry[]> {
  const raw = await fs.readFile(heatmapPath(baseDir), "utf-8");
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
