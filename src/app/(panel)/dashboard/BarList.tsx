import type { CountRow } from "@/lib/dashboard/metrics";

export function BarList({ rows, emptyLabel }: { rows: CountRow[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">{emptyLabel}</p>;
  }

  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-muted" title={row.name}>
            {row.name}
          </span>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-r-[4px]"
              style={{
                width: `${Math.max((row.count / max) * 100, 4)}%`,
                backgroundColor: row.color ?? "var(--accent)",
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right tabular-nums text-muted">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
