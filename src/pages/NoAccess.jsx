import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { homeVersion } from "../config/versions";
import useLogout from "../auth/useLogout";

export default function NoAccess() {
  const { user } = useAuth();
  const logout = useLogout();
  const home = homeVersion(user);

  // Si el usuario pertenece a otra versión, lo mandamos a la suya con una espera
  // para que alcance a ver el aviso.
  useEffect(() => {
    if (!home?.url) return;
    const t = setTimeout(() => window.location.replace(home.url), 4000);
    return () => clearTimeout(t);
  }, [home]);

  return (
    <div className="container empty-state">
      <strong>No tienes acceso a esta versión</strong>
      <p>Tu cuenta no está habilitada para esta versión de TicketFilms.</p>
      {home?.url && (
        <p style={{ marginTop: 8 }}>
          Te llevaremos a tu versión ({home.label}) en unos segundos…
        </p>
      )}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {home?.url && (
          <a href={home.url} className="btn btn--primary btn--m">
            Ir a mi versión ({home.label})
          </a>
        )}
        <button className="btn btn--outline btn--m" onClick={logout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
