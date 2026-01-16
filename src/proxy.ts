import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/api/private(.*)",
  "/admin(.*)",
  "/dashboard(.*)",
]);

// Vercel Blob client uploads call back into this route without Clerk session cookies.
// We enforce auth only when minting upload tokens, not on the completion callback.
const isBlobUploadCallbackRoute = createRouteMatcher([
  "/api/private/import/logten-tsv/upload",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow Vercel Blob upload completion callbacks to reach our handler.
  if (isBlobUploadCallbackRoute(req)) return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
