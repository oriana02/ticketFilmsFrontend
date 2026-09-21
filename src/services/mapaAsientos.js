import { getMapaFuncion, getSalas, getAsientosPorSala } from "./asientosService";

// Arma el mapa cruzando dos cosas de ms-asientos:
//  - /mapa/{funcionId}: qué asientos están libres, reservados u ocupados
//  - /sala/{salaId}: fila, número y categoría de cada asiento
// Los asientos que otro usuario tiene reservados se muestran como ocupados;
// los reservados por el propio usuario quedan disponibles (puede renovarlos).
export async function loadSeatMap(showtime, userId) {
  const [mapa, salas] = await Promise.all([getMapaFuncion(showtime.id), getSalas()]);

  const sala =
    salas.find((s) => s.sala_codigo === showtime.salaCodigo) ||
    salas.find((s) => s.nombre === showtime.salaCodigo);
  if (!sala) throw new Error("SALA_NO_ENCONTRADA");

  const asientos = await getAsientosPorSala(sala.id);
  const estados = new Map(mapa.map((m) => [m.asiento_id, m]));
  const porFila = new Map();

  for (const a of asientos) {
    const m = estados.get(a.id);
    let status = "occupied";
    if (m?.estado === "DISPONIBLE") status = "available";
    else if (m?.estado === "RESERVADO" && userId && m.usuario_id === userId) status = "available";

    const seat = {
      id: `${a.fila}${a.numero}`,
      asientoId: a.id,
      row: a.fila,
      number: a.numero,
      category: a.categoria === "PREMIUM" ? "premium" : "regular",
      status,
    };
    if (!porFila.has(a.fila)) porFila.set(a.fila, []);
    porFila.get(a.fila).push(seat);
  }

  const rows = [...porFila.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([row, seats]) => ({
      row,
      seats: seats.sort((x, y) => x.number - y.number),
      isPremium: seats.some((s) => s.category === "premium"),
    }));

  const perRow = Math.max(0, ...rows.map((r) => r.seats.length));
  return {
    rows,
    venue: { name: sala.nombre, aisleAfter: perRow >= 8 ? [Math.floor(perRow / 2)] : [] },
  };
}

export function seatMapErrorMessage(err) {
  const status = err?.response?.status;
  if (err?.message === "SALA_NO_ENCONTRADA") return "No encontramos la sala de esta función.";
  if (status === 404) return "Esta función ya no existe.";
  if (status === 503) return "El servicio de cartelera no está disponible. Intenta en un momento.";
  return "No pudimos cargar el mapa de asientos.";
}
