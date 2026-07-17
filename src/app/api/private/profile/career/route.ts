export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const text = (value: unknown, max = 160) => {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  return cleaned ? cleaned.slice(0, max) : null;
};

const list = (value: unknown) =>
  typeof value === "string"
    ? value.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 20).map((item) => item.slice(0, 80))
    : [];

const flag = (value: unknown) => value === true || value === "true";

const careerHistory = (value: unknown) => {
  if (typeof value !== "string") return [];
  return value.split("\n").map((line) => {
    const [role = "", employer = "", dates = "", summary = ""] = line.split("|").map((part) => part.trim());
    return { role: role.slice(0, 120), employer: employer.slice(0, 120), dates: dates.slice(0, 80), summary: summary.slice(0, 500) };
  }).filter((item) => item.role && item.employer).slice(0, 10);
};

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkUserId: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

  const displayName = text(body.displayName, 100);
  if (!displayName) return NextResponse.json({ ok: false, error: "Display name is required" }, { status: 400 });
  const contactEmail = text(body.contactEmail, 200);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return NextResponse.json({ ok: false, error: "Enter a valid contact email" }, { status: 400 });
  }

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      displayName,
      currentRole: text(body.currentRole),
      homeBase: text(body.homeBase),
      availability: text(body.availability),
      contactEmail,
      certificates: list(body.certificates),
      typeRatings: list(body.typeRatings),
      medical: text(body.medical),
      workAuthorization: text(body.workAuthorization),
      careerHistory: careerHistory(body.careerHistory),
      isPublished: flag(body.isPublished),
      showQualifications: flag(body.showQualifications),
      showAvailability: flag(body.showAvailability),
      showContact: flag(body.showContact),
      showCareerHistory: flag(body.showCareerHistory),
      showStats: flag(body.showStats),
      showRecentExperience: flag(body.showRecentExperience),
      showRoutes: flag(body.showRoutes),
      showActivity: flag(body.showActivity),
      showResume: flag(body.showResume),
    },
  });

  return NextResponse.json({ ok: true });
}
