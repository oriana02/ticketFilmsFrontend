import apiClient from "../lib/apiClient";

const BASE = "/api/admin/kafka";

// GET /topics -> ["boleto.comprado", "compra.fallida", ...]
export async function getTopicos() {
  const { data } = await apiClient.get(`${BASE}/topics`);
  return data;
}

// GET /topics/{nombre} -> { nombre, particiones, replicas, protegido }
export async function getTopico(nombre) {
  const { data } = await apiClient.get(
    `${BASE}/topics/${encodeURIComponent(nombre)}`,
  );
  return data;
}

// POST /topics -> 201 { mensaje, nombre }
export async function crearTopico({ nombre, particiones, replicas }) {
  const { data } = await apiClient.post(`${BASE}/topics`, {
    nombre,
    particiones,
    replicas,
  });
  return data;
}

// DELETE /topics/{nombre} -> 200 { mensaje, nombre }
export async function eliminarTopico(nombre) {
  const { data } = await apiClient.delete(
    `${BASE}/topics/${encodeURIComponent(nombre)}`,
  );
  return data;
}

// GET /consumer-groups -> [{ grupoId, estado, topicos: [] }]
export async function getGruposConsumidores() {
  const { data } = await apiClient.get(`${BASE}/consumer-groups`);
  return data;
}
