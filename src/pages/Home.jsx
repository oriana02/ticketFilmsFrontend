import Hero from "../components/home/Hero";
import TitleRow from "../components/home/TitleRow";
import SectionHeader from "../components/common/SectionHeader";
import useTitulos from "../hooks/useTitulos";

export default function Home() {
  const { movies, events, loading, error } = useTitulos();

  if (loading) {
    return (
      <div className="container empty-state">
        <strong>Cargando cartelera…</strong>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container empty-state">
        <strong>{error}</strong>
        <p>Revisa tu conexión e inténtalo de nuevo en un momento.</p>
      </div>
    );
  }

  const enCartelera = movies.filter((m) => m.status === "cartelera");
  const proximamente = movies.filter((m) => m.status === "proximamente");

  return (
    <>
      {enCartelera[0] && <Hero movie={enCartelera[0]} />}

      {enCartelera.length > 0 && (
        <section className="container section">
          <SectionHeader
            eyebrow="Programación semanal"
            title="En cartelera"
            note="Explora los estrenos de la semana o adelanta tu lugar para lo que se viene."
            to="/peliculas"
          />
          <TitleRow items={enCartelera} type="pelicula" />
        </section>
      )}

      {proximamente.length > 0 && (
        <section className="container section">
          <SectionHeader
            eyebrow="Lo que se viene"
            title="Próximamente"
            note="Reserva tu lugar antes del estreno para las funciones con cupo limitado."
            to="/peliculas?estado=proximamente"
          />
          <TitleRow items={proximamente} type="pelicula" />
        </section>
      )}

      {events.length > 0 && (
        <section className="container section section--last">
          <SectionHeader
            eyebrow="Tu próximo evento comienza aquí"
            title="Eventos"
            note="Descubre conciertos, festivales y eventos especiales para disfrutar en vivo."
            to="/eventos"
          />
          <TitleRow items={events} type="evento" />
        </section>
      )}
    </>
  );
}
