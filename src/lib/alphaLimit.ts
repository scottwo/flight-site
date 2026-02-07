import { prisma } from "@/lib/prisma";

export const ALPHA_LIMIT_ENABLED = process.env.ALPHA_LIMIT_ENABLED === "true";
export const ALPHA_MAX_USERS = Number(process.env.ALPHA_MAX_USERS ?? "40");

export async function getUserCount(): Promise<number> {
  return prisma.user.count();
}

export async function isAlphaFull(): Promise<boolean> {
  if (!ALPHA_LIMIT_ENABLED) return false;
  const count = await getUserCount();
  return count >= ALPHA_MAX_USERS;
}
