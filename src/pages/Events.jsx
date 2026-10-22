import { useEffect, useState } from "react";
import TitleCard from "../components/home/TitleCard";
import FilterBar from "../components/common/FilterBar";
import { useFiltrosCascada } from "../hooks/useFiltrosCascada";
import { getEventos } from "../services/carteleraService";

const TIPOS_EVENTO = ["Concierto", "Deporte", "Teatro", "Feria", "Corporativo"];

export default function Events() {
  const {
    regiones,
    region,
    setRegion,
  } = useFiltrosCascada();

  const [tipoEvento, setTipoEvento] = useState("");
  const [genero, setGenero] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventos({
        region,
        tipoEvento,
        genero,
      });
      setEvents(data);
    } catch (e) {
      setError("No se pudieron cargar los eventos.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambia cualquier filtro
  useEffect(() => {
    fetchEventos();
  }, [region, tipoEvento, genero]);

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
            key: "region",
            label: "Región",
            value: region,
            onChange: setRegion,
            options: [
              { value: "", label: "Todas" },
              ...regiones.map((r) => ({ value: r, label: r })),
            ],
          },
          {
            key: "tipoEvento",
            label: "Tipo",
            value: tipoEvento,
            onChange: setTipoEvento,
            options: [
              { value: "", label: "Todos" },
              ...TIPOS_EVENTO.map((t) => ({ value: t, label: t })),
            ],
          },
          {
            key: "genero",
            label: "Género",
            value: genero,
            onChange: setGenero,
            options: [
              { value: "", label: "Todos" },
              { value: "Rock", label: "Rock" },
              { value: "Pop", label: "Pop" },
              { value: "Acción", label: "Acción" },
              { value: "Drama", label: "Drama" },
              // etc.
            ],
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
      ) : events.length === 0 ? (
        <div className="empty-state">
          <strong>No hay eventos para este filtro</strong>
          <p>Prueba con otra región o tipo.</p>
        </div>
      ) : (
        <div className="poster-grid">
          {events.map((e) => (
            <TitleCard key={e.id} type="evento" title={e} />
          ))}
        </div>
      )}
    </div>
  );
}
