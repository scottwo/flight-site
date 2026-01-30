import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma, ImportProvider } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const latest = await prisma.importJob.findFirst({
    where: { userId: user.id, provider: ImportProvider.FORE_FLIGHT_CSV },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ job: latest });
}
