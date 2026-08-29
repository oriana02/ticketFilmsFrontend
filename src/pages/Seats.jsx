import { useEffect, useMemo } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { generateSeatMap } from "../data/seatmap";
import { formatMoney } from "../data/showtimes";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Seats.css";

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatShowtimeDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
}

// RF-07/RF-08/RF-09: mapa de asientos con estado (disponible/ocupado),
// selección múltiple y reserva temporal en el estado del flujo de compra.
export default function Seats() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { title, showtime, selectedSeats, toggleSeat, totalPrice } = useBooking();

  // Si se llega sin haber elegido función (recarga, URL directa), se
  // devuelve al selector de horarios de este mismo título.
  const missingContext = !title || !showtime || title.data.id !== id;

  const seatMap = useMemo(() => {
    if (missingContext) return { rows: [], venue: null };
    return generateSeatMap(showtime.id, showtime.venueId);
  }, [missingContext, showtime]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (missingContext) {
    return <Navigate to={`/titulo/${type}/${id}/horarios`} replace />;
  }

  const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);

  function handleContinue() {
    navigate(`/titulo/${type}/${id}/resumen`);
  }

  return (
    <div className="container seats-page">
      <BookingSteps current={2} />

      <div className="page-head seats-page__head">
        <span className="eyebrow">{seatMap.venue?.name}</span>
        <h1 className="page-head__title">{title.data.title}</h1>
        <p className="page-head__note">
          {formatShowtimeDate(showtime.date)} — {showtime.time} hrs · {showtime.format}
        </p>
      </div>

      <div className="seats-layout">
        <div className="seats-map">
          <div className="seats-map__screen">
            <span>Pantalla</span>
          </div>

          <div className="seats-map__rows">
            {seatMap.rows.map(({ row, seats, isPremium }) => (
              <div className="seat-row" key={row}>
                <span className="seat-row__label">{row}</span>
                <div className="seat-row__seats">
                  {seats.map((seat) => {
                    const aisle = seatMap.venue.aisleAfter.includes(seat.number);
                    const selected = isSelected(seat.id);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        disabled={seat.status === "occupied"}
                        onClick={() => toggleSeat(seat)}
                        className={[
                          "seat",
                          seat.status === "occupied" && "seat--occupied",
                          selected && "seat--selected",
                          seat.category === "premium" && "seat--premium",
                          aisle && "seat--aisle",
                        ].filter(Boolean).join(" ")}
                        aria-label={`Asiento ${seat.id}${seat.status === "occupied" ? ", ocupado" : ""}`}
                        title={`${seat.id}${isPremium ? " · Premium" : ""}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="seats-legend">
            <span><i className="seat-swatch seat-swatch--available" /> Disponible</span>
            <span><i className="seat-swatch seat-swatch--premium" /> Premium</span>
            <span><i className="seat-swatch seat-swatch--selected" /> Seleccionado</span>
            <span><i className="seat-swatch seat-swatch--occupied" /> Ocupado</span>
          </div>
        </div>

        <aside className="seats-summary">
          <h2 className="seats-summary__title">Tu selección</h2>

          {selectedSeats.length === 0 ? (
            <p className="seats-summary__empty">
              Elige uno o más asientos disponibles en el mapa.
            </p>
          ) : (
            <ul className="seats-summary__list">
              {selectedSeats
                .slice()
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((seat) => (
                  <li key={seat.id}>
                    <span>
                      {seat.id}
                      {seat.category === "premium" && <em> · Premium</em>}
                    </span>
                    <span>
                      {formatMoney(
                        seat.category === "premium" ? showtime.pricePremium : showtime.priceRegular
                      )}
                    </span>
                  </li>
                ))}
            </ul>
          )}

          <div className="seats-summary__total">
            <span>Total</span>
            <strong>{formatMoney(totalPrice)}</strong>
          </div>

          <button
            className="btn btn--primary btn--m seats-summary__cta"
            disabled={selectedSeats.length === 0}
            onClick={handleContinue}
          >
            Continuar →
          </button>
        </aside>
      </div>
    </div>
  );
}
