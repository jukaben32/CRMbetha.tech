import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { applyLeadFilters, STAGES, type LeadFilters } from "@/lib/leads/query";

interface LeadsPageProps {
  searchParams: Promise<LeadFilters>;
}

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const filters = await searchParams;
  const supabase = await createClient();

  const [{ data: projects }, { data: leads }] = await Promise.all([
    supabase.from("projects").select("slug, name").order("name"),
    applyLeadFilters(supabase, filters).limit(200),
  ]);

  const exportParams = new URLSearchParams(
    Object.entries(filters).filter(([, v]) => v) as [string, string][]
  ).toString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Leads</h1>
        <a
          href={`/api/export-leads${exportParams ? `?${exportParams}` : ""}`}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-sm text-muted transition hover:text-foreground"
        >
          Exportar CSV
        </a>
      </div>

      <form className="glass-card flex flex-wrap items-end gap-3 p-4" method="get">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted" htmlFor="q">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            defaultValue={filters.q ?? ""}
            placeholder="Nombre, email o teléfono"
            className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted" htmlFor="project">
            Proyecto
          </label>
          <select
            id="project"
            name="project"
            defaultValue={filters.project ?? ""}
            className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="">Todos</option>
            {projects?.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted" htmlFor="stage">
            Etapa
          </label>
          <select
            id="stage"
            name="stage"
            defaultValue={filters.stage ?? ""}
            className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          >
            <option value="">Todas</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Filtrar
        </button>
        {(filters.q || filters.project || filters.stage) && (
          <Link href="/leads" className="text-sm text-muted underline decoration-dotted">
            Limpiar
          </Link>
        )}
      </form>

      <div className="glass-card overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-surface-border text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Proyecto</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Etapa</th>
              <th className="px-4 py-3 font-medium">Fuente</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => (
              <tr key={lead.id} className="border-b border-surface-border/60 last:border-0 hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/leads/${lead.id}`} className="font-medium hover:text-accent">
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: `${lead.projects?.color ?? "#6d8bff"}22`,
                      color: lead.projects?.color ?? "#6d8bff",
                    }}
                  >
                    {lead.projects?.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{lead.email || lead.phone || "—"}</td>
                <td className="px-4 py-3">{STAGE_LABEL[lead.stage] ?? lead.stage}</td>
                <td className="px-4 py-3 text-muted">{lead.source}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(lead.created_at).toLocaleDateString("es-DO", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {leads?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No hay leads todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
