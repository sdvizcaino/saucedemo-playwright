/**
 * Presupuestos de tiempo de respuesta, en milisegundos.
 * Referencia: Core Web Vitals. Una navegación "buena" carga en ≤ 2.5 s (LCP) y una
 * interacción por encima de 500 ms se considera "pobre" (INP).
 */
export const PERF_BUDGET = {
  navigationMs: 2_500,
  interactionMs: 500,
} as const;
