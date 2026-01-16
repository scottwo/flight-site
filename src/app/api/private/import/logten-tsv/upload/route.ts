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
  console.log("blob upload route hit", { url: request.url, type: (body as any)?.type });

  // Resolve callback base URL
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
  const callbackUrl = new URL("/api/private/import/logten-tsv/upload", callbackBaseUrl).toString();

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
        console.log("onUploadCompleted fired", { blobUrl: blob.url, pathname: blob.pathname });
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

    console.log("handleUpload result", jsonResponse);
    return jsonResponse instanceof Response ? jsonResponse : NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
