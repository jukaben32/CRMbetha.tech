import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTasksDigestEmail } from "@/lib/leads/notify";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();

  // "Fin de hoy" en UTC: aproximado (el servidor corre en UTC en Vercel,
  // así que en RD, UTC-4, esto captura tareas de hoy hasta ~8pm hora local).
  const endOfToday = new Date();
  endOfToday.setUTCHours(23, 59, 59, 999);

  const { data: tasks, error } = await admin
    .from("tasks")
    .select("id, title, due_at, leads(id, name)")
    .eq("done", false)
    .not("due_at", "is", null)
    .lte("due_at", endOfToday.toISOString());

  if (error) {
    return NextResponse.json({ error: "No se pudo consultar tareas" }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

  await sendTasksDigestEmail(
    (tasks ?? [])
      .filter((t) => t.leads)
      .map((t) => ({
        title: t.title,
        dueAt: t.due_at,
        leadId: t.leads!.id,
        leadName: t.leads!.name,
      })),
    appUrl
  );

  return NextResponse.json({ ok: true, count: tasks?.length ?? 0 });
}
