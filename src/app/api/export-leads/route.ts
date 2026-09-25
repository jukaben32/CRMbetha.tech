import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyLeadFilters } from "@/lib/leads/query";
import { toCsv } from "@/lib/leads/csv";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const { data: leads } = await applyLeadFilters(supabase, {
    project: params.get("project") ?? undefined,
    stage: params.get("stage") ?? undefined,
    q: params.get("q") ?? undefined,
  }).limit(5000);

  const csv = toCsv(
    ["Nombre", "Proyecto", "Email", "Teléfono", "Etapa", "Fuente", "UTM campaña", "Fecha"],
    (leads ?? []).map((lead) => [
      lead.name,
      lead.projects?.name,
      lead.email,
      lead.phone,
      lead.stage,
      lead.source,
      lead.utm_campaign,
      new Date(lead.created_at).toISOString(),
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
