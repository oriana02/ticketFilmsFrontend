import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/inicioSesion.css";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  // RF-18: si venías de una ruta protegida, vuelve allí tras autenticarte.
  const from = location.state?.from?.pathname || "/";

  function handleSuccess(credentialResponse) {
    try {
      loginWithGoogle(credentialResponse);
      navigate(from, { replace: true });
    } catch {
      setError("No pudimos validar tu sesión de Google. Intenta nuevamente.");
    }
  }

  function handleError() {
    setError("El inicio de sesión con Google fue cancelado o falló.");
  }

  return (
    <main className="login">
      <div className="login__container">
        <h2 className="login__title">Iniciar sesión</h2>
        <div className="login__card">
          <p className="login__subtitle">
            Ingresa con tu cuenta de Google para reservar asientos y comprar boletos.
          </p>
          <div className="login__google">
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap />
          </div>
          {error && <p className="login__error">{error}</p>}
        </div>
      </div>
    </main>
  );
}
