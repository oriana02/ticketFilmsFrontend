import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistorial } from "../services/boletosService";
import TicketSummary from "../components/booking/TicketSummary";
import "../styles/Checkout.css";

export default function MyTickets() {
  const [state, setState] = useState({ status: "loading", boletos: [] });

  useEffect(() => {
    let cancelled = false;
    getHistorial()
      .then((boletos) => { if (!cancelled) setState({ status: "ok", boletos }); })
      .catch(() => { if (!cancelled) setState({ status: "error", boletos: [] }); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container tickets-page">
      <div className="page-head">
        <span className="eyebrow">Mi cuenta</span>
        <h1 className="page-head__title">Mis boletos</h1>
      </div>

      {state.status === "loading" && <div className="empty-state"><strong>Cargando…</strong></div>}
      {state.status === "error" && (
        <div className="empty-state"><strong>No pudimos cargar tus boletos</strong></div>
      )}
      {state.status === "ok" && state.boletos.length === 0 && (
        <div className="empty-state">
          <strong>Aún no tienes boletos</strong>
          <Link to="/peliculas" className="btn btn--outline btn--m" style={{ marginTop: 24 }}>
            Ver cartelera
          </Link>
        </div>
      )}
      {state.status === "ok" &&
        state.boletos.map((b) => <TicketSummary key={b.codigoBoleto} boleto={b} />)}
    </div>
  );
}
