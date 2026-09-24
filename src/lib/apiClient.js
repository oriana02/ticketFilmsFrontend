import axios from "axios";
import { userManager } from "../auth/oidcConfig";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

// Adjunta el access_token (NO el id_token) solo si hay sesión vigente
apiClient.interceptors.request.use(async (config) => {
  const user = await userManager.getUser();
  if (user && !user.expired && user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});

// Si el API Manager responde 401 en una ruta protegida, fuerza re-login.
// En rutas públicas (footer) no redirige.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const esPublica = url.endsWith("/api/asientos/sala");
    if (error.response?.status === 401 && !esPublica) {
      userManager.signinRedirect();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
