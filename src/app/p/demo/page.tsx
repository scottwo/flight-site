import { PilotProfilePage } from "@/app/pilot/page";

export const metadata = {
  title: "Demo Pilot Profile",
};

export default async function DemoProfilePage() {
  return (
    <>
      <div className="bg-[#dce8f7] text-[#0f2f4b]">
        <div className="mx-auto max-w-6xl px-6 py-3 text-sm font-semibold">
          Demo profile (fictional data) — Delta pilot based in Salt Lake City
        </div>
      </div>
      <PilotProfilePage dataDir="demo-data" />
    </>
  );
}
