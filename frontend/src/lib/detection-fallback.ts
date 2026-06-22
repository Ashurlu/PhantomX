import type { DetectionIntel } from "@/lib/types";
import type { RangeCode } from "@/store/ui";

const BASE: DetectionIntel = {
  totalAlerts: 6119,
  weeklyAverage: 105,
  period: "24h",
  categories: [
    { name: "Endpoint", value: 2068, color: "#ec4899" },
    { name: "Email", value: 1789, color: "#3b82f6" },
    { name: "Identity", value: 966, color: "#6366f1" },
    { name: "Cloud", value: 648, color: "#06b6d4" },
    { name: "Threat Intel", value: 469, color: "#14b8a6" },
    { name: "Insider Threat", value: 179, color: "#94a3b8" },
  ],
  severities: [
    { name: "Critical", value: 306, color: "#dc2626" },
    { name: "High", value: 918, color: "#f97316" },
    { name: "Medium", value: 2753, color: "#f59e0b" },
    { name: "Low", value: 2142, color: "#3B82F6" },
  ],
  sources: [
    { name: "Microsoft Defender", value: 1968, pct: 32, tags: "Email, Threat Intel" },
    { name: "SentinelOne", value: 1285, pct: 21, tags: "Endpoint" },
    { name: "CrowdStrike", value: 1105, pct: 18, tags: "Endpoint, Identity" },
    { name: "Microsoft Sentinel", value: 793, pct: 13, tags: "Cloud, Identity" },
    { name: "Splunk", value: 644, pct: 11, tags: "Various" },
    { name: "AWS GuardDuty", value: 324, pct: 5, tags: "Cloud" },
  ],
  weekly: Array.from({ length: 30 }, (_, i) => {
    const s = (n: number) => Math.round(40 + 60 * Math.abs(Math.sin(i * 1.3 + n)));
    return { day: i + 1, a: s(1), b: s(2.5), c: s(4) };
  }),
  weeklyLegend: ["CrowdStrike", "Splunk", "Microsoft Defender", "Sumo Logic", "Other"],
};

const RANGE_FACTORS: Record<RangeCode, number> = {
  "15m": 15 / (24 * 60),
  "1h": 1 / 24,
  "24h": 1,
  "7d": 6.6,
  "30d": 27,
  "90d": 81,
};

/** Client-side fallback when the BFF detection route is unavailable (e.g. stale backend). */
export function detectionFallback(range: RangeCode): DetectionIntel {
  const f = RANGE_FACTORS[range] ?? 1;
  const s = (n: number) => Math.round(n * f);
  return {
    ...BASE,
    period: range,
    totalAlerts: s(BASE.totalAlerts),
    weeklyAverage: s(BASE.weeklyAverage),
    categories: BASE.categories.map((c) => ({ ...c, value: s(c.value) })),
    severities: BASE.severities.map((c) => ({ ...c, value: s(c.value) })),
    sources: BASE.sources.map((c) => ({ ...c, value: s(c.value) })),
    weekly: BASE.weekly.map((w) => ({ ...w, a: s(w.a), b: s(w.b), c: s(w.c) })),
  };
}
