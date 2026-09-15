import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const oidcConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_REDIRECT_URI,
  response_type: "code",
  scope: "openid email",
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
  automaticSilentRenew: true,
  onSigninCallback: () => {
    // Limpia el ?code=...&state=... de la URL tras procesar el login
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

// Instancia única, compartida entre <AuthProvider> y apiClient.js
export const userManager = new UserManager(oidcConfig);
