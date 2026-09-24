import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TitleCard from "../components/home/TitleCard";
import FilterBar from "../components/common/FilterBar";
import useTitulos from "../hooks/useTitulos";

export default function Movies() {
  const { movies, loading, error } = useTitulos();
  const [params, setParams] = useSearchParams();
  const status = params.get("estado") || "cartelera";
  const [genre, setGenre] = useState("Todos");

  const genres = useMemo(
    () => ["Todos", ...new Set(movies.flatMap((m) => m.genres))],
    [movies],
  );

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesStatus = m.status === status;
      const matchesGenre = genre === "Todos" || m.genres.includes(genre);
      return matchesStatus && matchesGenre;
    });
  }, [movies, status, genre]);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Programación de sala</span>
        <h1 className="page-head__title">Películas</h1>
        <p className="page-head__note">
          Explora los estrenos de la semana o adelanta tu lugar para lo que se viene.
        </p>
      </div>

      <FilterBar
        groups={[
          {
            key: "estado",
            label: "Estado",
            value: status,
            onChange: (v) => setParams({ estado: v }),
            options: [
              { value: "cartelera", label: "En cartelera" },
              { value: "proximamente", label: "Próximamente" },
            ],
          },
          {
            key: "genero",
            label: "Género",
            value: genre,
            onChange: setGenre,
            options: genres.map((g) => ({ value: g, label: g })),
          },
        ]}
      />

      {loading ? (
        <div className="empty-state"><strong>Cargando películas…</strong></div>
      ) : error ? (
        <div className="empty-state"><strong>{error}</strong></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>No hay funciones para este filtro</strong>
          <p>Prueba con otro género o revisa la otra pestaña de estado.</p>
        </div>
      ) : (
        <div className="poster-grid">
          {filtered.map((m) => (
            <TitleCard key={m.id} type="pelicula" title={m} />
          ))}
        </div>
      )}
    </div>
  );
}
