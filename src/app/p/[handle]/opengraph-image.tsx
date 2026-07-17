import { ImageResponse } from "next/og";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Pilot profile preview";

type Props = {
  params: Promise<{ handle: string }>;
};

export default async function HandleOpenGraphImage({ params }: Props) {
  const { handle } = await params;
  const profile = await prisma.profile.findUnique({
    where: { handle },
    select: {
      handle: true,
      displayName: true,
      headline: true,
      currentRole: true,
      homeBase: true,
      isPublished: true,
    },
  });

  const isPublic = profile?.isPublished === true;
  const displayName = isPublic ? profile.displayName : "Private pilot profile";
  const displayHandle = isPublic ? profile.handle : "private";
  const headline = isPublic
    ? profile.headline || [profile.currentRole, profile.homeBase].filter(Boolean).join(" · ") || "Professional pilot profile"
    : "This profile has not been published.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at 70% 15%, #2f66ff 0%, #12315f 34%, #081634 72%, #040915 100%)",
          color: "#edf3ff",
          padding: "56px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.28)",
            fontSize: 25,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.95,
          }}
        >
          Pilot profile
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: "88%" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.02 }}>{displayName}</div>
          <div style={{ fontSize: 36, opacity: 0.92 }}>@{displayHandle}</div>
          <div style={{ fontSize: 32, opacity: 0.88 }}>{headline}</div>
        </div>

        <div style={{ display: "flex", fontSize: 28, opacity: 0.86 }}>mypilotpage.com</div>
      </div>
    ),
    size,
  );
}
