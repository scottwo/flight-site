import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "MyPilotPage social preview";

export default function OpenGraphImage() {
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
            "radial-gradient(circle at 20% 20%, #2c5cff 0%, #112952 35%, #060d1f 75%, #040714 100%)",
          color: "#eaf1ff",
          padding: "56px",
          fontFamily: "Inter, ui-sans-serif, system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.28)",
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.95,
          }}
        >
          MyPilotPage
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: "88%" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 74, fontWeight: 800, lineHeight: 1.05 }}>
            <span>Your pilot career,</span>
            <span>ready to share</span>
          </div>
          <div style={{ fontSize: 34, opacity: 0.9 }}>
            A living, recruiter-ready pilot resume powered by your logbook.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, opacity: 0.86 }}>www.mypilotpage.com</div>
      </div>
    ),
    size,
  );
}
