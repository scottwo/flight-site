export const runtime = "nodejs";

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { AlphaFullError, ensureUserAndProfile } from "@/lib/bootstrapUserProfile";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clerkUser = await currentUser();
    const { user, profile } = await ensureUserAndProfile(userId, clerkUser);
    return NextResponse.json({ id: user.id, handle: profile.handle });
  } catch (error) {
    if (error instanceof AlphaFullError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await prisma.profile.findFirst({
    where: { user: { clerkUserId: userId } },
    select: { handle: true, userId: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, handle: profile.handle });
}
