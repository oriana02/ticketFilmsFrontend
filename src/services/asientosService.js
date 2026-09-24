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

// El usuario se obtiene del JWT en el backend, no viaja en el body.

export async function reservarAsientos({ funcionId, asientosSolicitados }) {
  const { data } = await apiClient.post("/api/asientos/reserva", {
    funcionId,
    asientosSolicitados,
  });
  return data;
}

// En axios el cuerpo de un DELETE va dentro de `data`.
export async function liberarReserva({ funcionId, asientosSolicitados }) {
  await apiClient.delete("/api/asientos/reserva", {
    data: { funcionId, asientosSolicitados },
  });
}
