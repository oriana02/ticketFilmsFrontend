import { Link } from "react-router-dom";
import useSalas from "../../hooks/useSalas";
import "../../styles/Footer.css";

export default function Footer() {
  const salas = useSalas();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="nav__logo-mark" aria-hidden="true">
            TF
          </span>
          <p>
            Una plataforma, todas las experiencias. <br />
            Cine, música, deporte, artes escénicas y eventos especiales en un
            solo lugar.
          </p>
        </div>

        <div className="footer__col">
          <span className="eyebrow">Explorar</span>
          <Link to="/peliculas">Películas</Link>
          <Link to="/peliculas?estado=proximamente">Próximamente</Link>
          <Link to="/eventos">Eventos</Link>
        </div>

        <div className="footer__col">
          <span className="eyebrow">Cuenta</span>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/cuenta">Mis boletos</Link>
        </div>

        <div className="footer__col">
          <span className="eyebrow">Salas</span>
          <span className="footer__static">Sala 1 — Lumière</span>
          <span className="footer__static">Sala 2 — Meliès</span>
          <span className="footer__static">Sala 3 — Varda</span>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} TicketFilms</span>
        <span className="footer__frame">FRAME 24/24 — FIN DE ROLLO</span>
      </div>
    </footer>
  );
}
