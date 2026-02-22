import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function sanitizeFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: Request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, profile: { select: { resumePathname: true } } },
  });
  if (!dbUser?.profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const maybeFile = formData.get("resume");
  if (!(maybeFile instanceof File) || maybeFile.size <= 0) {
    return NextResponse.json({ ok: false, error: "Please select a resume file." }, { status: 400 });
  }
  if (maybeFile.size > MAX_RESUME_BYTES) {
    return NextResponse.json({ ok: false, error: "Resume must be 10MB or smaller." }, { status: 400 });
  }
  if (!ALLOWED_RESUME_TYPES.has(maybeFile.type)) {
    return NextResponse.json(
      { ok: false, error: "Only PDF, DOC, DOCX, or TXT files are allowed." },
      { status: 400 },
    );
  }

  const normalizedFilename = sanitizeFilename(maybeFile.name || "resume.pdf") || "resume.pdf";
  const pathname = `resumes/${dbUser.id}/${Date.now()}-${normalizedFilename}`;
  const uploaded = await put(pathname, maybeFile, {
    access: "public",
    addRandomSuffix: false,
  });

  const oldPathname = dbUser.profile.resumePathname;
  await prisma.profile.update({
    where: { userId: dbUser.id },
    data: {
      resumeUrl: uploaded.url,
      resumePathname: uploaded.pathname,
      resumeFilename: maybeFile.name || normalizedFilename,
    },
    select: { userId: true },
  });

  if (oldPathname && oldPathname !== uploaded.pathname) {
    try {
      await del(oldPathname);
    } catch (error) {
      console.error("Failed to delete old resume blob", error);
    }
  }

  return NextResponse.json({
    ok: true,
    resumeUrl: uploaded.url,
    resumeFilename: maybeFile.name || normalizedFilename,
  });
}

export async function DELETE() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      profile: { select: { resumePathname: true } },
    },
  });
  if (!dbUser?.profile) {
    return NextResponse.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }

  const oldPathname = dbUser.profile.resumePathname;

  await prisma.profile.update({
    where: { userId: dbUser.id },
    data: {
      resumeUrl: null,
      resumePathname: null,
      resumeFilename: null,
    },
    select: { userId: true },
  });

  if (oldPathname) {
    try {
      await del(oldPathname);
    } catch (error) {
      console.error("Failed to delete resume blob", error);
    }
  }

  return NextResponse.json({ ok: true });
}
