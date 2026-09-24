import { useMemo, useState } from "react";
import TitleCard from "../components/home/TitleCard";
import FilterBar from "../components/common/FilterBar";
import useTitulos from "../hooks/useTitulos";

export default function Events() {
  const { events, loading, error } = useTitulos();
  const [category, setCategory] = useState("Todos");
  const [city, setCity] = useState("Todas");

  const categories = useMemo(
    () => ["Todos", ...new Set(events.map((e) => e.category))],
    [events],
  );
  const cities = useMemo(
    () => ["Todas", ...new Set(events.map((e) => e.city).filter(Boolean))],
    [events],
  );

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = category === "Todos" || e.category === category;
      const matchesCity = city === "Todas" || e.city === city;
      return matchesCategory && matchesCity;
    });
  }, [events, category, city]);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Tu próximo evento comienza aquí</span>
        <h1 className="page-head__title">Eventos</h1>
        <p className="page-head__note">
          Descubre conciertos, festivales y eventos especiales para disfrutar en
          vivo.
        </p>
      </div>

      <FilterBar
        groups={[
          {
            key: "categoria",
            label: "Categoría",
            value: category,
            onChange: setCategory,
            options: categories.map((c) => ({ value: c, label: c })),
          },
          {
            key: "ciudad",
            label: "Ciudad",
            value: city,
            onChange: setCity,
            options: cities.map((c) => ({ value: c, label: c })),
          },
        ]}
      />

      {loading ? (
        <div className="empty-state">
          <strong>Cargando eventos…</strong>
        </div>
      ) : error ? (
        <div className="empty-state">
          <strong>{error}</strong>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>No hay eventos para este filtro</strong>
          <p>Prueba con otra categoría o ciudad.</p>
        </div>
      ) : (
        <div className="poster-grid">
          {filtered.map((e) => (
            <TitleCard key={e.id} type="evento" title={e} />
          ))}
        </div>
      )}
    </div>
  );
}
