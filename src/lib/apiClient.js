import axios from "axios";
import { userManager } from "../auth/oidcConfig";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

// Debe coincidir con lo que el gateway y los microservicios dejan sin token:
//  - GET /api/cartelera/**        (público)
const esPublica = (url = "") => {
  const path = url.split("?")[0].replace(/\/+$/, "");
  return path.startsWith("/api/cartelera");
};

apiClient.interceptors.request.use(async (config) => {
  if (esPublica(config.url)) {
    console.log("[apiClient] pública, sin token:", config.url);
    return config;
  }

  let user = await userManager.getUser();
  console.log("[apiClient] user?", !!user, "expired?", user?.expired);

  // Si el token expiró, intentamos renovarlo silenciosamente
  if (user && user.expired) {
    try {
      console.log("[apiClient] token expirado, intentando renewSilent");
      user = await userManager.signinSilent();
      console.log("[apiClient] renovado ok?", !!user);
    } catch (e) {
      console.warn("[apiClient] renewSilent falló:", e);
      await userManager.signinRedirect();
      return Promise.reject(new Error("TOKEN_EXPIRED"));
    }
  }

  if (user && user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
    console.log("[apiClient] Authorization adjuntado a", config.url);
  } else {
    console.warn("[apiClient] NO hay token para", config.url);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    sessionStorage.removeItem("auth_redirect_at");
    return response;
  },
  (error) => {
    const url = error.config?.url || "";
    const method = error.config?.method;
    console.warn("[apiClient] error", error.response?.status, url);

    const esSalas = url.split("?")[0].startsWith("/api/asientos/sala");

    if (error.response?.status === 401 && !esPublica(url, method) && !esSalas) {
      const last = Number(sessionStorage.getItem("auth_redirect_at") || 0);
      if (Date.now() - last > 30000) {
        sessionStorage.setItem("auth_redirect_at", String(Date.now()));
        userManager.signinRedirect();
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
