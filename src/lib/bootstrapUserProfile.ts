import { randomUUID } from "crypto";
import type { User as ClerkUser } from "@clerk/backend";

import { isAlphaFull } from "@/lib/alphaLimit";
import { prisma } from "@/lib/prisma";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

async function generateUniqueHandle(base: string) {
  const normalized = slugify(base).slice(0, 20) || "user";
  let candidate = normalized;
  let attempts = 0;

  while (attempts < 5) {
    const existing = await prisma.profile.findUnique({
      where: { handle: candidate },
      select: { userId: true },
    });
    if (!existing) {
      return candidate;
    }
    attempts += 1;
    candidate = `${normalized}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return `${normalized}-${randomUUID().slice(0, 6)}`;
}

export class AlphaFullError extends Error {
  constructor() {
    super("Alpha is full. Please try again later.");
    this.name = "AlphaFullError";
  }
}

export async function ensureUserAndProfile(clerkUserId: string, clerkUser?: ClerkUser | null) {
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, email: true },
  });

  if (!existingUser && (await isAlphaFull())) {
    throw new AlphaFullError();
  }

  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {
      email,
    },
    create: {
      clerkUserId,
      email,
    },
  });

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    const displayName =
      [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
      "Pilot";

    const handle = await generateUniqueHandle(clerkUserId);

    try {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          handle,
          displayName,
        },
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === "P2002") {
        const fallbackHandle = await generateUniqueHandle(
          `${clerkUserId}-${Date.now()}`,
        );
        profile = await prisma.profile.create({
          data: {
            userId: user.id,
            handle: fallbackHandle,
            displayName,
          },
        });
      } else {
        throw error;
      }
    }
  }

  return { user, profile };
}
