import { seededRandom } from "../utils/random";
import { getVenue } from "./venues";

// Genera el estado de la sala para una función específica. El mismo
// showtimeId siempre produce el mismo mapa (disponible / ocupado),
// simulando lo que en producción vendría de ms-asientos.
export function generateSeatMap(showtimeId, venueId) {
  const venue = getVenue(venueId);
  if (!venue) return { rows: [], venue: null };
  const rand = seededRandom(`seats-${showtimeId}`);
  const occupancy = 0.25 + rand() * 0.35; // 25%–60% de ocupación simulada

  const rows = venue.rows.map((rowLetter) => {
    const isPremium = venue.premiumRows.includes(rowLetter);
    const seats = [];
    for (let n = 1; n <= venue.seatsPerRow; n++) {
      const occupied = rand() < occupancy;
      seats.push({
        id: `${rowLetter}${n}`,
        row: rowLetter,
        number: n,
        category: isPremium ? "premium" : "regular",
        status: occupied ? "occupied" : "available",
      });
    }
    return { row: rowLetter, seats, isPremium };
  });

  return { rows, venue };
}
