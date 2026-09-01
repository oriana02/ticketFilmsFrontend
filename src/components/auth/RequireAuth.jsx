import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div>Cargando...</div>;
  }

  if (!auth.isAuthenticated) {
    // RF-18 / CA-04: guarda a dónde quería ir el usuario antes de redirigir
    sessionStorage.setItem("post_login_redirect", location.pathname);
    auth.signinRedirect();
    return null;
  }

  return children;
}