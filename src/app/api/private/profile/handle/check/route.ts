import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeHandle, validateHandle } from "@/lib/handleUtils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized", available: false }, { status: 401 });
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get("handle") || "";
  const handle = normalizeHandle(raw);
  const validation = validateHandle(handle);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error, handle, available: false }, { status: 400 });
  }

  const owner = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!owner) {
    return NextResponse.json({ ok: false, error: "User not found", available: false }, { status: 404 });
  }

  const existing = await prisma.profile.findUnique({
    where: { handle },
    select: { userId: true },
  });

  const available = !existing || existing.userId === owner.id;

  return NextResponse.json({ ok: true, handle, available });
}
