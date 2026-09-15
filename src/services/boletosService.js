import apiClient from "../lib/apiClient";

// El backend extrae usuarioId del JWT — nunca lo mandamos nosotros.
//
// IMPORTANTE: asientos debe venir de ms-asientos (GET /api/asientos/mapa/{funcionId}),
// no del mock generateSeatMap() — el asientoId real (Long) solo existe ahí.
// category del mock ("premium"/"regular") debe mapearse a categoria del
// backend ("PREMIUM"/"ESTANDAR").
function toAsientoCompraDto(seat, precio) {
  return {
    asientoId: seat.asientoId, // debe venir de ms-asientos, no de "F7"
    fila: seat.row,
    numero: seat.number,
    categoria: seat.category === "premium" ? "PREMIUM" : "ESTANDAR",
    precio,
  };
}

export async function confirmarCompra({ title, showtime, selectedSeats, totalPrice }) {
  const request = {
    funcionId: Number(showtime.id),
    eventoId: Number(title.data.id),
    tituloEvento: title.data.title,
    fechaHoraFuncion: `${showtime.date}T${showtime.time}:00`,
    asientos: selectedSeats.map((seat) =>
      toAsientoCompraDto(
        seat,
        seat.category === "premium" ? showtime.pricePremium : showtime.priceRegular
      )
    ),
  };
  const { data } = await apiClient.post("/api/boletos/compra", request);
  return data; // BoletoResponseDto
}

export async function getHistorial() {
  const { data } = await apiClient.get("/api/boletos/historial");
  return data; // BoletoResponseDto[]
}

export async function getBoletoPorCodigo(codigo) {
  const { data } = await apiClient.get(`/api/boletos/${codigo}`);
  return data; // BoletoResponseDto
}
