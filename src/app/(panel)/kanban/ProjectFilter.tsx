"use client";

export function ProjectFilter({
  projects,
  selected,
}: {
  projects: { slug: string; name: string }[];
  selected: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      <select
        name="project"
        defaultValue={selected}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-surface-border bg-white/5 px-3 py-1.5 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        <option value="">Todos los proyectos</option>
        {projects.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
      </select>
    </form>
  );
}
