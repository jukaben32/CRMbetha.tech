import type { CountRow } from "@/lib/dashboard/metrics";
import { STAGES } from "@/lib/leads/query";
import { SEQUENTIAL_BLUE_ORDINAL, STATUS_CRITICAL, STATUS_GOOD } from "@/lib/dashboard/palette";

const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.value, s.label]));

// nuevo/contactado/demo/propuesta: progresión (secuencial azul, claro→oscuro).
// ganado/perdido: son un estado (bueno/malo), no "más avanzado" en la escala.
const STAGE_COLOR: Record<string, string> = {
  nuevo: SEQUENTIAL_BLUE_ORDINAL[0],
  contactado: SEQUENTIAL_BLUE_ORDINAL[1],
  demo: SEQUENTIAL_BLUE_ORDINAL[2],
  propuesta: SEQUENTIAL_BLUE_ORDINAL[3],
  ganado: STATUS_GOOD,
  perdido: STATUS_CRITICAL,
};

export function StageFunnel({ rows }: { rows: CountRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-muted">{STAGE_LABEL[row.name] ?? row.name}</span>
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-r-[4px]"
              style={{
                width: `${Math.max((row.count / max) * 100, 4)}%`,
                backgroundColor: STAGE_COLOR[row.name] ?? "var(--accent)",
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right tabular-nums text-muted">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
