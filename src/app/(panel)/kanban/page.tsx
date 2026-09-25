import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "./KanbanBoard";
import { ProjectFilter } from "./ProjectFilter";

interface KanbanPageProps {
  searchParams: Promise<{ project?: string }>;
}

export default async function KanbanPage({ searchParams }: KanbanPageProps) {
  const { project } = await searchParams;
  const supabase = await createClient();

  const [{ data: projects }, leadsQuery] = await Promise.all([
    supabase.from("projects").select("slug, name").order("name"),
    (async () => {
      let query = supabase
        .from("leads")
        .select("id, name, email, phone, stage, projects!inner(name, color, slug)")
        .order("created_at", { ascending: false })
        .limit(300);
      if (project) query = query.eq("projects.slug", project);
      return query;
    })(),
  ]);

  const { data: leads } = leadsQuery;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Kanban</h1>
        <ProjectFilter projects={projects ?? []} selected={project ?? ""} />
      </div>

      <KanbanBoard initialLeads={leads ?? []} />
    </div>
  );
}
