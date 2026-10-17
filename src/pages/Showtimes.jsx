import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getEventoPorId,
  getFuncionesPorEvento,
} from "../services/carteleraService";
import { adaptEvento, buildSchedule } from "../services/carteleraAdapter";
import { formatMoney } from "../utils/format";
import { useBooking } from "../context/BookingContext";
import useSalas from "../hooks/useSalas";
import DateSelector from "../components/booking/DateSelector";
import BookingSteps from "../components/booking/BookingSteps";
import "../styles/Showtimes.css";

// Control + / − reutilizable para General y Premium.
function QtyStepper({ label, value, onChange, canDecrease, canIncrease }) {
  return (
    <div className="seat-qty__group">
      <span className="seat-qty__label">{label}</span>
      <div className="seat-qty__control" role="group" aria-label={label}>
        <button
          type="button"
          className="seat-qty__btn"
          onClick={() => onChange(value - 1)}
          disabled={!canDecrease}
          aria-label={`Quitar un asiento ${label}`}
        >
          −
        </button>
        <strong className="seat-qty__value" aria-live="polite">
          {value}
        </strong>
        <button
          type="button"
          className="seat-qty__btn"
          onClick={() => onChange(value + 1)}
          disabled={!canIncrease}
          aria-label={`Agregar un asiento ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// RF-05/RF-06: detalle de función (sala, fecha, hora, precio) y filtro por fecha.
export default function Showtimes() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const {
    title,
    setTitleAndReset,
    chooseShowtime,
    generalQty,
    premiumQty,
    seatQuantity,
    setGeneralQty,
    setPremiumQty,
    minSeats,
    maxSeats,
  } = useBooking();
  const [dayIndex, setDayIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [state, setState] = useState({
    status: "loading",
    data: null,
    schedule: [],
  });
  const salas = useSalas();

  // La función guarda el código de la sala (ej. SALA-02); acá se muestra su nombre.
  const salaNombre = (codigo) =>
    salas.find((s) => s.sala_codigo === codigo)?.nombre ?? codigo;

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, schedule: [] });
    setDayIndex(0);
    setSelectedId(null);
    Promise.all([getEventoPorId(id), getFuncionesPorEvento(id)])
      .then(([evento, funciones]) => {
        if (!cancelled) {
          setState({
            status: "ok",
            data: adaptEvento(evento),
            schedule: buildSchedule(funciones),
          });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null, schedule: [] });
      });
    return () => {
      cancelled = true;
    };
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

  const day = schedule[dayIndex] ?? schedule[0];

  const selectedShowtime =
    schedule.flatMap((d) => d.showtimes).find((s) => s.id === selectedId) ??
    null;
  // Precios que muestra la tarjeta: los de la función elegida o, si no hay, los del día.
  const priceSource = selectedShowtime ?? day?.showtimes[0] ?? null;

  function handleContinue() {
    if (!selectedShowtime) return;
    chooseShowtime({
      ...selectedShowtime,
      venueName: salaNombre(selectedShowtime.salaCodigo),
    });
    navigate(`/titulo/${type}/${id}/asientos`);
  }

  return (
    <div className="container showtimes">
      <BookingSteps current={1} />

      <div className="showtimes__layout">
        <div className="showtimes__main">
          <div className="page-head showtimes__head">
            <span className="eyebrow">
              {type === "pelicula" ? "Película" : data.category}
            </span>
            <h1 className="page-head__title">{data.title}</h1>
            <p className="page-head__note">
              Elige cuántos asientos comprarás, el día y la función que
              prefieras.
            </p>
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
                {day.showtimes.map((s) => {
                  const isSelected = s.id === selectedId;
                  return (
                    <li
                      key={s.id}
                      className={`showtime-card ${isSelected ? "is-selected" : ""}`}
                    >
                      <div className="showtime-card__time">{s.time}</div>

                      <div className="showtime-card__meta">
                        <span className="showtime-card__venue">
                          {salaNombre(s.venueId)}
                        </span>
                        <span className="showtime-card__format">
                          {s.format}
                        </span>
                      </div>

                      <div className="showtime-card__prices">
                        <span>General {formatMoney(s.priceRegular)}</span>
                        <span>Premium {formatMoney(s.pricePremium)}</span>
                      </div>

                      <button
                        className="btn btn--primary btn--s"
                        onClick={() => setSelectedId(s.id)}
                        aria-pressed={isSelected}
                      >
                        {isSelected ? "Elegida ✓" : "Elegir →"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        <aside className="seat-qty" aria-labelledby="seat-qty-title">
          <h2 id="seat-qty-title" className="seat-qty__title">
            ¿Cuántos asientos?
          </h2>

          <QtyStepper
            label={`General${priceSource ? ` (${formatMoney(priceSource.priceRegular)})` : ""}`}
            value={generalQty}
            onChange={setGeneralQty}
            canDecrease={generalQty > (premiumQty === 0 ? minSeats : 0)}
            canIncrease={seatQuantity < maxSeats}
          />

          <QtyStepper
            label={`Premium${priceSource ? ` (${formatMoney(priceSource.pricePremium)})` : ""}`}
            value={premiumQty}
            onChange={setPremiumQty}
            canDecrease={premiumQty > (generalQty === 0 ? minSeats : 0)}
            canIncrease={seatQuantity < maxSeats}
          />

          <p className="seat-qty__note">
            Máximo {maxSeats} asientos por compra.
          </p>

          <button
            className="btn btn--primary btn--m seat-qty__cta"
            onClick={handleContinue}
            disabled={!selectedShowtime}
          >
            Continuar
          </button>
          {!selectedShowtime && (
            <p className="seat-qty__hint">Elige una función para continuar</p>
          )}
        </aside>
      </div>
    </div>
  );
}
