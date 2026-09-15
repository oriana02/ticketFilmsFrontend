import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getMovieById } from "../data/movies";
import { getEventById } from "../data/events";
import { useBooking } from "../context/BookingContext";
import Badge from "../components/common/Badge";
import "../styles/Detail.css";

export default function Detail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { setTitleAndReset } = useBooking();

  const data = type === "pelicula" ? getMovieById(id) : getEventById(id);

  useEffect(() => {
    if (data) setTitleAndReset(type, data);
  }, [data, type, setTitleAndReset]);

  if (!data) {
    return (
      <div className="container empty-state">
        <strong>No encontramos este título</strong>
        <p>Puede que la función ya no esté disponible.</p>
        <Link to="/" className="btn btn--outline btn--m" style={{ marginTop: 24 }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const isMovie = type === "pelicula";

  // Specs se arman condicionalmente: si el backend no trae el campo
  // (genres, cast, country, format, city...), simplemente no se muestra
  // en vez de renderizar "undefined" o un badge vacío.
  const genres = data.genres?.length ? data.genres : [];
  const cast = data.cast?.length ? data.cast.join(", ") : null;
  const origen = [data.country, data.year].filter(Boolean).join(" · ") || null;
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
          <span className="eyebrow">{isMovie ? "Película" : data.category}</span>
          <h1 className="detail__title">{data.title}</h1>

          <div className="detail__tags">
            {isMovie ? (
              <>
                {genres.map((g) => <Badge key={g}>{g}</Badge>)}
                {data.format && <Badge tone="navy">{data.format}</Badge>}
                {data.rating && <Badge tone="outline">{data.rating} años</Badge>}
              </>
            ) : (
              <>
                {data.category && <Badge tone="navy">{data.category}</Badge>}
                {data.city && <Badge tone="outline">{data.city}</Badge>}
              </>
            )}
          </div>

          <p className="detail__synopsis">{data.synopsis || data.description}</p>

          <dl className="detail__specs">
            {isMovie ? (
              <>
                <Spec label="Dirección" value={data.director} />
                <Spec label="Reparto" value={cast} />
                <Spec label="Duración" value={duracion} />
                <Spec label="Idioma" value={data.language} />
                <Spec label="Origen" value={origen} />
              </>
            ) : (
              <>
                <Spec label="Sala / lugar" value={data.venue} />
                <Spec label="Ciudad" value={data.city} />
                <Spec label="Duración" value={duracion} />
                <Spec label="Próxima fecha" value={data.dateLabel} />
              </>
            )}
          </dl>

          {data.status === "proximamente" ? (
            <div className="detail__notice">
              Estreno el {new Date(data.releaseDate).toLocaleDateString("es-CL", { day: "numeric", month: "long" })}.
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

// No renderiza el <dt>/<dd> si no hay valor — evita specs vacíos o "undefined".
function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail__spec">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
