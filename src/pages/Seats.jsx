import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useBooking } from "../context/BookingContext";
import { loadSeatMap, seatMapErrorMessage } from "../services/mapaAsientos";
import { reservarAsientos } from "../services/asientosService";
import { formatMoney } from "../data/showtimes";
import { errorMessage } from "../utils/apiError";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Seats.css";

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function formatShowtimeDate(iso) {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
}

function seatsLabel(n) {
  return `${n} ${n === 1 ? "asiento" : "asientos"}`;
}

// RF-07/RF-08/RF-09: mapa real de ms-asientos, selección de exactamente la
// cantidad pedida (General y Premium) y reserva temporal (5 minutos) al continuar.
export default function Seats() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const userId = auth.user?.profile?.sub;
  const {
    title,
    showtime,
    selectedSeats,
    generalQty,
    premiumQty,
    seatQuantity,
    toggleSeat,
    clearSeats,
    totalPrice,
    startReservation,
  } = useBooking();

  const missingContext = !title || !showtime || title.data.id !== id;

  const [seatMap, setSeatMap] = useState({ rows: [], venue: null });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");

  useEffect(() => {
    if (missingContext) return;
    let cancelled = false;
    setStatus("loading");
    loadSeatMap(showtime, userId)
      .then((map) => {
        if (!cancelled) {
          setSeatMap(map);
          setStatus("ready");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(seatMapErrorMessage(err));
          setStatus("error");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [missingContext, showtime, userId, reloadKey]);

  const { availableCount, availableGeneral, availablePremium } = useMemo(() => {
    let general = 0;
    let premium = 0;
    for (const row of seatMap.rows) {
      for (const s of row.seats) {
        if (s.status !== "available") continue;
        if (s.category === "premium") premium++;
        else general++;
      }
    }
    return {
      availableCount: general + premium,
      availableGeneral: general,
      availablePremium: premium,
    };
  }, [seatMap]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (missingContext) {
    return <Navigate to={`/titulo/${type}/${id}/horarios`} replace />;
  }

  const isSelected = (seatId) => selectedSeats.some((s) => s.id === seatId);

  const selectedPremium = selectedSeats.filter(
    (s) => s.category === "premium",
  ).length;
  const selectedGeneral = selectedSeats.length - selectedPremium;
  const missingGeneral = Math.max(0, generalQty - selectedGeneral);
  const missingPremium = Math.max(0, premiumQty - selectedPremium);
  const remaining = missingGeneral + missingPremium;
  const complete = remaining === 0;

  const missingParts = [];
  if (missingGeneral > 0) missingParts.push(`${missingGeneral} General`);
  if (missingPremium > 0) missingParts.push(`${missingPremium} Premium`);

  // Si ya no quedan suficientes asientos libres de alguna categoría, no se puede completar.
  const notEnoughSeats =
    status === "ready" &&
    (availableGeneral < generalQty || availablePremium < premiumQty);

  async function handleContinue() {
    if (!complete || reserving || notEnoughSeats) return;
    setReserving(true);
    setReserveError("");
    try {
      await reservarAsientos({
        funcionId: Number(showtime.id),
        asientosSolicitados: selectedSeats.map((s) => s.asientoId),
      });
      startReservation();
      navigate(`/titulo/${type}/${id}/resumen`);
    } catch (err) {
      if (err.response?.status === 400) {
        setReserveError(
          "Alguno de los asientos ya no está disponible. Actualizamos el mapa, elige de nuevo.",
        );
        clearSeats();
        setReloadKey((k) => k + 1);
      } else {
        setReserveError(
          errorMessage(
            err,
            "No pudimos reservar los asientos. Intenta de nuevo.",
          ),
        );
      }
    } finally {
      setReserving(false);
    }
  }

  return (
    <div className="container seats-page">
      <BookingSteps current={2} />

      <div className="page-head seats-page__head">
        <span className="eyebrow">{seatMap.venue?.name}</span>
        <h1 className="page-head__title">{title.data.title}</h1>
        <p className="page-head__note">
          {formatShowtimeDate(showtime.date)} — {showtime.time} hrs ·{" "}
          {showtime.format}
        </p>
      </div>

      {status === "loading" && (
        <div className="empty-state">
          <strong>Cargando mapa de asientos…</strong>
        </div>
      )}

      {status === "error" && (
        <div className="empty-state">
          <strong>{loadError}</strong>
          <button
            className="btn btn--outline btn--m"
            style={{ marginTop: 24 }}
            onClick={() => setReloadKey((k) => k + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {status === "ready" && availableCount === 0 && (
        <div className="empty-state">
          <strong>Esta función está agotada</strong>
          <p>Prueba con otro horario.</p>
          <button
            className="btn btn--outline btn--m"
            style={{ marginTop: 24 }}
            onClick={() => navigate(`/titulo/${type}/${id}/horarios`)}
          >
            Ver otros horarios
          </button>
        </div>
      )}

      {status === "ready" && availableCount > 0 && (
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
                      const aisle = seatMap.venue.aisleAfter.includes(
                        seat.number,
                      );
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
                          ]
                            .filter(Boolean)
                            .join(" ")}
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
              <span>
                <i className="seat-swatch seat-swatch--available" /> Disponible
              </span>
              <span>
                <i className="seat-swatch seat-swatch--premium" /> Premium
              </span>
              <span>
                <i className="seat-swatch seat-swatch--selected" /> Seleccionado
              </span>
              <span>
                <i className="seat-swatch seat-swatch--occupied" /> Ocupado
              </span>
            </div>
          </div>

          <aside className="seats-summary">
            <h2 className="seats-summary__title">Tu selección</h2>
            <p
              className="seats-summary__empty"
              role="status"
              aria-live="polite"
            >
              Seleccionaste {selectedSeats.length} de {seatsLabel(seatQuantity)}{" "}
              (General {selectedGeneral}/{generalQty}
              {premiumQty > 0 && (
                <>
                  , Premium {selectedPremium}/{premiumQty}
                </>
              )}
              ).{" "}
              {complete
                ? "Para cambiar uno, quita primero un asiento."
                : `Te falta${remaining === 1 ? "" : "n"} ${missingParts.join(" y ")}.`}
            </p>

            {notEnoughSeats && (
              <p
                role="alert"
                style={{ color: "#dc2626", marginTop: 12, fontSize: 14 }}
              >
                No quedan suficientes asientos libres para tu selección.{" "}
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ padding: 0, textDecoration: "underline" }}
                  onClick={() => navigate(`/titulo/${type}/${id}/horarios`)}
                >
                  Cambiar cantidad
                </button>
              </p>
            )}

            {selectedSeats.length > 0 && (
              <ul className="seats-summary__list">
                {selectedSeats
                  .slice()
                  .sort((a, b) =>
                    a.id.localeCompare(b.id, undefined, { numeric: true }),
                  )
                  .map((seat) => (
                    <li key={seat.id}>
                      <span>
                        {seat.id}
                        {seat.category === "premium" && <em> · Premium</em>}
                      </span>
                      <span>
                        {formatMoney(
                          seat.category === "premium"
                            ? showtime.pricePremium
                            : showtime.priceRegular,
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

            {reserveError && (
              <p role="alert" style={{ color: "#dc2626" }}>
                {reserveError}
              </p>
            )}

            <button
              className="btn btn--primary btn--m seats-summary__cta"
              disabled={!complete || reserving || notEnoughSeats}
              onClick={handleContinue}
            >
              {reserving ? "Reservando…" : "Continuar →"}
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
