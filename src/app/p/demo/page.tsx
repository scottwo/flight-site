import CareerStageDemoProfile, { type CareerStageDemo } from "@/components/CareerStageDemoProfile";

export const metadata = {
  title: "Airline Captain Demo",
  description: "A fictional regional airline captain preparing for a major-airline transition.",
};

const profile: CareerStageDemo = {
  stage: "captain",
  banner: "Fictional demo · Maya Chen, regional airline captain · Preparing for a major-airline transition",
  displayName: "Maya Chen",
  currentRole: "CRJ-900 Captain",
  homeBase: "Denver, CO",
  headline: "Part 121 captain with mountain, winter, and high-density airport experience, preparing for a major-airline transition.",
  availability: "Actively interviewing · Available with 30 days notice",
  contactEmail: "maya.chen@example.com",
  snapshotUrl: "/demo/maya-chen-recruiter-snapshot.pdf",
  qualifications: [
    { label: "Certificates", values: ["ATP", "CFI", "CFII", "MEI"] },
    { label: "Type ratings", values: ["CL-65"] },
    { label: "Readiness", values: ["First Class Medical", "US Passport", "FCC Restricted Radiotelephone"] },
  ],
  metrics: [
    { label: "Total time", value: "10,684 hrs", helper: "Pilot-provided logbook total" },
    { label: "Turbine PIC", value: "6,820 hrs", helper: "Part 121 captain time" },
    { label: "Multi-engine", value: "2,940 hrs", helper: "Turbine aircraft" },
    { label: "Part 121 SIC", value: "1,860 hrs", helper: "CRJ-700/900" },
    { label: "Instrument", value: "842 hrs", helper: "Actual and simulated" },
    { label: "Night", value: "1,126 hrs", helper: "Domestic operations" },
  ],
  targetRoles: [
    "Major-airline first officer with a strong training culture and broad network",
    "Denver, Salt Lake City, Dallas, or commutable western base preferred",
    "Long-term fleet growth, international opportunity, and leadership development",
  ],
  strengths: [
    "Part 121 PIC responsibility in mountain, winter, and irregular operations",
    "Hub-and-spoke flying across DEN, DFW, PHX, ORD, LAX, and SLC",
    "Crew development, disciplined briefings, and calm operational decision-making",
    "High-density terminal environments, deicing, and high-altitude airport operations",
  ],
  roles: [
    {
      title: "Captain",
      organization: "SkyWest Airlines · CRJ-700/900",
      dates: "2023 - Present",
      detail: "PIC responsibility in Part 121 operations with an emphasis on stable decision-making, crew development, and reliable performance during winter and irregular operations.",
    },
    {
      title: "First Officer",
      organization: "SkyWest Airlines · CRJ-700/900",
      dates: "2020 - 2023",
      detail: "Built a high-tempo Part 121 foundation across mountain, coastal, and complex terminal environments before upgrading to captain.",
    },
    {
      title: "Flight Instructor",
      organization: "Front Range Flight Academy",
      dates: "2017 - 2020",
      detail: "Delivered private through commercial and instrument instruction, developing a durable foundation in risk management and clear cockpit communication.",
    },
  ],
  recentExperience: [
    { label: "Flight time", value: "148.6 hrs", window: "Latest 90 days" },
    { label: "Part 121 PIC", value: "132.4 hrs", window: "Latest 90 days" },
    { label: "Instrument activity", value: "18.4 hrs", window: "Latest 6 months" },
  ],
  note: "Totals are fictional pilot-provided logbook values and are not a regulatory currency determination. Employers should verify records and qualifications during the application process.",
};

export default function CaptainDemoPage() {
  return <CareerStageDemoProfile profile={profile} />;
}
