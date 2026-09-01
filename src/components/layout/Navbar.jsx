import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context"; // ← cambiado
import { movies } from "../../data/movies";
import { events } from "../../data/events";
import "../../styles/Navbar.css";

const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const LOGOUT_URI =
  import.meta.env.VITE_COGNITO_LOGOUT_URI || "http://localhost:5173/";

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuth(); // ← cambiado
  const navigate = useNavigate();

  const isAuthenticated = auth.isAuthenticated;
  const user = auth.user?.profile; // { email, name, sub, ... }

  const results =
    query.trim().length > 1
      ? [
          ...movies
            .filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
            .map((m) => ({ kind: "pelicula", ...m })),
          ...events
            .filter((e) => e.title.toLowerCase().includes(query.toLowerCase()))
            .map((e) => ({ kind: "evento", ...e })),
        ].slice(0, 6)
      : [];

  function goToResult(item) {
    setSearchOpen(false);
    setQuery("");
    navigate(`/titulo/${item.kind}/${item.id}`);
  }

  async function handleLogout() {
    await auth.removeUser(); // limpia el estado local primero
    const url = `${COGNITO_DOMAIN}/logout?client_id=${COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_URI)}`;
    window.location.href = url;
  }

  return (
    <header className="nav">
      <div className="container nav__row">
        <Link to="/" className="nav__logo" onClick={() => setMenuOpen(false)}>
          <span className="nav__logo-mark">TF</span>
          <span className="nav__logo-word">TicketFilms</span>
        </Link>

        <nav className={`nav__links ${menuOpen ? "is-open" : ""}`}>
          <NavLink to="/peliculas" onClick={() => setMenuOpen(false)}>
            Películas
          </NavLink>
          <NavLink to="/eventos" onClick={() => setMenuOpen(false)}>
            Eventos
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/cuenta" onClick={() => setMenuOpen(false)}>
              Mis boletos
            </NavLink>
          ) : (
            <button
              className="nav__links-mobile-login"
              onClick={() => {
                setMenuOpen(false);
                navigate("/login");
              }}
            >
              Iniciar sesión
            </button>
          )}
        </nav>

        <div className="nav__actions">
          <button
            className="nav__icon-btn"
            aria-label="Buscar"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>

          {isAuthenticated ? (
            <div className="nav__user">
              <span className="nav__user-avatar" aria-hidden="true">
                {user?.name?.charAt(0) || user?.email?.charAt(0)}
              </span>
              <span className="nav__user-name">
                {user?.name?.split(" ")[0] || user?.email}
              </span>
              <button className="nav__user-logout" onClick={handleLogout}>
                Salir
              </button>
            </div>
          ) : (
            <button className="nav__login" onClick={() => navigate("/login")}>
              Ingresar
            </button>
          )}

          <button
            className="nav__burger"
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="nav__search">
          <div className="container">
            <input
              autoFocus
              type="text"
              value={query}
              placeholder="Buscar películas o eventos…"
              onChange={(e) => setQuery(e.target.value)}
            />
            {results.length > 0 && (
              <ul className="nav__search-results">
                {results.map((item) => (
                  <li key={`${item.kind}-${item.id}`}>
                    <button onClick={() => goToResult(item)}>
                      <img src={item.poster} alt="" />
                      <span>
                        <strong>{item.title}</strong>
                        <em>
                          {item.kind === "pelicula" ? "Película" : "Evento"}
                        </em>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <line
        x1="21"
        y1="21"
        x2="16.2"
        y2="16.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
