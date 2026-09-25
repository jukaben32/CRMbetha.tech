import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export interface LeadFilters {
  project?: string;
  stage?: string;
  q?: string;
}

// PostgREST usa , ( ) . como separadores de operadores dentro de .or();
// se descartan para que el texto de búsqueda no pueda inyectar filtros extra.
const UNSAFE_FILTER_CHARS = /[,()."]/g;

export const LEAD_LIST_COLUMNS =
  "id, name, email, phone, message, stage, source, utm_source, utm_medium, utm_campaign, created_at, projects!inner(name, slug, color)";

export function applyLeadFilters(
  supabase: SupabaseClient<Database>,
  filters: LeadFilters
) {
  let query = supabase
    .from("leads")
    .select(LEAD_LIST_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.project) {
    query = query.eq("projects.slug", filters.project);
  }
  if (filters.stage) {
    query = query.eq("stage", filters.stage);
  }
  if (filters.q) {
    const safe = filters.q.replace(UNSAFE_FILTER_CHARS, "").trim();
    if (safe) {
      query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
    }
  }

  return query;
}

export const STAGES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "demo", label: "Demo" },
  { value: "propuesta", label: "Propuesta" },
  { value: "ganado", label: "Ganado" },
  { value: "perdido", label: "Perdido" },
] as const;

export type Stage = (typeof STAGES)[number]["value"];
