// Salas simuladas — cada una define su mapa de asientos base.
export const venues = [
  {
    id: "sala-1",
    name: "Sala 1 — Lumière",
    rows: ["A", "B", "C", "D", "E", "F", "G"],
    seatsPerRow: 12,
    premiumRows: ["F", "G"],
    aisleAfter: [4, 8],
  },
  {
    id: "sala-2",
    name: "Sala 2 — Meliès",
    rows: ["A", "B", "C", "D", "E"],
    seatsPerRow: 10,
    premiumRows: ["D", "E"],
    aisleAfter: [3, 7],
  },
  {
    id: "sala-3",
    name: "Sala 3 — Varda",
    rows: ["A", "B", "C", "D", "E", "F"],
    seatsPerRow: 14,
    premiumRows: ["E", "F"],
    aisleAfter: [4, 10],
  },
];

export const getVenue = (id) => venues.find((v) => v.id === id);
