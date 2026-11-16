import apiClient from "../lib/apiClient";

// ─────────────────────────────────────────────
// EVENTOS
// ─────────────────────────────────────────────

/**
 * Lista eventos con filtros opcionales.
 * @param {Object} filtros
 * @param {string} [filtros.region]
 * @param {string} [filtros.ciudad]
 * @param {string} [filtros.sede]
 * @param {string} [filtros.tipoEvento]
 * @param {string} [filtros.genero]
 * @param {string} [filtros.fecha]  // formato YYYY-MM-DD
 */
export async function getEventos(filtros = {}) {
  // Limpiamos parámetros vacíos para no mandar ?region=&ciudad=...
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== "" && v != null),
  );

  const { data } = await apiClient.get("/api/cartelera/eventos", { params });
  return data;
}

export async function getEventoPorId(id) {
  const { data } = await apiClient.get(`/api/cartelera/eventos/${id}`);
  return data;
}

export async function crearEvento(evento) {
  const { data } = await apiClient.post("/api/cartelera/eventos", evento);
  return data;
}

// ─────────────────────────────────────────────
// FUNCIONES
// ─────────────────────────────────────────────

export async function getFuncionPorId(id) {
  const { data } = await apiClient.get(`/api/cartelera/funciones/${id}`);
  return data;
}

export async function getFuncionesPorEvento(eventoId, desde = null) {
  const params = { eventoId };
  if (desde) params.desde = desde; // ISO string opcional

  const { data } = await apiClient.get("/api/cartelera/funciones", { params });
  return data;
}

// ─────────────────────────────────────────────
// CATÁLOGOS PARA SELECTS EN CASCADA
// ─────────────────────────────────────────────

export async function getRegiones() {
  const { data } = await apiClient.get("/api/cartelera/regiones");
  return data;
}

export async function getCiudades(region) {
  const { data } = await apiClient.get("/api/cartelera/ciudades", {
    params: { region },
  });
  return data;
}

export async function getSedes(ciudad) {
  const { data } = await apiClient.get("/api/cartelera/sedes", {
    params: { ciudad },
  });
  return data;
}

// ─────────────────────────────────────────────
// ADMIN (requiere JWT del grupo admin)
// ─────────────────────────────────────────────

export async function actualizarEvento(id, evento) {
  const { data } = await apiClient.put(`/api/cartelera/eventos/${id}`, evento);
  return data;
}

export async function eliminarEvento(id) {
  await apiClient.delete(`/api/cartelera/eventos/${id}`);
}

export async function crearFuncion(funcion) {
  const { data } = await apiClient.post("/api/cartelera/funciones", funcion);
  return data;
}

export async function actualizarFuncion(id, funcion) {
  const { data } = await apiClient.put(
    `/api/cartelera/funciones/${id}`,
    funcion,
  );
  return data;
}

export async function eliminarFuncion(id) {
  await apiClient.delete(`/api/cartelera/funciones/${id}`);
}
