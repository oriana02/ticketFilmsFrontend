import { useAuth } from "react-oidc-context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      const redirectTo = sessionStorage.getItem("post_login_redirect") || "/";
      sessionStorage.removeItem("post_login_redirect");
      navigate(redirectTo, { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.error) {
    return <div>Error al iniciar sesión: {auth.error.message}</div>;
  }

  return <div>Procesando inicio de sesión...</div>;
}
