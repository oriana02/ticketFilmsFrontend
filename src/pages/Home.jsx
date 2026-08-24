import Hero from "../components/home/Hero";
import TitleRow from "../components/home/TitleRow";
import SectionHeader from "../components/common/SectionHeader";
import { movies, featuredMovie } from "../data/movies";
import { events } from "../data/events";

export default function Home() {
  const enCartelera = movies.filter((m) => m.status === "cartelera");
  const proximamente = movies.filter((m) => m.status === "proximamente");

  return (
    <>
      <Hero movie={featuredMovie} />

      <section className="container section">
        <SectionHeader
          eyebrow="Programación semanal"
          title="En cartelera"
          note="Estrenos y permanencias seleccionadas por nuestro equipo de programación, no por algoritmo."
          to="/peliculas"
        />
        <TitleRow items={enCartelera} type="pelicula" />
      </section>

      <section className="container section">
        <SectionHeader
          eyebrow="Lo que se viene"
          title="Próximamente"
          note="Reserva tu lugar antes del estreno para las funciones con cupo limitado."
          to="/peliculas?estado=proximamente"
        />
        <TitleRow items={proximamente} type="pelicula" />
      </section>

      <section className="container section section--last">
        <SectionHeader
          eyebrow="Fuera de la sala habitual"
          title="Eventos"
          note="Conciertos, conversatorios y funciones especiales en salas asociadas."
          to="/eventos"
        />
        <TitleRow items={events} type="evento" />
      </section>
    </>
  );
}
