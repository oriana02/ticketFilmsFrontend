import { useAuth } from "react-oidc-context";
import { APP_VERSION, VERSIONS, isAdmin } from "../../utils/versionAccess";
import "../../styles/Version.css";

export default function VersionSwitcher() {
  const auth = useAuth();
  if (!auth.isAuthenticated) return null;

  if (!isAdmin(auth.user?.profile)) {
    return (
      <span className="nav__version" title="Versión de la app">
        v{APP_VERSION}
      </span>
    );
  }

  function handleChange(e) {
    const target = VERSIONS.find((v) => v.n === Number(e.target.value));
    if (target?.url && target.n !== APP_VERSION) {
      window.location.href = target.url;
    }
  }

  return (
    <select
      className="nav__version"
      aria-label="Cambiar de versión"
      value={APP_VERSION}
      onChange={handleChange}
    >
      {VERSIONS.map((v) => (
        <option
          key={v.n}
          value={v.n}
          disabled={v.n !== APP_VERSION && !v.url}
        >
          {v.label}
          {v.n === APP_VERSION ? " (actual)" : !v.url ? " (sin URL)" : ""}
        </option>
      ))}
    </select>
  );
}
