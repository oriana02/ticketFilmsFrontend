import { useAuth } from "react-oidc-context";
import { Navigate, useLocation } from "react-router-dom";
import {
  APP_VERSION,
  canAccessThisVersion,
  userVersions,
} from "../../utils/versionAccess";
import "../../styles/Version.css";

const OPEN_PATHS = ["/login", "/callback"];

function VersionBlocked({ profile }) {
  const mine = userVersions(profile);
  const others = mine.filter((v) => v.n !== APP_VERSION && v.url);

  return (
    <div className="container empty-state version-blocked">
      <strong>No tienes acceso a la Versión {APP_VERSION}</strong>
      {mine.length === 0 ? (
        <p>
          Tu cuenta no tiene ninguna versión asignada. Pide al administrador
          que te agregue a una.
        </p>
      ) : (
        <p>Tu cuenta tiene acceso a otra versión de TicketFilms.</p>
      )}

      {others.length > 0 && (
        <div className="version-blocked__links">
          {others.map((v) => (
            <a key={v.n} className="btn btn--primary btn--m" href={v.url}>
              Ir a {v.label}
            </a>
          ))}
        </div>
      )}

      <p className="version-blocked__hint">
        ¿Cuenta equivocada? Usa «Salir» arriba para cambiar de usuario.
      </p>
    </div>
  );
}

export default function VersionGate({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (OPEN_PATHS.includes(location.pathname)) return children;

  if (auth.isLoading) {
    return (
      <div className="container empty-state">
        <strong>Cargando…</strong>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!canAccessThisVersion(auth.user?.profile)) {
    return <VersionBlocked profile={auth.user?.profile} />;
  }

  return children;
}
