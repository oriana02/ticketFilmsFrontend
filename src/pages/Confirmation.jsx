import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { getBoletoPorCodigo } from "../services/boletosService";
import TicketSummary from "../components/booking/TicketSummary";
import "../styles/Checkout.css";

export default function Confirmation() {
  const { code } = useParams();
  const { resetBooking } = useBooking();
  const [state, setState] = useState({ status: "loading", boleto: null });

  // La compra terminó: se limpia el estado del flujo.
  useEffect(() => {
    resetBooking();
  }, [resetBooking]);

  useEffect(() => {
    let cancelled = false;
    getBoletoPorCodigo(code)
      .then((boleto) => { if (!cancelled) setState({ status: "ok", boleto }); })
      .catch((err) => {
        if (!cancelled) setState({ status: err.response?.status === 404 ? "notfound" : "error", boleto: null });
      });
    return () => { cancelled = true; };
  }, [code]);

  if (state.status === "loading") {
    return <div className="container empty-state"><strong>Cargando tu boleto…</strong></div>;
  }

  if (state.status !== "ok") {
    return (
      <div className="container empty-state">
        <strong>
          {state.status === "notfound" ? "No encontramos este boleto" : "No pudimos cargar tu boleto"}
        </strong>
        <Link to="/cuenta" className="btn btn--outline btn--m" style={{ marginTop: 24 }}>
          Ver mis boletos
        </Link>
      </div>
    );
  }

  return (
    <div className="container checkout">
      <div className="page-head">
        <span className="eyebrow">Compra confirmada</span>
        <h1 className="page-head__title">¡Listo! Tus asientos están reservados</h1>
        <p className="page-head__note">Guarda tu código: lo necesitarás para ingresar a la función.</p>
      </div>

      <TicketSummary boleto={state.boleto} />

      <div className="checkout__actions">
        <Link to="/cuenta" className="btn btn--primary btn--m">Ver mis boletos</Link>
        <Link to="/" className="btn btn--outline btn--m">Volver al inicio</Link>
      </div>
    </div>
  );
}
