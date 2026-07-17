import CareerStageDemoProfile, { type CareerStageDemo } from "@/components/CareerStageDemoProfile";

export const metadata = {
  title: "ATP-Minimum CFI Demo",
  description: "A fictional CFI at ATP minimums seeking a first regional airline role.",
};

const profile: CareerStageDemo = {
  stage: "cfi",
  banner: "Fictional demo · Jordan Alvarez, ATP-minimum CFI · Seeking a first regional airline position",
  displayName: "Jordan Alvarez",
  currentRole: "CFII / MEI",
  homeBase: "Phoenix, AZ",
  headline: "ATP-qualified instructor with 1,512 hours, structured multi-engine training experience, and a strong record of preparing students for safe, professional operations.",
  availability: "Actively interviewing · Available after two weeks notice",
  contactEmail: "jordan.alvarez@example.com",
  qualifications: [
    { label: "Certificates", values: ["Commercial ASEL/AMEL", "Instrument", "CFI", "CFII", "MEI"] },
    { label: "ATP readiness", values: ["1,512 TT", "ATP-CTP complete", "Written complete"] },
    { label: "Readiness", values: ["First Class Medical", "US Passport", "FCC Restricted Radiotelephone"] },
  ],
  metrics: [
    { label: "Total time", value: "1,512 hrs", helper: "ATP minimum reached" },
    { label: "Pilot in command", value: "1,286 hrs", helper: "Training and cross-country operations" },
    { label: "Multi-engine", value: "112 hrs", helper: "92 hrs as MEI / PIC" },
    { label: "Cross-country", value: "642 hrs", helper: "Includes structured student XC" },
    { label: "Instrument", value: "136 hrs", helper: "Actual, simulated, and instruction" },
    { label: "Night", value: "108 hrs", helper: "Night instruction and XC" },
  ],
  targetRoles: [
    "Regional airline first officer in a structured Part 121 training environment",
    "Bases in the Mountain West, Southwest, or Texas preferred",
    "Open to reserve, commuting, and relocation for the right training and advancement path",
  ],
  strengths: [
    "1,050+ hours of dual given across private, instrument, commercial, and multi-engine syllabi",
    "Standardized stage-check preparation and detailed student progress documentation",
    "Arizona summer, density-altitude, mountain, and busy Class B operations",
    "Calm cockpit communication developed through varied student experience levels",
  ],
  roles: [
    {
      title: "Senior Flight Instructor / MEI",
      organization: "Sonoran Flight Academy",
      dates: "2024 - Present",
      detail: "Provides instrument, commercial, and multi-engine instruction; mentors new instructors and conducts internal stage-check preparation.",
    },
    {
      title: "Flight Instructor",
      organization: "Sonoran Flight Academy",
      dates: "2022 - 2024",
      detail: "Delivered private and instrument training in a high-tempo environment while maintaining clear risk-management and lesson documentation standards.",
    },
    {
      title: "Line Service Technician",
      organization: "Phoenix Gateway Aviation",
      dates: "2020 - 2022",
      detail: "Supported turbine and general aviation operations, developing practical ramp safety, fueling, and crew-service awareness.",
    },
  ],
  recentExperience: [
    { label: "Flight time", value: "248.7 hrs", window: "Latest 90 days" },
    { label: "Multi-engine", value: "31.4 hrs", window: "Latest 90 days" },
    { label: "Instrument activity", value: "42.8 hrs", window: "Latest 6 months" },
  ],
  note: "Totals are fictional pilot-provided logbook values. ATP eligibility, employer requirements, and regulatory currency require document and event-level verification.",
};

export default function CfiDemoPage() {
  return <CareerStageDemoProfile profile={profile} />;
}
