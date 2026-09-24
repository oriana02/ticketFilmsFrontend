// Saca un mensaje legible de una respuesta de error del backend.
export function errorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim() && data.length < 200) return data;
  return data?.mensaje || data?.error || fallback;
}
