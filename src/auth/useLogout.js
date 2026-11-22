import { useAuth } from "react-oidc-context";

const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const LOGOUT_URI =
  import.meta.env.VITE_COGNITO_LOGOUT_URI || "http://localhost:5173/";

export default function useLogout() {
  const auth = useAuth();

  return async function logout() {
    try {
      await auth.removeUser();
      const key = `oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${CLIENT_ID}`;
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
      window.location.replace(
        `${DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`,
      );
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      window.location.replace(LOGOUT_URI);
    }
  };
}
