import { seededRandom } from "../utils/random";
import { venues } from "./venues";

const WEEKDAYS = ["dom", "lun", "mar", "mié", "jué", "vie", "sáb"];
const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];
const SLOT_HOURS = [15, 17, 30, 19, 30, 21, 45, 22, 30]; // pares [h, m] intercalados abajo
const TIME_SLOTS = [
  { h: 15, m: 0 },
  { h: 17, m: 30 },
  { h: 19, m: 45 },
  { h: 22, m: 10 },
];
const FORMATS = ["2D", "2D Subtitulada", "2D Doblada", "3D"];

function dateAt(offsetDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function formatDate(d) {
  return {
    iso: d.toISOString().slice(0, 10),
    weekday: WEEKDAYS[d.getDay()],
    day: d.getDate(),
    month: MONTHS[d.getMonth()],
  };
}

// Genera N días de funciones para un título (película o evento) de forma
// determinística: la misma titleId siempre produce el mismo horario simulado.
export function generateSchedule(titleId, days = 6) {
  const rand = seededRandom(titleId);
  const schedule = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const date = formatDate(dateAt(dayIndex));
    const slotCount = 2 + Math.floor(rand() * 2); // 2 o 3 funciones por día
    const chosenSlots = [...TIME_SLOTS]
      .sort(() => rand() - 0.5)
      .slice(0, slotCount)
      .sort((a, b) => a.h - b.h);

    const showtimes = chosenSlots.map((slot, slotIndex) => {
      const venue = venues[Math.floor(rand() * venues.length)];
      const format = FORMATS[Math.floor(rand() * FORMATS.length)];
      const priceRegular = 4500 + Math.floor(rand() * 4) * 500;
      const pricePremium = priceRegular + 2000;
      return {
        id: `${titleId}-${dayIndex}-${slotIndex}`,
        titleId,
        dayIndex,
        slotIndex,
        date: date.iso,
        time: `${String(slot.h).padStart(2, "0")}:${String(slot.m).padStart(2, "0")}`,
        venueId: venue.id,
        venueName: venue.name,
        format,
        priceRegular,
        pricePremium,
      };
    });

    schedule.push({ date, showtimes });
  }

  return schedule;
}

export function getShowtimeById(showtimeId) {
  if (!showtimeId) return null;
  const parts = showtimeId.split("-");
  const slotIndex = Number(parts.pop());
  const dayIndex = Number(parts.pop());
  const titleId = parts.join("-");
  const schedule = generateSchedule(titleId, dayIndex + 1);
  const day = schedule[dayIndex];
  if (!day) return null;
  return day.showtimes.find((s) => s.slotIndex === slotIndex) || null;
}

export function formatMoney(clp) {
  return clp.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
