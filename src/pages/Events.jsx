import { useMemo, useState } from "react";
import TitleCard from "../components/home/TitleCard";
import FilterBar from "../components/common/FilterBar";
import { events } from "../data/events";

const CATEGORIES = ["Todos", ...new Set(events.map((e) => e.category))];
const CITIES = ["Todas", ...new Set(events.map((e) => e.city))];

export default function Events() {
  const [category, setCategory] = useState("Todos");
  const [city, setCity] = useState("Todas");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesCategory = category === "Todos" || e.category === category;
      const matchesCity = city === "Todas" || e.city === city;
      return matchesCategory && matchesCity;
    });
  }, [category, city]);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Fuera de la sala habitual</span>
        <h1 className="page-head__title">Eventos</h1>
        <p className="page-head__note">
          Festivales, conciertos y conversatorios en salas asociadas a la red TicketFilms.
        </p>
      </div>

      <FilterBar
        groups={[
          {
            key: "categoria",
            label: "Categoría",
            value: category,
            onChange: setCategory,
            options: CATEGORIES.map((c) => ({ value: c, label: c })),
          },
          {
            key: "ciudad",
            label: "Ciudad",
            value: city,
            onChange: setCity,
            options: CITIES.map((c) => ({ value: c, label: c })),
          },
        ]}
      />

      {filtered.length === 0 ? (
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
