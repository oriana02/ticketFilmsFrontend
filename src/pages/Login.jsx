import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";
import "../styles/inicioSesion.css";

export default function Login() {
  const auth = useAuth();
  const location = useLocation();

  function handleGoogleLogin() {
    // RF-18: guarda a dónde quería ir el usuario antes del login
    const from = location.state?.from?.pathname || "/";
    sessionStorage.setItem("post_login_redirect", from);

    // Salta directo a Google, sin mostrar el selector de Cognito
    auth.signinRedirect({
      extraQueryParams: { identity_provider: "Google" },
    });
  }

  return (
    <main className="login">
      <div className="login__container">
        <h2 className="login__title">Iniciar sesión</h2>
        <div className="login__card">
          <p className="login__subtitle">
            Ingresa con tu cuenta de Google para reservar asientos y comprar
            boletos.
          </p>
          <div className="login__google">
            <button className="login__google-btn" onClick={handleGoogleLogin}>
              Iniciar sesión con Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
