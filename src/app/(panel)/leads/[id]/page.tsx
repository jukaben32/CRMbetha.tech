import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STAGES } from "@/lib/leads/query";
import { toWhatsAppLink } from "@/lib/leads/whatsapp";
import { NoteForm } from "./NoteForm";
import { TaskList } from "./TaskList";

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: lead }, { data: notes }, { data: tasks }] = await Promise.all([
    supabase
      .from("leads")
      .select(
        "id, name, email, phone, message, stage, source, utm_source, utm_medium, utm_campaign, fbclid, landing_url, created_at, projects(name, slug, color)"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("lead_notes")
      .select("id, body, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("id, title, due_at, done")
      .eq("lead_id", id)
      .order("done", { ascending: true })
      .order("due_at", { ascending: true, nullsFirst: false }),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link href="/leads" className="text-sm text-muted hover:text-foreground">
        ← Volver a leads
      </Link>

      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{lead.name}</h1>
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-xs"
              style={{
                backgroundColor: `${lead.projects?.color ?? "#6d8bff"}22`,
                color: lead.projects?.color ?? "#6d8bff",
              }}
            >
              {lead.projects?.name}
            </span>
          </div>
          <span className="rounded-full border border-surface-border px-3 py-1 text-sm">
            {STAGE_LABEL[lead.stage] ?? lead.stage}
          </span>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd>{lead.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Teléfono</dt>
            <dd className="flex items-center gap-2">
              {lead.phone || "—"}
              {lead.phone && (
                <a
                  href={toWhatsAppLink(lead.phone, `Hola ${lead.name}, te contacto de ${lead.projects?.name ?? "la agencia"}...`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366]/15 px-2 py-0.5 text-xs text-[#25D366]"
                >
                  WhatsApp
                </a>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Fuente</dt>
            <dd>{lead.source}</dd>
          </div>
          <div>
            <dt className="text-muted">Fecha</dt>
            <dd>
              {new Date(lead.created_at).toLocaleString("es-DO", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
          </div>
          {(lead.utm_source || lead.utm_campaign) && (
            <div className="sm:col-span-2">
              <dt className="text-muted">Campaña</dt>
              <dd>
                {[lead.utm_source, lead.utm_medium, lead.utm_campaign].filter(Boolean).join(" / ")}
              </dd>
            </div>
          )}
          {lead.message && (
            <div className="sm:col-span-2">
              <dt className="text-muted">Mensaje</dt>
              <dd className="whitespace-pre-wrap">{lead.message}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold tracking-tight">Tareas</h2>
        <div className="mt-4">
          <TaskList leadId={lead.id} initialTasks={tasks ?? []} />
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold tracking-tight">Notas</h2>
        <div className="mt-4">
          <NoteForm leadId={lead.id} />
        </div>
        <ul className="mt-6 flex flex-col gap-4">
          {notes?.map((note) => (
            <li key={note.id} className="border-t border-surface-border pt-4 text-sm first:border-0 first:pt-0">
              <p className="whitespace-pre-wrap">{note.body}</p>
              <p className="mt-1 text-xs text-muted">
                {new Date(note.created_at).toLocaleString("es-DO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
          {notes?.length === 0 && <p className="text-sm text-muted">Todavía no hay notas.</p>}
        </ul>
      </div>
    </div>
  );
}
