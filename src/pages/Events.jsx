import { useEffect, useState } from "react";
import TitleCard from "../components/home/TitleCard";
import FilterBar from "../components/common/FilterBar";
import { useFiltrosCascada } from "../hooks/useFiltrosCascada";
import { getEventos } from "../services/carteleraService";

const TIPOS_EVENTO = [
  "CINE",
  "CONCIERTO",
  "DEPORTE",
  "TEATRO",
  "FERIA",
  "CORPORATIVO",
];

export default function Events() {
  const {
    regiones,
    ciudades,
    sedes,
    region,
    setRegion,
    ciudad,
    setCiudad,
    sede,
    setSede,
  } = useFiltrosCascada();

  const [tipoEvento, setTipoEvento] = useState("");
  const [genero, setGenero] = useState("");
  const [fecha, setFecha] = useState("");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEventos({
        region,
        ciudad,
        sede,
        tipoEvento,
        genero,
        fecha,
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
  }, [region, ciudad, sede, tipoEvento, genero, fecha]);

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
            key: "ciudad",
            label: "Ciudad",
            value: ciudad,
            onChange: setCiudad,
            disabled: !region,
            options: [
              { value: "", label: "Todas" },
              ...ciudades.map((c) => ({ value: c, label: c })),
            ],
          },
          {
            key: "sede",
            label: "Sede",
            value: sede,
            onChange: setSede,
            disabled: !ciudad,
            options: [
              { value: "", label: "Todas" },
              ...sedes.map((s) => ({ value: s, label: s })),
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
            key: "fecha",
            label: "Fecha",
            type: "date",
            value: fecha,
            onChange: setFecha,
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
          <p>Prueba con otra región, ciudad o tipo.</p>
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
