import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEventoPorId } from "../services/carteleraService";
import { adaptEvento } from "../services/carteleraAdapter";
import { useBooking } from "../context/BookingContext";
import Badge from "../components/common/Badge";
import "../styles/Detail.css";

function ratingLabel(rating) {
  if (!rating) return null;
  return rating.toUpperCase() === "TE" ? "Todo espectador" : `${rating} años`;
}

export default function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { setTitleAndReset } = useBooking();
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null });
    getEventoPorId(id)
      .then((e) => {
        if (!cancelled) setState({ status: "ok", data: adaptEvento(e) });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const data = state.data;

  useEffect(() => {
    if (data) setTitleAndReset(type, data);
  }, [data, type, setTitleAndReset]);

  if (state.status === "loading") {
    return (
      <div className="container empty-state">
        <strong>Cargando…</strong>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container empty-state">
        <strong>No encontramos este título</strong>
        <p>Puede que la función ya no esté disponible.</p>
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

  const isMovie = data.type === "pelicula";

  // Los datos se muestran solo si el backend los trae: sin "undefined" ni filas vacías.
  const genres = data.genres ?? [];
  const cast = data.cast?.length ? data.cast.join(", ") : null;
  const genero = genres.length ? genres.join(", ") : null;
  const duracion = data.duration ? `${data.duration} min` : null;

  return (
    <article className="detail">
      <div className="detail__hero">
        <img src={data.backdrop} alt="" />
        <div className="detail__hero-scrim" />
      </div>

      <div className="container detail__grid">
        <div className="detail__poster">
          <img src={data.poster} alt={`Afiche de ${data.title}`} />
        </div>

        <div className="detail__body">
          <span className="eyebrow">
            {isMovie ? "Película" : data.category}
          </span>
          <h1 className="detail__title">{data.title}</h1>

          <div className="detail__tags">
            {isMovie ? (
              <>
                {genres.map((g) => (
                  <Badge key={g}>{g}</Badge>
                ))}
                {data.format && <Badge tone="navy">{data.format}</Badge>}
                {ratingLabel(data.rating) && (
                  <Badge tone="outline">{ratingLabel(data.rating)}</Badge>
                )}
              </>
            ) : (
              <>
                {data.category && <Badge tone="navy">{data.category}</Badge>}
                {data.city && <Badge tone="outline">{data.city}</Badge>}
              </>
            )}
          </div>

          <p className="detail__synopsis">
            {data.synopsis || data.description}
          </p>

          <dl className="detail__specs">
            {isMovie ? (
              <>
                <Spec label="Ciudad" value={data.city} />
                <Spec label="Género" value={genero} />
                <Spec label="Dirección" value={data.director} />
                <Spec label="Reparto" value={cast} />
                <Spec label="Duración" value={duracion} />
                <Spec label="Idioma" value={data.language} />
                <Spec label="Origen" value={data.country} />
              </>
            ) : (
              <>
                <Spec label="Sala / lugar" value={data.venue} />
                <Spec label="Ciudad" value={data.city} />
                <Spec label="Duración" value={duracion} />
                <Spec label="Próxima fecha" value={data.dateLabel} />
                <Spec label="Categoría" value={data.category} />
              </>
            )}
          </dl>

          {data.status === "proximamente" ? (
            <div className="detail__notice">
              Las funciones se habilitarán próximamente.
            </div>
          ) : (
            <button
              className="btn btn--primary btn--m"
              onClick={() => navigate(`/titulo/${type}/${id}/horarios`)}
            >
              Elegir función →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// No renderiza el <dt>/<dd> si no hay valor.
function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail__spec">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
