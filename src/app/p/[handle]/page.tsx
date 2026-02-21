export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CumulativeHoursChart } from "@/components/CumulativeHoursChart";
import FlightsMap from "@/components/FlightsMap";
import ThemeScope from "@/components/ThemeScope";
import { CurrencyCards } from "@/components/pilot/CurrencyCards";
import { FunFacts, type FunFact } from "@/components/pilot/FunFacts";
import { Heatmap } from "@/components/pilot/Heatmap";
import { RecentFlights } from "@/components/pilot/RecentFlights";
import { RoutesTable } from "@/components/pilot/RoutesTable";
import { StatsCards } from "@/components/pilot/StatsCards";
import { getUserMapData } from "@/lib/map/getMapData";
import { prisma } from "@/lib/prisma";
import { toThemeSettings } from "@/lib/theme";

type PageProps = {
  params: { handle: string };
};

function parseFunFacts(raw: unknown): FunFact[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const maybe = item as Record<string, unknown>;
      if (typeof maybe.id !== "string" || typeof maybe.label !== "string" || typeof maybe.value !== "string")
        return null;
      return {
        id: maybe.id,
        label: maybe.label,
        value: maybe.value,
        detail: typeof maybe.detail === "string" ? maybe.detail : undefined,
        score: typeof maybe.score === "number" ? maybe.score : undefined,
      } satisfies FunFact;
    })
    .filter(Boolean) as FunFact[];
}

