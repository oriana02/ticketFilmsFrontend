import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventoPorId, getFuncionesPorEvento } from "../services/carteleraService";
import { adaptEvento, buildSchedule } from "../services/carteleraAdapter";
import { formatMoney } from "../data/showtimes";
import { useBooking } from "../context/BookingContext";
import DateSelector from "../components/booking/DateSelector";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Showtimes.css";

// RF-05/RF-06: detalle de función (sala, fecha, hora, precio) y filtro por fecha.
export default function Showtimes() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const {
    title,
    setTitleAndReset,
    chooseShowtime,
    seatQuantity,
    setSeatQuantity,
    minSeats,
    maxSeats,
  } = useBooking();
  const [dayIndex, setDayIndex] = useState(0);
  const [state, setState] = useState({ status: "loading", data: null, schedule: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, schedule: [] });
    setDayIndex(0);
    Promise.all([getEventoPorId(id), getFuncionesPorEvento(id)])
      .then(([evento, funciones]) => {
        if (!cancelled) {
          setState({ status: "ok", data: adaptEvento(evento), schedule: buildSchedule(funciones) });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null, schedule: [] });
      });
    return () => { cancelled = true; };
  }, [id]);

  const { data, schedule } = state;

  // Si se llega directo a esta URL (recarga, link compartido) sin pasar por
  // Detail, igual sincronizamos el título en el BookingContext.
  useEffect(() => {
    if (data && (!title || title.data.id !== data.id)) {
      setTitleAndReset(type, data);
    }
  }, [data, type, title, setTitleAndReset]);

  if (state.status === "loading") {
    return (
      <div className="container empty-state">
        <strong>Cargando funciones…</strong>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container empty-state">
        <strong>No encontramos esta función</strong>
        <p>Puede que el título ya no esté disponible.</p>
        <Link to="/" className="btn btn--outline btn--m" style={{ marginTop: 24 }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const day = schedule[dayIndex] ?? schedule[0];

  function handlePick(showtime) {
    chooseShowtime(showtime);
    navigate(`/titulo/${type}/${id}/asientos`);
  }

  return (
    <div className="container showtimes">
      <BookingSteps current={1} />

      <div className="page-head showtimes__head">
        <span className="eyebrow">
          {type === "pelicula" ? "Película" : data.category}
        </span>
        <h1 className="page-head__title">{data.title}</h1>
        <p className="page-head__note">
          Elige cuántos asientos comprarás, el día y la función que prefieras.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          margin: "8px 0 24px",
        }}
      >
        <div>
          <strong>¿Cuántos asientos vas a comprar?</strong>
          <p className="page-head__note" style={{ margin: 0 }}>
            En el mapa podrás elegir exactamente esa cantidad.
          </p>
        </div>

        <div
          role="group"
          aria-label="Cantidad de asientos"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <button
            type="button"
            className="btn btn--outline btn--s"
            onClick={() => setSeatQuantity(seatQuantity - 1)}
            disabled={seatQuantity <= minSeats}
            aria-label="Quitar un asiento"
          >
            −
          </button>
          <strong aria-live="polite" style={{ minWidth: 28, textAlign: "center" }}>
            {seatQuantity}
          </strong>
          <button
            type="button"
            className="btn btn--outline btn--s"
            onClick={() => setSeatQuantity(seatQuantity + 1)}
            disabled={seatQuantity >= maxSeats}
            aria-label="Agregar un asiento"
          >
            +
          </button>
        </div>
      </div>

      {!day ? (
        <div className="empty-state">
          <strong>No hay funciones programadas por ahora</strong>
          <p>Vuelve a revisar más adelante.</p>
        </div>
      ) : (
        <>
          <DateSelector
            days={schedule}
            activeIndex={schedule.indexOf(day)}
            onSelect={setDayIndex}
          />

          <ul className="showtimes__list">
            {day.showtimes.map((s) => (
              <li key={s.id} className="showtime-card">
                <div className="showtime-card__time">{s.time}</div>

                <div className="showtime-card__meta">
                  <span className="showtime-card__venue">{s.venueName}</span>
                  <span className="showtime-card__format">{s.format}</span>
                </div>

                <div className="showtime-card__prices">
                  <span>General {formatMoney(s.priceRegular)}</span>
                  <span>Premium {formatMoney(s.pricePremium)}</span>
                </div>

                <button className="btn btn--primary btn--s" onClick={() => handlePick(s)}>
                  Elegir →
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
