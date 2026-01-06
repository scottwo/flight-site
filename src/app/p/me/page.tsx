export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export default async function MyProfileRedirectPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const profile = await prisma.profile.findFirst({
    where: { user: { clerkUserId: userId } },
  });

  if (profile) {
    redirect(`/p/${profile.handle}`);
  }

  redirect("/dashboard/settings");
}
