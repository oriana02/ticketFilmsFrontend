import axios from "axios";
import { userManager } from "../auth/oidcConfig";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

// Rutas públicas: no requieren token y NO deben disparar re-login.
// OJO: incluye TODA la cartelera (eventos, funciones, etc.) y la sala de asientos.
const esPublica = (url = "") =>
  url.includes("/api/cartelera") || url.endsWith("/api/asientos/sala");

// Adjunta el access_token (NO el id_token) solo si la ruta NO es pública
// y hay sesión vigente.
apiClient.interceptors.request.use(async (config) => {
  if (esPublica(config.url)) return config;

  const user = await userManager.getUser();
  if (user && !user.expired && user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

// Si el API Manager responde 401 en una ruta protegida, fuerza re-login.
// En rutas públicas no redirige (evita el loop de login).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !esPublica(url)) {
      userManager.signinRedirect();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
