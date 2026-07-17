import CareerStageDemoProfile, { type CareerStageDemo } from "@/components/CareerStageDemoProfile";

export const metadata = {
  title: "500-Hour Commercial Pilot Demo",
  description: "A fictional 500-hour commercial pilot seeking a first non-instruction flying role.",
};

const profile: CareerStageDemo = {
  stage: "commercial",
  banner: "Fictional demo · Samira Patel, 500-hour commercial pilot · Seeking a first non-instruction flying role",
  displayName: "Samira Patel",
  currentRole: "Commercial Multi-Engine Pilot",
  homeBase: "Orlando, FL",
  headline: "Commercial pilot with 518 hours, hands-on flight-operations experience, and a disciplined safety mindset seeking a first Part 135, aerial survey, ferry, or right-seat opportunity.",
  availability: "Available immediately · Open to relocation and extended travel",
  contactEmail: "samira.patel@example.com",
  qualifications: [
    { label: "Certificates", values: ["Commercial ASEL/AMEL", "Instrument Airplane"] },
    { label: "Aircraft", values: ["C172/182", "PA-28", "PA-44", "BE-76"] },
    { label: "Readiness", values: ["First Class Medical", "US Passport", "FCC Restricted Radiotelephone"] },
  ],
  metrics: [
    { label: "Total time", value: "518 hrs", helper: "Airplane time" },
    { label: "Pilot in command", value: "386 hrs", helper: "Single- and multi-engine" },
    { label: "Multi-engine", value: "46 hrs", helper: "31 hrs PIC" },
    { label: "Cross-country", value: "236 hrs", helper: "Day and night combined" },
    { label: "Instrument", value: "68 hrs", helper: "Actual and simulated" },
    { label: "Night", value: "52 hrs", helper: "Includes 34 hrs night PIC" },
  ],
  targetRoles: [
    "Entry-level Part 135 SIC or mentorship-track first officer",
    "Aerial survey, mapping, ferry, traffic-watch, or aircraft-delivery pilot",
    "Flight-department support role with a defined path to line flying",
  ],
  strengths: [
    "Cross-country experience throughout Florida, the Southeast, and the Bahamas",
    "Multi-engine commercial training in PA-44 and BE-76 aircraft",
    "Weather, dispatch coordination, passenger service, and operational documentation",
    "Flexible schedule and comfortable with multi-day travel assignments",
  ],
  roles: [
    {
      title: "Flight Operations Coordinator",
      organization: "SunCoast Air Charter",
      dates: "2024 - Present",
      detail: "Coordinates crew schedules, passenger needs, weather packages, and trip documentation for a small Part 135 operation while gaining exposure to professional flight-department standards.",
    },
    {
      title: "Commercial Pilot / Time-Building Partner",
      organization: "Independent",
      dates: "2023 - Present",
      detail: "Plans and flies structured cross-country missions with disciplined go/no-go decisions, fuel planning, and post-flight record review.",
    },
    {
      title: "Customer Service Representative",
      organization: "Orlando Executive Aviation",
      dates: "2021 - 2024",
      detail: "Supported corporate crews and passengers in a safety-sensitive FBO environment, including arrivals, services, and irregular requests.",
    },
  ],
  recentExperience: [
    { label: "Flight time", value: "86.3 hrs", window: "Latest 90 days" },
    { label: "Cross-country", value: "47.6 hrs", window: "Latest 90 days" },
    { label: "Instrument activity", value: "14.2 hrs", window: "Latest 6 months" },
  ],
  note: "Totals are fictional pilot-provided logbook values. Employers should verify certificates, records, experience, and role-specific minimums during the application process.",
};

export default function CommercialDemoPage() {
  return <CareerStageDemoProfile profile={profile} />;
}
