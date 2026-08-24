import { Link } from "react-router-dom";
import "./Hero.css";

export default function Hero({ movie }) {
  return (
    <section className="hero">
      <div className="hero__media">
        <img src={movie.backdrop} alt="" />
        <div className="hero__scrim" />
      </div>

      <div className="container hero__body">
        <span className="eyebrow hero__eyebrow">En cartelera ahora</span>
        <h1 className="hero__title">{movie.title}</h1>

        <dl className="hero__specs">
          <div>
            <dt>Dirección</dt>
            <dd>{movie.director}</dd>
          </div>
          <div>
            <dt>Duración</dt>
            <dd>{movie.duration} min</dd>
          </div>
          <div>
            <dt>Género</dt>
            <dd>{movie.genres.join(" / ")}</dd>
          </div>
          <div>
            <dt>Origen</dt>
            <dd>{movie.country}</dd>
          </div>
        </dl>

        <p className="hero__synopsis">{movie.synopsis}</p>

        <div className="hero__actions">
          <Link to={`/titulo/pelicula/${movie.id}`} className="btn btn--primary btn--m">
            Ver función
          </Link>
          <Link to={`/titulo/pelicula/${movie.id}`} className="btn btn--outline btn--m">
            Ficha técnica
          </Link>
        </div>
      </div>
    </section>
  );
}
