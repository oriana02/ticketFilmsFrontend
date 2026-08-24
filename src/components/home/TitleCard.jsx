import { Link } from "react-router-dom";
import "./TitleCard.css";

// type: 'pelicula' | 'evento'
export default function TitleCard({ type, title, size = "m" }) {
  const isMovie = type === "pelicula";
  const metaLine = isMovie
    ? `${title.director} — ${title.duration} min`
    : `${title.venue} — ${title.city}`;
  const tag = isMovie ? title.genres[0] : title.category;

  return (
    <Link to={`/titulo/${type}/${title.id}`} className={`title-card title-card--${size}`}>
      <div className="title-card__frame">
        <img src={title.poster} alt="" loading="lazy" />
        <span className="title-card__tag">{tag}</span>
        <span className="title-card__cta">Ver detalle →</span>
      </div>
      <h3 className="title-card__title">{title.title}</h3>
      <p className="title-card__meta">{metaLine}</p>
    </Link>
  );
}
