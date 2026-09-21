import { useEffect, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { confirmarCompra } from "../services/boletosService";
import { liberarReserva } from "../services/asientosService";
import { formatMoney } from "../data/showtimes";
import { errorMessage } from "../utils/apiError";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Checkout.css";

function formatClock(ms) {
  const total = Math.ceil(ms / 1000);
  const m = String(Math.floor(total / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// Resumen de compra: los asientos ya están reservados 5 minutos en ms-asientos.
export default function Checkout() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { title, showtime, selectedSeats, totalPrice, reservation, resetBooking } = useBooking();
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [serverExpired, setServerExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const missing =
    !title || !showtime || title.data.id !== id || selectedSeats.length === 0 || !reservation;
  if (missing) {
    return <Navigate to={`/titulo/${type}/${id}/horarios`} replace />;
  }

  const remaining = Math.max(0, reservation.expiresAt - now);
  const expired = remaining === 0 || serverExpired;
  const payload = {
    funcionId: Number(showtime.id),
    asientosSolicitados: selectedSeats.map((s) => s.asientoId),
  };

  async function handleConfirm() {
    if (submitting || expired) return;
    setSubmitting(true);
    setError("");
    try {
      const boleto = await confirmarCompra({ title, showtime, selectedSeats, totalPrice });
      navigate(`/confirmacion/${boleto.codigoBoleto}`, { replace: true });
    } catch (err) {
      if (err.response?.status === 410) {
        setServerExpired(true);
      } else {
        setError(errorMessage(err, "No pudimos completar la compra. Intenta de nuevo."));
      }
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    try {
      await liberarReserva(payload);
    } catch {
      // Si no se pudo liberar, la reserva vence sola a los 5 minutos.
    }
    navigate("/");
    resetBooking();
  }

  return (
    <div className="container checkout">
      <BookingSteps current={3} />

      <div className="page-head">
        <span className="eyebrow">Resumen de compra</span>
        <h1 className="page-head__title">{title.data.title}</h1>
        <p className="page-head__note">
          {showtime.date} — {showtime.time} hrs · {showtime.venueName} · {showtime.format}
        </p>
      </div>

      <div className="checkout__card">
        <div className="checkout__row">
          <span>Tiempo para completar la compra</span>
          <span className={`checkout__timer ${remaining < 60000 ? "checkout__timer--warn" : ""}`}>
            {expired ? "00:00" : formatClock(remaining)}
          </span>
        </div>
      </div>

      <div className="checkout__card">
        {selectedSeats
          .slice()
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
          .map((seat) => (
            <div className="checkout__row" key={seat.id}>
              <span>
                Asiento {seat.id}
                {seat.category === "premium" && " · Premium"}
              </span>
              <span>
                {formatMoney(seat.category === "premium" ? showtime.pricePremium : showtime.priceRegular)}
              </span>
            </div>
          ))}
        <div className="checkout__row checkout__row--total">
          <strong>Total</strong>
          <strong>{formatMoney(totalPrice)}</strong>
        </div>
      </div>

      {expired && (
        <div className="checkout__alert" role="alert">
          Tu reserva expiró. Vuelve a elegir tus asientos para continuar.
        </div>
      )}
      {error && <div className="checkout__alert" role="alert">{error}</div>}

      <div className="checkout__actions">
        {expired ? (
          <button
            className="btn btn--primary btn--m"
            onClick={() => navigate(`/titulo/${type}/${id}/asientos`)}
          >
            Elegir asientos de nuevo
          </button>
        ) : (
          <>
            <button className="btn btn--primary btn--m" onClick={handleConfirm} disabled={submitting}>
              {submitting ? "Procesando…" : "Confirmar compra"}
            </button>
            <button
              className="btn btn--outline btn--m"
              onClick={() => navigate(`/titulo/${type}/${id}/asientos`)}
              disabled={submitting}
            >
              Volver a asientos
            </button>
            <button className="btn btn--outline btn--m" onClick={handleCancel} disabled={submitting}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
