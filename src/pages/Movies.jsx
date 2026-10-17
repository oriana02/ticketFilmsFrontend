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
  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");

  const genres = useMemo(
    () => ["Todos", ...new Set(movies.flatMap((m) => m.genres))],
    [movies],
  );

  const regiones = useMemo(
    () => [...new Set(movies.map((m) => m.region).filter(Boolean))].sort(),
    [movies],
  );
  const ciudades = useMemo(
    () =>
      [
        ...new Set(
          movies
            .filter((m) => m.region === region)
            .map((m) => m.city)
            .filter(Boolean),
        ),
      ].sort(),
    [movies, region],
  );

  const filtered = useMemo(
    () =>
      movies.filter(
        (m) =>
          m.status === status &&
          (genre === "Todos" || m.genres.includes(genre)) &&
          (!region || m.region === region) &&
          (!ciudad || m.city === ciudad),
      ),
    [movies, status, genre, region, ciudad],
  );

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Programación de sala</span>
        <h1 className="page-head__title">Películas</h1>
        <p className="page-head__note">
          Explora los estrenos de la semana o adelanta tu lugar para lo que se
          viene.
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
            key: "region",
            label: "Región",
            value: region,
            onChange: (v) => {
              setRegion(v);
              setCiudad("");
            },
            options: [
              { value: "", label: "Todas" },
              ...regiones.map((r) => ({ value: r, label: r })),
            ],
          },
          {
            key: "ciudad",
            label: "Ciudad",
            value: ciudad,
            onChange: setCiudad,
            options: [
              { value: "", label: "Todas" },
              ...ciudades.map((c) => ({ value: c, label: c })),
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
        <div className="empty-state">
          <strong>Cargando películas…</strong>
        </div>
      ) : error ? (
        <div className="empty-state">
          <strong>{error}</strong>
        </div>
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
