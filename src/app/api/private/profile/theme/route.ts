import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { parseThemeInput } from "@/lib/theme";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      profile: {
        select: {
          themeMode: true,
          themePrimary: true,
          themeSecondary: true,
          themeGuardrails: true,
        },
      },
    },
  });

  if (!user?.profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    themeMode: user.profile.themeMode,
    themePrimary: user.profile.themePrimary,
    themeSecondary: user.profile.themeSecondary,
    themeGuardrails: user.profile.themeGuardrails,
  });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = parseThemeInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      themeMode: parsed.value.mode,
      themePrimary: parsed.value.primary,
      themeSecondary: parsed.value.secondary,
      themeGuardrails: parsed.value.guardrails,
    },
    select: {
      themeMode: true,
      themePrimary: true,
      themeSecondary: true,
      themeGuardrails: true,
    },
  });

  return NextResponse.json({
    ok: true,
    themeMode: updated.themeMode,
    themePrimary: updated.themePrimary,
    themeSecondary: updated.themeSecondary,
    themeGuardrails: updated.themeGuardrails,
  });
}
