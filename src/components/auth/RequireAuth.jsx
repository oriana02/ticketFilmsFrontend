import { useAuth } from "react-oidc-context";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.isLoading) {
    return <div>Cargando...</div>;
  }

  if (!auth.isAuthenticated) {
    // Guarda a dónde quería ir, pero manda a TU página /login (no a Cognito)
    sessionStorage.setItem("post_login_redirect", location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