function buildFallbackFunFacts(
  routes: { fromIcao: string; toIcao: string; flightsCount: number; totalTime: number; lastFlownAt: Date | null }[],
  dayAgg: { day: Date; flightsCount: number; totalTime: number }[],
  flights: { flightDate: Date }[],
): FunFact[] {
  const facts: FunFact[] = [];

  if (routes.length) {
    const top = routes[0];
    facts.push({
      id: "most_frequent_route",
      label: "Most frequent route",
      value: `${top.fromIcao} → ${top.toIcao}`,
      detail: `${top.flightsCount} flights`,
      score: 10,
    });
  }

  if (dayAgg.length) {
    const busiest = dayAgg.reduce((max, curr) => (curr.totalTime > max.totalTime ? curr : max), dayAgg[0]);
    facts.push({
      id: "busiest_day",
      label: "Busiest day",
      value: busiest.day.toISOString().slice(0, 10),
      detail: `${busiest.totalTime.toFixed(1)} hrs`,
      score: 7,
    });

    const flyingDays = dayAgg.filter((d) => d.flightsCount > 0).length;
    facts.push({
      id: "flying_days",
      label: "Flying days logged",
      value: `${flyingDays}`,
      detail: "in the last year",
      score: 5,
    });

    // Longest streak of consecutive flying days
    const flyingDates = dayAgg
      .filter((d) => d.flightsCount > 0)
      .map((d) => new Date(Date.UTC(d.day.getUTCFullYear(), d.day.getUTCMonth(), d.day.getUTCDate())))
      .sort((a, b) => a.getTime() - b.getTime());
    let longest = 0;
    let current = 0;
    let prev: Date | null = null;
    for (const date of flyingDates) {
      if (prev) {
        const diff = date.getTime() - prev.getTime();
        if (diff === 86_400_000) {
          current += 1;
        } else {
          current = 1;
        }
      } else {
        current = 1;
      }
      longest = Math.max(longest, current);
      prev = date;
    }
    if (longest > 0) {
      facts.push({
        id: "longest_streak",
        label: "Longest streak",
        value: `${longest} days`,
        score: 4,
      });
    }
  }

  if (flights.length) {
    const mostRecent = flights[0];
    facts.push({
      id: "most_recent",
      label: "Most recent flight",
      value: mostRecent.flightDate.toISOString().slice(0, 10),
      score: 3,
    });
  }

  return facts.slice(0, 6);
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { handle } = await params;
  const { userId } = await auth();

  if (!handle) {
    notFound();
  }

  const profile = await prisma.profile.findUnique({
    where: { handle },
    include: { user: true },
  });

  if (!profile) {
    notFound();
  }

  const now = new Date();
  const startDayAgg = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 23, 1));
  const heatmapWindowStart = new Date(now);
  heatmapWindowStart.setUTCDate(heatmapWindowStart.getUTCDate() - (26 * 7 - 1));
  const currency90Start = new Date(now);
  currency90Start.setUTCDate(currency90Start.getUTCDate() - 90);
  const currency180Start = new Date(now);
  currency180Start.setUTCDate(currency180Start.getUTCDate() - 180);

  const [stats, dayAgg, routes, currencyFlights, recentFlights, mapData] = await Promise.all([
    prisma.profileStats.findUnique({
      where: { userId: profile.user.id },
    }),
    prisma.flightDayAgg.findMany({
      where: { userId: profile.user.id, day: { gte: startDayAgg } },
      orderBy: { day: "asc" },
      select: { day: true, flightsCount: true, totalTime: true, landings: true },
    }),
    prisma.routeAgg.findMany({
      where: { userId: profile.user.id },
      orderBy: [{ flightsCount: "desc" }, { lastFlownAt: "desc" }],
      take: 5,
      select: { fromIcao: true, toIcao: true, flightsCount: true, totalTime: true, lastFlownAt: true },
    }),
    prisma.flight.findMany({
      where: { userId: profile.user.id, flightDate: { gte: currency180Start } },
      orderBy: { flightDate: "desc" },
      take: 200,
      select: {
        flightDate: true,
        fromIcao: true,
        toIcao: true,
        totalTime: true,
        night: true,
        ifr: true,
        dayLandings: true,
        nightLandings: true,
      },
    }),
    prisma.flight.findMany({
      where: { userId: profile.user.id },
      orderBy: { flightDate: "desc" },
      take: 5,
      select: { flightDate: true, fromIcao: true, toIcao: true, totalTime: true, night: true, ifr: true },
    }),
    getUserMapData(profile.user.id),
  ]);

  const heatmapData = dayAgg
    .filter((d) => d.day >= heatmapWindowStart)
    .map((d) => ({
      day: d.day.toISOString().slice(0, 10),
      totalTime: d.totalTime,
      flightsCount: d.flightsCount,
    }));

  const cumulativeChartData: { date: string; total: number; cumulative: number }[] = [];
  let running = 0;
  for (const entry of dayAgg) {
    const total = entry.totalTime ?? 0;
    running += total;
    cumulativeChartData.push({
      date: entry.day.toISOString().slice(0, 10),
      total,
      cumulative: running,
    });
  }
  if (cumulativeChartData.length > 0) {
    const latestDate = new Date(`${cumulativeChartData[cumulativeChartData.length - 1].date}T00:00:00Z`);
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    if (latestDate < todayUtc) {
      cumulativeChartData.push({
        date: todayUtc.toISOString().slice(0, 10),
        total: 0,
        cumulative: running,
      });
    }
  }

  const parsedFunFacts = stats?.funFacts ? parseFunFacts(stats.funFacts) : [];
  const fallbackFacts = parsedFunFacts.length
    ? parsedFunFacts
    : buildFallbackFunFacts(
        routes,
        dayAgg.map((d) => ({ day: d.day, flightsCount: d.flightsCount, totalTime: d.totalTime })),
        recentFlights,
      );

  const isOwner = userId && profile.user.clerkUserId === userId;
  const airportLookup = new Map(mapData.airports.map((a) => [a.code, a]));
  const mapRoutes = mapData.routes
    .map((r) => {
      const from = airportLookup.get(r.from);
      const to = airportLookup.get(r.to);
      if (!from || !to) return null;
      return {
        from: { icao: from.code, lat: from.lat, lon: from.lon },
        to: { icao: to.code, lat: to.lat, lon: to.lon },
        count: r.count,
        month: "",
      };
    })
    .filter((v): v is { from: { icao: string; lat: number; lon: number }; to: { icao: string; lat: number; lon: number }; count: number; month: string } => v !== null);
  const missingAirportsNote =
    mapData.missingAirports.length > 0
      ? mapData.missingAirports.length > 8
        ? `${mapData.missingAirports.slice(0, 8).join(", ")} + ${mapData.missingAirports.length - 8} more`
        : mapData.missingAirports.join(", ")
      : null;
  type MapAirport = { code: string; lat: number; lon: number; name?: string | null };
  type MapRoute = { from: string; to: string; count: number };
  const airportsForMap: MapAirport[] = Array.from(
    new Map(
      mapRoutes.flatMap((r) => [
        [r.from.icao, { code: r.from.icao, lat: r.from.lat, lon: r.from.lon } satisfies MapAirport],
        [r.to.icao, { code: r.to.icao, lat: r.to.lat, lon: r.to.lon } satisfies MapAirport],
      ]),
    ).values(),
  );
  const routesForMap: MapRoute[] = mapRoutes
    .filter((r) => r.from.icao && r.to.icao && Number.isFinite(r.from.lat) && Number.isFinite(r.from.lon) && Number.isFinite(r.to.lat) && Number.isFinite(r.to.lon))
    .map((r) => ({
      from: r.from.icao,
      to: r.to.icao,
      count: r.count,
    }));
  const themeSettings = toThemeSettings({
    themeMode: profile.themeMode,
    themePrimary: profile.themePrimary,
    themeSecondary: profile.themeSecondary,
    themeGuardrails: profile.themeGuardrails,
  });

  return (
    <ThemeScope settings={themeSettings} className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">Pilot profile</p>
            <h1 className="text-4xl font-semibold text-[var(--text)]">{profile.displayName}</h1>
            <p className="text-[var(--muted)]">@{profile.handle}</p>
            <p className="text-sm text-[var(--muted-2)]">
              {profile.headline ?? "Headline coming soon."}
            </p>
          </div>
          {isOwner ? (
            <Link
              href="/dashboard/settings"
              className="rounded-full border border-[var(--border)] bg-[var(--panel-muted)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel)]"
            >
              Edit settings
            </Link>
          ) : null}
        </div>

        <StatsCards stats={stats} />

        <CumulativeHoursChart data={cumulativeChartData} totalHours={stats?.totalTime ?? 0} />

        <CurrencyCards flights={currencyFlights} window90Start={currency90Start} window180Start={currency180Start} />

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text)]">Routes map</h2>
              <p className="text-sm text-[var(--muted)]">Mapped routes from imported flights.</p>
            </div>
            <p className="text-xs text-[var(--muted-2)]">{mapRoutes.length} routes</p>
          </div>
          {routesForMap.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border)]">
              <FlightsMap airports={airportsForMap} routes={routesForMap} />
            </div>
          ) : (
            <div className="mt-4 flex h-64 items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--panel-muted)]">
              <p className="text-sm text-[var(--muted)]">No mapped routes yet. Seed airports or import flights.</p>
            </div>
          )}
          {missingAirportsNote ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Some airports are missing coordinates: {missingAirportsNote}
            </p>
          ) : null}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <Heatmap data={heatmapData} />
          </div>
          <div className="min-w-0 lg:col-span-1">
            <RoutesTable routes={routes} />
          </div>
        </div>

        <FunFacts facts={fallbackFacts} />

        <RecentFlights flights={recentFlights} />

        <div className="flex gap-3 text-sm text-[var(--muted)]">
          <Link href="/p/demo" className="hover:text-[var(--text-strong)]">
            View demo
          </Link>
          <span className="text-[var(--muted-2)]">•</span>
          <Link href="/" className="hover:text-[var(--text-strong)]">
            Home
          </Link>
        </div>
      </div>
    </ThemeScope>
  );
}
