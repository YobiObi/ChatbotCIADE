// src/utils/sortCollection.js

export const SORT_MODES = {
  NEWEST: "NEWEST",          // más recientes primero (createdAt DESC)
  OLDEST: "OLDEST",          // más antiguas primero (createdAt ASC)
  PENDING_FIRST: "PENDING_FIRST", // pendientes primero (si aplica)
};

/**
 * Ordena colecciones de forma genérica.
 *
 * @param {Array<any>} items - colección a ordenar
 * @param {string} mode - uno de SORT_MODES
 * @param {Object} opts
 * @param {(item:any)=>Date|string|number|null} [opts.getCreatedAt] - selector de fecha creación
 * @param {(item:any)=>string|null} [opts.getEstado] - selector de estado (para PENDING_FIRST)
 * @param {(a:any,b:any)=>number} [opts.tiebreaker] - desempate opcional
 * @returns {Array<any>} nueva colección ordenada
 */
export function sortCollection(items, mode, opts = {}) {
  const {
    getCreatedAt = (it) => it?.createdAt ?? null,
    getEstado = null, // sólo necesario si usas PENDING_FIRST
    tiebreaker = null,
  } = opts;

  const safeGetTime = (val) => {
    if (!val) return NaN;
    const d = val instanceof Date ? val : new Date(val);
    const t = d.getTime?.();
    return Number.isFinite(t) ? t : NaN;
  };

  const arr = Array.isArray(items) ? [...items] : [];

  // Mapa para PENDING_FIRST (ajústalo si lo necesitas)
  const estadoPriority = {
    pendiente: 0,
    aceptada: 1,
    rechazada: 2,
  };

  const byNewest = (a, b) => {
    const ta = safeGetTime(getCreatedAt(a));
    const tb = safeGetTime(getCreatedAt(b));
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1; // a va después
    if (Number.isNaN(tb)) return -1;
    // DESC
    if (tb !== ta) return tb - ta;
    return tiebreaker ? tiebreaker(a, b) : 0;
  };

  const byOldest = (a, b) => {
    const ta = safeGetTime(getCreatedAt(a));
    const tb = safeGetTime(getCreatedAt(b));
    if (Number.isNaN(ta) && Number.isNaN(tb)) return 0;
    if (Number.isNaN(ta)) return 1;
    if (Number.isNaN(tb)) return -1;
    // ASC
    if (ta !== tb) return ta - tb;
    return tiebreaker ? tiebreaker(a, b) : 0;
  };

  const byPendingFirst = (a, b) => {
    if (typeof getEstado !== "function") {
      // si no hay estado, recaemos en NEWEST
      return byNewest(a, b);
    }
    const ea = (getEstado(a) || "").toLowerCase();
    const eb = (getEstado(b) || "").toLowerCase();
    const pa = estadoPriority[ea] ?? 99;
    const pb = estadoPriority[eb] ?? 99;
    if (pa !== pb) return pa - pb; // menor prioridad primero (pendiente 0)
    // dentro del mismo grupo, más recientes primero
    const r = byNewest(a, b);
    return r !== 0 ? r : 0;
  };

  switch (mode) {
    case SORT_MODES.NEWEST:
      return arr.sort(byNewest);
    case SORT_MODES.OLDEST:
      return arr.sort(byOldest);
    case SORT_MODES.PENDING_FIRST:
      return arr.sort(byPendingFirst);
    default:
      return arr.sort(byNewest);
  }
}
