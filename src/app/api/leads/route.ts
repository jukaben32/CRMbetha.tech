import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadSchema } from "@/lib/leads/schema";
import { sendNewLeadEmail } from "@/lib/leads/notify";

const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX = 5;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function withCors(response: NextResponse, origin: string | null): NextResponse {
  response.headers.set("Access-Control-Allow-Origin", origin ?? "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return withCors(new NextResponse(null, { status: 204 }), request.headers.get("origin"));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get("origin");

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return withCors(NextResponse.json({ error: "JSON inválido" }, { status: 400 }), origin);
  }

  const parsed = leadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return withCors(
      NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 }),
      origin
    );
  }

  const input = parsed.data;

  // Honeypot: si un bot llenó el campo trampa, respondemos éxito sin guardar nada.
  if (input.company_website) {
    return withCors(NextResponse.json({ ok: true }), origin);
  }

  const admin = createAdminClient();

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, name, allowed_origin")
    .eq("slug", input.project)
    .maybeSingle();

  if (projectError || !project) {
    return withCors(NextResponse.json({ error: "Proyecto desconocido" }, { status: 404 }), origin);
  }

  if (project.allowed_origin && origin !== project.allowed_origin) {
    return withCors(NextResponse.json({ error: "Origen no permitido" }, { status: 403 }), origin);
  }

  const ip = getClientIp(request);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000).toISOString();

  if (ip !== "unknown") {
    const { count } = await admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return withCors(NextResponse.json({ error: "Demasiados envíos, espera un momento" }, { status: 429 }), origin);
    }
  }

  const { error: insertError } = await admin.from("leads").insert({
    project_id: project.id,
    name: input.name,
    email: input.email || null,
    phone: input.phone || null,
    message: input.message || null,
    source: input.source || "website",
    utm_source: input.utm_source || null,
    utm_medium: input.utm_medium || null,
    utm_campaign: input.utm_campaign || null,
    fbclid: input.fbclid || null,
    landing_url: input.landing_url || null,
    ip,
  });

  if (insertError) {
    return withCors(NextResponse.json({ error: "No se pudo guardar el lead" }, { status: 500 }), origin);
  }

  try {
    await sendNewLeadEmail({
      projectName: project.name,
      name: input.name,
      email: input.email || undefined,
      phone: input.phone || undefined,
      message: input.message || undefined,
      source: input.source || "website",
    });
  } catch {
    // El lead ya se guardó; un fallo de email no debe romper la respuesta al cliente.
  }

  return withCors(NextResponse.json({ ok: true }, { status: 201 }), origin);
}
