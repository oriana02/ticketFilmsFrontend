import { createContext, useContext, useMemo, useState, useCallback } from "react";

// Estado compartido del flujo de compra: título -> función -> asientos ->
// resumen -> confirmación. Equivale, en el sistema real, a lo que orquestaría
// el frontend entre ms-cartelera, ms-asientos y ms-boletos a través del
// API Manager.
const BookingContext = createContext(null);

function makeTicketCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `TF-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function BookingProvider({ children }) {
  const [title, setTitle] = useState(null); // { type: 'pelicula'|'evento', data }
  const [showtime, setShowtimeState] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [order, setOrder] = useState(null);

  const setTitleAndReset = useCallback((titleType, data) => {
    setTitle({ type: titleType, data });
    setShowtimeState(null);
    setSelectedSeats([]);
  }, []);

  const chooseShowtime = useCallback((newShowtime) => {
    setShowtimeState(newShowtime);
    setSelectedSeats([]);
  }, []);

  const toggleSeat = useCallback((seat) => {
    if (seat.status === "occupied") return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 8) return prev; // límite razonable por compra
      return [...prev, seat];
    });
  }, []);

  const clearSeats = useCallback(() => setSelectedSeats([]), []);

  const totalPrice = useMemo(() => {
    if (!showtime) return 0;
    return selectedSeats.reduce(
      (sum, s) => sum + (s.category === "premium" ? showtime.pricePremium : showtime.priceRegular),
      0
    );
  }, [selectedSeats, showtime]);

  const confirmPurchase = useCallback(() => {
    const newOrder = {
      code: makeTicketCode(),
      title,
      showtime,
      seats: selectedSeats,
      totalPrice,
      purchasedAt: new Date().toISOString(),
    };
    setOrder(newOrder);
    return newOrder;
  }, [title, showtime, selectedSeats, totalPrice]);

  const resetBooking = useCallback(() => {
    setTitle(null);
    setShowtimeState(null);
    setSelectedSeats([]);
    setOrder(null);
  }, []);

  const value = {
    title,
    showtime,
    selectedSeats,
    totalPrice,
    order,
    setTitleAndReset,
    chooseShowtime,
    toggleSeat,
    clearSeats,
    confirmPurchase,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  return ctx;
}
