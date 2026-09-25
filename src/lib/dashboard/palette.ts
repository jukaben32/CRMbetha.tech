// Paleta categórica validada (dataviz skill) contra el fondo real de la
// app (#080b12, modo oscuro). Orden fijo: nunca reasignar por ranking,
// solo por posición alfabética estable de cada "fuente".
export const CATEGORICAL_DARK = [
  "#3987e5", // blue
  "#d95926", // orange
  "#199e70", // aqua
  "#c98500", // yellow
  "#d55181", // magenta
  "#008300", // green
  "#9085e9", // violet
  "#e66767", // red
] as const;

// Rampa secuencial azul (un solo hue, claro→oscuro) para el embudo de
// etapas intermedias, dentro del rango seguro para fondo oscuro (≤ step 600).
export const SEQUENTIAL_BLUE_ORDINAL = ["#b7d3f6", "#6da7ec", "#2a78d6", "#184f95"] as const;

// Colores de estado (fijos, nunca reutilizados como serie categórica).
export const STATUS_GOOD = "#0ca30c";
export const STATUS_CRITICAL = "#d03b3b";

export function colorForCategory(index: number): string {
  return CATEGORICAL_DARK[index % CATEGORICAL_DARK.length];
}
