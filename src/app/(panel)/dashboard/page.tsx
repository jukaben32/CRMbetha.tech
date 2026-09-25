import { createClient } from "@/lib/supabase/server";
import { byProject, bySource, byStage, topCampaigns, totals } from "@/lib/dashboard/metrics";
import { BarList } from "./BarList";
import { StageFunnel } from "./StageFunnel";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: leads } = await supabase
    .from("leads")
    .select("stage, source, utm_campaign, projects(name, color)")
    .limit(5000);

  const rows = leads ?? [];
  const stats = totals(rows);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Leads totales" value={String(stats.total)} />
        <StatTile label="Ganados" value={String(stats.ganado)} />
        <StatTile label="Tasa de conversión" value={`${stats.conversionRate.toFixed(1)}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Leads por proyecto</h2>
          <div className="mt-4">
            <BarList rows={byProject(rows)} emptyLabel="Sin leads todavía." />
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Leads por fuente</h2>
          <div className="mt-4">
            <BarList rows={bySource(rows)} emptyLabel="Sin leads todavía." />
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Top campañas</h2>
          <div className="mt-4">
            <BarList rows={topCampaigns(rows)} emptyLabel="Ningún lead trae utm_campaign todavía." />
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold tracking-tight">Embudo por etapa</h2>
          <div className="mt-4">
            <StageFunnel rows={byStage(rows)} />
          </div>
        </div>
      </div>
    </div>
  );
}
