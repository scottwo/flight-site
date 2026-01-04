import fs from "node:fs/promises";
import path from "node:path";

export type RouteLeg = {
  from: { icao: string; lat: number; lon: number };
  to: { icao: string; lat: number; lon: number };
  count: number;
  month: string;
};

export async function getRoutes(fileName = "routes.json"): Promise<RouteLeg[]> {
  const filePath = path.join(process.cwd(), "public", "data", fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as RouteLeg[];
}
