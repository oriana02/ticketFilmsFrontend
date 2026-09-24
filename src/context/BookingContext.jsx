import { createContext, useContext, useMemo, useState, useCallback } from "react";

// Estado del flujo de compra: título -> función -> cantidad -> asientos ->
// reserva -> resumen. La compra en sí la hace ms-boletos.
const BookingContext = createContext(null);

const MIN_SEATS = 1;
const MAX_SEATS = 10; // mismo tope por reserva que ms-asientos
const DEFAULT_SEATS = 2;
const RESERVATION_MS = 5 * 60 * 1000; // ms-asientos mantiene la reserva 5 minutos

export function BookingProvider({ children }) {
  const [title, setTitle] = useState(null); // { type: 'pelicula'|'evento', data }
  const [showtime, setShowtimeState] = useState(null);
  const [seatQuantity, setSeatQuantityState] = useState(DEFAULT_SEATS);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservation, setReservation] = useState(null); // { expiresAt }

  const setTitleAndReset = useCallback((titleType, data) => {
    setTitle({ type: titleType, data });
    setShowtimeState(null);
    setSelectedSeats([]);
    setReservation(null);
    setSeatQuantityState(DEFAULT_SEATS);
  }, []);

  const chooseShowtime = useCallback((newShowtime) => {
    setShowtimeState(newShowtime);
    setSelectedSeats([]);
    setReservation(null);
  }, []);

  const setSeatQuantity = useCallback((value) => {
    const n = Math.min(MAX_SEATS, Math.max(MIN_SEATS, Number(value) || MIN_SEATS));
    setSeatQuantityState(n);
    setSelectedSeats((prev) => prev.slice(0, n));
  }, []);

  const toggleSeat = useCallback(
    (seat) => {
      if (seat.status === "occupied") return;
      setSelectedSeats((prev) => {
        const exists = prev.find((s) => s.id === seat.id);
        if (exists) return prev.filter((s) => s.id !== seat.id);
        if (prev.length >= seatQuantity) return prev;
        return [...prev, seat];
      });
    },
    [seatQuantity],
  );

  const clearSeats = useCallback(() => setSelectedSeats([]), []);

  const startReservation = useCallback(() => {
    setReservation({ expiresAt: Date.now() + RESERVATION_MS });
  }, []);

  const totalPrice = useMemo(() => {
    if (!showtime) return 0;
    return selectedSeats.reduce(
      (sum, s) => sum + (s.category === "premium" ? showtime.pricePremium : showtime.priceRegular),
      0,
    );
  }, [selectedSeats, showtime]);

  const resetBooking = useCallback(() => {
    setTitle(null);
    setShowtimeState(null);
    setSelectedSeats([]);
    setReservation(null);
    setSeatQuantityState(DEFAULT_SEATS);
  }, []);

  const value = {
    title,
    showtime,
    selectedSeats,
    seatQuantity,
    minSeats: MIN_SEATS,
    maxSeats: MAX_SEATS,
    totalPrice,
    reservation,
    setTitleAndReset,
    chooseShowtime,
    setSeatQuantity,
    toggleSeat,
    clearSeats,
    startReservation,
    resetBooking,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  return ctx;
}
