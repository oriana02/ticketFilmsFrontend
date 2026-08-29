import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieById } from "../data/movies";
import { getEventById } from "../data/events";
import { generateSchedule, formatMoney } from "../data/showtimes";
import { useBooking } from "../context/BookingContext";
import DateSelector from "../components/booking/DateSelector";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Showtimes.css";

// RF-05/RF-06: detalle de función (sala, fecha, hora, precio) y filtro por fecha.
export default function Showtimes() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { title, setTitleAndReset, chooseShowtime } = useBooking();
  const [dayIndex, setDayIndex] = useState(0);

  const data = type === "pelicula" ? getMovieById(id) : getEventById(id);

  // Si se llega directo a esta URL (recarga, link compartido) sin pasar por
  // Detail, igual sincronizamos el título en el BookingContext.
  useEffect(() => {
    if (data && (!title || title.data.id !== data.id)) {
      setTitleAndReset(type, data);
    }
  }, [data, type, title, setTitleAndReset]);

  const schedule = useMemo(
    () => (data ? generateSchedule(data.id, 6) : []),
    [data],
  );

  if (!data) {
    return (
      <div className="container empty-state">
        <strong>No encontramos esta función</strong>
        <p>Puede que el título ya no esté disponible.</p>
        <Link
          to="/"
          className="btn btn--outline btn--m"
          style={{ marginTop: 24 }}
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const day = schedule[dayIndex];

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
          Elige el día y la función que prefieras.
        </p>
      </div>

      <DateSelector
        days={schedule}
        activeIndex={dayIndex}
        onSelect={setDayIndex}
      />

      {day.showtimes.length === 0 ? (
        <div className="empty-state">
          <strong>No hay funciones este día</strong>
          <p>Prueba con otra fecha.</p>
        </div>
      ) : (
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

              <button
                className="btn btn--primary btn--s"
                onClick={() => handlePick(s)}
              >
                Elegir →
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
