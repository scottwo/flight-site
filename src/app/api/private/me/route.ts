export const runtime = "nodejs";

import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

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

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    null;

  const user = await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email,
    },
    create: {
      clerkUserId: userId,
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

    const handle = await generateUniqueHandle(userId);

    try {
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          handle,
          displayName,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const fallbackHandle = await generateUniqueHandle(
          `${userId}-${Date.now()}`,
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

  return NextResponse.json({ id: user.id, handle: profile.handle });
}
