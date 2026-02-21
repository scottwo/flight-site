import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const confirmation = typeof body?.confirmation === "string" ? body.confirmation.trim() : "";
  if (confirmation.toUpperCase() !== "DELETE") {
    return NextResponse.json(
      { ok: false, error: 'Confirmation must be "DELETE"' },
      { status: 400 },
    );
  }

  const internalUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  // Deleting User cascades through profile, flights, import jobs, and aggregate tables.
  if (internalUser) {
    await prisma.user.delete({ where: { id: internalUser.id } });
  }

  let clerkDeleted = true;
  try {
    const client = await clerkClient();
    await client.users.deleteUser(clerkUserId);
  } catch (error) {
    // Local data is already removed; still allow sign-out UX on the client.
    clerkDeleted = false;
    console.error("Failed to delete Clerk user", error);
  }

  return NextResponse.json({ ok: true, clerkDeleted });
}
