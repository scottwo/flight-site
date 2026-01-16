import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // IMPORTANT: Do NOT gate this entire route behind Clerk auth.
  // Vercel Blob client uploads call this endpoint multiple times, and the
  // upload-completed callback request may not include session cookies.
  // We enforce auth only when generating the token.

  const body = (await request.json()) as HandleUploadBody;

  // Vercel Blob needs an absolute callback URL for `onUploadCompleted`.
  // Prefer an explicit env var; fall back to forwarded host headers.
  const callbackBaseUrl =
    process.env.VERCEL_BLOB_CALLBACK_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (() => {
      const proto = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
      return host ? `${proto}://${host}` : new URL(request.url).origin;
    })();

  const callbackUrl = `${callbackBaseUrl}/api/private/import/logten-tsv/upload`;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Only signed-in users may mint upload tokens.
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) throw new Error("Unauthorized");

        // Map Clerk user -> internal User row
        const importUser = await prisma.user.findUnique({
          where: { clerkUserId },
          select: { id: true },
        });

        if (!importUser) throw new Error("User not found");

        // Client payload may be a string in some @vercel/blob versions.
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
            return String((clientPayload as any).originalFilename);
          }
          return pathname;
        })();

        // Create an ImportJob so we can track upload/import progress
        const job = await prisma.importJob.create({
          data: {
            userId: importUser.id,
            provider: "LOGTEN_TSV",
            status: "UPLOADING",
            originalFilename,
          },
        });

        return {
          allowedContentTypes: ["text/tab-separated-values", "text/plain", "application/octet-stream"],
          addRandomSuffix: true,
          callbackUrl,
          // Token payload is returned back to onUploadCompleted
          tokenPayload: JSON.stringify({
            jobId: job.id,
            userId: importUser.id,
          }),
        };
      },

      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Do NOT require Clerk auth here; rely on the signed tokenPayload.
        console.log("Upload complete")
        let parsed: { jobId?: string } = {};
        try {
          parsed = tokenPayload ? JSON.parse(String(tokenPayload)) : {};
        } catch {
          parsed = {};
        }

        const jobId = parsed.jobId;
        console.log("JobID: " + jobId)
        if (!jobId) return;

        await prisma.importJob.update({
          where: { id: jobId },
          data: {
            status: "UPLOADED",
            blobUrl: blob.url,
            blobPathname: blob.pathname,
            // Some @vercel/blob versions don't type `size` on PutBlobResult.
            bytes: (blob as any).size ?? undefined,
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
