import apiClient from "../lib/apiClient";

export async function getSalas() {
  const { data } = await apiClient.get("/api/asientos/sala");
  return data;
}

export async function getAsientosPorSala(salaId) {
  const { data } = await apiClient.get(`/api/asientos/sala/${salaId}`);
  return data;
}

export async function getMapaFuncion(funcionId) {
  const { data } = await apiClient.get(`/api/asientos/mapa/${funcionId}`);
  return data;
}

export async function consultarReserva(reservaId) {
  const { data } = await apiClient.get(`/api/asientos/reserva/${reservaId}`);
  return data;
}

export async function liberarReserva(reservaId) {
  await apiClient.delete(`/api/asientos/reserva/${reservaId}`);
}

// TODO: usuarioId debería salir del JWT en el backend, no viajar en el body
// (ver nota de seguridad arriba). Se deja así mientras el backend no cambie.
export async function reservarAsientos({ usuarioId, funcionId, asientosSolicitados }) {
  const { data } = await apiClient.post("/api/asientos/reserva", {
    usuarioId,
    funcionId,
    asientosSolicitados,
  });
  return data;
}
