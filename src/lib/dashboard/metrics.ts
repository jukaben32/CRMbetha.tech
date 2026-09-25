import { STAGES } from "@/lib/leads/query";
import { colorForCategory } from "./palette";

export interface MetricLead {
  stage: string;
  source: string;
  utm_campaign: string | null;
  projects: { name: string; color: string } | null;
}

export interface CountRow {
  name: string;
  count: number;
  color?: string;
}

const MAX_CATEGORICAL_SLOTS = 8;

function countBy(leads: MetricLead[], key: (lead: MetricLead) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const lead of leads) {
    const k = key(lead);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return counts;
}

export function byProject(leads: MetricLead[]): CountRow[] {
  const colorByName = new Map<string, string>();
  const counts = countBy(leads, (l) => l.projects?.name ?? "Sin proyecto");
  for (const lead of leads) {
    if (lead.projects) colorByName.set(lead.projects.name, lead.projects.color);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, color: colorByName.get(name) ?? "#6d8bff" }))
    .sort((a, b) => b.count - a.count);
}

export function bySource(leads: MetricLead[]): CountRow[] {
  const counts = countBy(leads, (l) => l.source || "desconocido");

  // Orden alfabético estable para asignar color: no cambia de un
  // renderizado a otro solo porque cambió el conteo de leads.
  const alphabetical = [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const withColor = alphabetical.slice(0, MAX_CATEGORICAL_SLOTS - 1).map((row, i) => ({
    ...row,
    color: colorForCategory(i),
  }));

  if (alphabetical.length <= MAX_CATEGORICAL_SLOTS) {
    const rest = alphabetical.slice(MAX_CATEGORICAL_SLOTS - 1).map((row, i) => ({
      ...row,
      color: colorForCategory(MAX_CATEGORICAL_SLOTS - 1 + i),
    }));
    return [...withColor, ...rest].sort((a, b) => b.count - a.count);
  }

  const restCount = alphabetical
    .slice(MAX_CATEGORICAL_SLOTS - 1)
    .reduce((sum, r) => sum + r.count, 0);
  return [...withColor, { name: "Otros", count: restCount, color: "#898781" }].sort(
    (a, b) => b.count - a.count
  );
}

export function topCampaigns(leads: MetricLead[], limit = 5): CountRow[] {
  const withCampaign = leads.filter((l) => l.utm_campaign);
  const counts = countBy(withCampaign, (l) => l.utm_campaign!);
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function byStage(leads: MetricLead[]): CountRow[] {
  const counts = countBy(leads, (l) => l.stage);
  return STAGES.map((s) => ({ name: s.value, count: counts.get(s.value) ?? 0 }));
}

export interface Totals {
  total: number;
  ganado: number;
  perdido: number;
  conversionRate: number;
}

export function totals(leads: MetricLead[]): Totals {
  const total = leads.length;
  const ganado = leads.filter((l) => l.stage === "ganado").length;
  const perdido = leads.filter((l) => l.stage === "perdido").length;
  const conversionRate = total === 0 ? 0 : (ganado / total) * 100;
  return { total, ganado, perdido, conversionRate };
}
