import { Link } from "react-router-dom";
import "../../styles/TitleCard.css";

// Toma el primer género si existe, si no cae a category (tipoEvento del backend).
// Si no hay ninguno, no se muestra tag.
function buildTag(title) {
  if (title.genres?.[0]) return title.genres[0];
  if (title.category) return title.category;
  return null;
}

// Arma la línea de meta solo con los campos que existan, sin dejar
// "undefined" o separadores huérfanos cuando el backend no los entrega.
function buildMeta(type, title) {
  const parts = [];
  if (type === "pelicula") {
    if (title.director) parts.push(title.director);
    if (title.duration) parts.push(`${title.duration} min`);
  } else {
    if (title.venue) parts.push(title.venue);
    if (title.city) parts.push(title.city);
  }
  return parts.length ? parts.join(" — ") : null;
}

// type: 'pelicula' | 'evento'
export default function TitleCard({ type, title, size = "m" }) {
  const tag = buildTag(title);
  const metaLine = buildMeta(type, title);

  return (
    <Link to={`/titulo/${type}/${title.id}`} className={`title-card title-card--${size}`}>
      <div className="title-card__frame">
        <img src={title.poster} alt="" loading="lazy" />
        {tag && <span className="title-card__tag">{tag}</span>}
        <span className="title-card__cta">Ver detalle →</span>
      </div>
      <h3 className="title-card__title">{title.title}</h3>
      {metaLine && <p className="title-card__meta">{metaLine}</p>}
    </Link>
  );
}
