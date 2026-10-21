import { premiumPrice } from "../utils/pricing";

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="1000"><rect width="100%" height="100%" fill="#1f2937"/><text x="50%" y="50%" fill="#9ca3af" font-family="sans-serif" font-size="32" text-anchor="middle">Sin imagen</text></svg>',
  );

function splitList(value) {
  return value ? String(value).split(",").map((s) => s.trim()).filter(Boolean) : [];
}

function slugify(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ACTIVO -> en cartelera; PROXIMAMENTE -> próximamente; cualquier otro valor se oculta.
function adaptStatus(estado) {
  const e = String(estado ?? "").toUpperCase();
  if (e === "ACTIVO") return "cartelera";
  if (e.startsWith("PROXIM")) return "proximamente";
  return "inactivo";
}

export function formatDateLabel(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const text = d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} · ${time} hrs`;
}

// Evento del backend -> forma que usan las tarjetas, el Hero y el detalle.
export function adaptEvento(e) {
  const type = String(e.tipoEvento ?? "").toUpperCase() === "PELICULA" ? "pelicula" : "evento";
  const image = e.urlImagen || PLACEHOLDER;
  const base = {
    id: String(e.id),
    slug: slugify(e.titulo),
    type,
    title: e.titulo,
    status: adaptStatus(e.estado),
    poster: image,
    backdrop: image,
    city: e.ciudad || "",
    duration: e.duracionMinutos ?? null,
    rating: e.clasificacion || "",
    city: e.ciudad || "",
    region: e.region || "",
    sede: e.sede || "",
  };

  if (type === "pelicula") {
    return {
      ...base,
      year: null,
      country: e.origen || "",
      director: e.director || "",
      cast: splitList(e.reparto),
      genres: splitList(e.genero),
      language: e.idioma || "",
      format: "",
      synopsis: e.descripcion || "",
    };
  }

  return {
    ...base,
    category: e.genero || "Evento",
    venue: e.proximaSala || "",
    description: e.descripcion || "",
    dateLabel: formatDateLabel(e.proximaFuncion),
  };
}

// Función del backend -> "showtime" que usan Showtimes, Seats y la compra.
export function adaptFuncion(f) {
  const fecha = String(f.fechaHora);
  const base = Number(f.precioAsociado);
  const subtitulada = String(f.subtitulada ?? "").toUpperCase().startsWith("S");
  return {
    id: String(f.id),
    startsAt: fecha,
    date: fecha.slice(0, 10),
    time: fecha.slice(11, 16),
    venueId: f.sala,
    salaCodigo: f.sala,
    venueName: f.sala,
    format: [f.tipoSala, subtitulada ? "Subtitulada" : null].filter(Boolean).join(" "),
    priceRegular: base,
    pricePremium: premiumPrice(base),
  };
}

function dateParts(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return { iso, weekday: WEEKDAYS[dt.getDay()], day: d, month: MONTHS[m - 1] };
}

// Agrupa las funciones futuras por día, en el formato que espera DateSelector.
export function buildSchedule(funciones) {
  const now = new Date();
  const byDate = new Map();

  funciones
    .map(adaptFuncion)
    .filter((s) => new Date(s.startsAt) > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .forEach((s) => {
      if (!byDate.has(s.date)) byDate.set(s.date, []);
      byDate.get(s.date).push(s);
    });

  return [...byDate.entries()].map(([iso, showtimes]) => ({ date: dateParts(iso), showtimes }));
}
