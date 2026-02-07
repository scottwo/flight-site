import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const raw = typeof body?.headline === "string" ? body.headline : null;
  const cleaned = raw?.trim() ?? "";
  const headline = cleaned.length === 0 ? null : cleaned.slice(0, 120);

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.profile.update({
    where: { userId: user.id },
    data: { headline },
    select: { headline: true },
  });

  return NextResponse.json({ ok: true, headline: updated.headline });
}
