import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  let callbackBaseUrl = process.env.VERCEL_BLOB_CALLBACK_URL;
  if (!callbackBaseUrl && process.env.VERCEL === "1") {
    const host =
      process.env.VERCEL_BRANCH_URL ||
      process.env.VERCEL_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (host) {
      callbackBaseUrl = host.startsWith("http") ? host : `https://${host}`;
    }
  }
  if (!callbackBaseUrl) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (host) {
      callbackBaseUrl = `${proto}://${host}`;
    }
  }
  if (!callbackBaseUrl) {
    return NextResponse.json({ error: "Unable to resolve callback URL" }, { status: 500 });
  }
  const callbackUrl = new URL("/api/private/import/foreflight-csv/upload", callbackBaseUrl).toString();

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) throw new Error("Unauthorized");

        const importUser = await prisma.user.findUnique({
          where: { clerkUserId },
          select: { id: true },
        });
        if (!importUser) throw new Error("User not found");

        const originalFilename = (() => {
          if (typeof clientPayload === "string") {
            try {
              const parsed = JSON.parse(clientPayload) as { originalFilename?: string };
              return parsed.originalFilename ?? pathname;
            } catch {
              return clientPayload || pathname;
            }
          }
          if (clientPayload && typeof clientPayload === "object" && "originalFilename" in clientPayload) {
            return String((clientPayload as Record<string, unknown>).originalFilename);
          }
          return pathname;
        })();

        const job = await prisma.importJob.create({
          data: {
            userId: importUser.id,
            provider: "FORE_FLIGHT_CSV",
            status: "UPLOADING",
            originalFilename,
          },
        });

        return {
          allowedContentTypes: ["text/csv", "text/plain", "application/octet-stream"],
          addRandomSuffix: true,
          callbackUrl,
          tokenPayload: JSON.stringify({
            jobId: job.id,
            userId: importUser.id,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let parsed: { jobId?: string } = {};
        try {
          parsed = tokenPayload ? JSON.parse(String(tokenPayload)) : {};
        } catch {
          parsed = {};
        }

        const jobId = parsed.jobId;
        if (!jobId) return;

        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            status: "UPLOADED",
            blobUrl: blob.url,
            blobPathname: blob.pathname,
            bytes: (blob as { size?: number }).size,
            error: null,
          },
        });
      },
    });

    return jsonResponse instanceof Response ? jsonResponse : NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
