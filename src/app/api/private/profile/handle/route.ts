import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { normalizeHandle, validateHandle } from "@/lib/handleUtils";

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const rawHandle = typeof body?.handle === "string" ? body.handle : "";
  const handle = normalizeHandle(rawHandle);
  const validation = validateHandle(handle);
  if (!validation.ok) {
    return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  try {
    const profile = await prisma.profile.update({
      where: { userId: user.id },
      data: { handle },
      select: { handle: true },
    });
    return NextResponse.json({ ok: true, handle: profile.handle });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "P2002") {
      return NextResponse.json({ ok: false, error: "Handle already taken" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Unable to update handle" }, { status: 500 });
  }
}
