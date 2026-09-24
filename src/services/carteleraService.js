import apiClient from "../lib/apiClient";

export async function getEventos() {
  const { data } = await apiClient.get("/api/cartelera/eventos");
  return data;
}

export async function getEventoPorId(id) {
  const { data } = await apiClient.get(`/api/cartelera/eventos/${id}`);
  return data;
}

export async function getFuncionPorId(id) {
  const { data } = await apiClient.get(`/api/cartelera/funciones/${id}`);
  return data;
}

export async function getFuncionesPorEvento(eventoId) {
  const { data } = await apiClient.get("/api/cartelera/funciones", {
    params: { eventoId },
  });
  return data;
}

// Nota: crear eventos probablemente debería quedar restringido a un rol
// admin en el API Manager (scope/rol distinto al de un usuario comprador).
export async function crearEvento(evento) {
  const { data } = await apiClient.post("/api/cartelera/eventos", evento);
  return data;
}
