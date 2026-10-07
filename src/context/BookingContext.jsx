import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";

// Estado del flujo de compra: título -> función -> cantidad (General/Premium) ->
// asientos -> reserva -> resumen. La compra en sí la hace ms-boletos.
const BookingContext = createContext(null);

const MIN_SEATS = 1; // mínimo total por compra
const MAX_SEATS = 10; // mismo tope por reserva que ms-asientos
const DEFAULT_GENERAL = 1;
const DEFAULT_PREMIUM = 0;
const RESERVATION_MS = 5 * 60 * 1000; // ms-asientos mantiene la reserva 5 minutos

const isPremium = (seat) => seat.category === "premium";

// Deja como máximo `general` asientos regulares y `premium` asientos premium.
function trimSeats(seats, general, premium) {
  let g = 0;
  let p = 0;
  return seats.filter((s) => {
    if (isPremium(s)) return ++p <= premium;
    return ++g <= general;
  });
}

export function BookingProvider({ children }) {
  const [title, setTitle] = useState(null); // { type: 'pelicula'|'evento', data }
  const [showtime, setShowtimeState] = useState(null);
  const [generalQty, setGeneralQtyState] = useState(DEFAULT_GENERAL);
  const [premiumQty, setPremiumQtyState] = useState(DEFAULT_PREMIUM);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservation, setReservation] = useState(null); // { expiresAt }

  const seatQuantity = generalQty + premiumQty;

  const resetQuantities = () => {
    setGeneralQtyState(DEFAULT_GENERAL);
    setPremiumQtyState(DEFAULT_PREMIUM);
  };

  const setTitleAndReset = useCallback((titleType, data) => {
    setTitle({ type: titleType, data });
    setShowtimeState(null);
    setSelectedSeats([]);
    setReservation(null);
    setGeneralQtyState(DEFAULT_GENERAL);
    setPremiumQtyState(DEFAULT_PREMIUM);
  }, []);

  const chooseShowtime = useCallback((newShowtime) => {
    setShowtimeState(newShowtime);
    setSelectedSeats([]);
    setReservation(null);
  }, []);

  const setGeneralQty = useCallback(
    (value) => {
      const min = premiumQty === 0 ? MIN_SEATS : 0;
      const max = MAX_SEATS - premiumQty;
      const n = Math.min(max, Math.max(min, Number(value) || 0));
      setGeneralQtyState(n);
      setSelectedSeats((prev) => trimSeats(prev, n, premiumQty));
    },
    [premiumQty],
  );

  const setPremiumQty = useCallback(
    (value) => {
      const min = generalQty === 0 ? MIN_SEATS : 0;
      const max = MAX_SEATS - generalQty;
      const n = Math.min(max, Math.max(min, Number(value) || 0));
      setPremiumQtyState(n);
      setSelectedSeats((prev) => trimSeats(prev, generalQty, n));
    },
    [generalQty],
  );

  const toggleSeat = useCallback(
    (seat) => {
      if (seat.status === "occupied") return;
      setSelectedSeats((prev) => {
        if (prev.some((s) => s.id === seat.id)) {
          return prev.filter((s) => s.id !== seat.id);
        }
        const premium = isPremium(seat);
        const limit = premium ? premiumQty : generalQty;
        const count = prev.filter((s) => isPremium(s) === premium).length;
        if (count >= limit) return prev;
        return [...prev, seat];
      });
    },
    [generalQty, premiumQty],
  );

  const clearSeats = useCallback(() => setSelectedSeats([]), []);

  const startReservation = useCallback(() => {
    setReservation({ expiresAt: Date.now() + RESERVATION_MS });
  }, []);

  const totalPrice = useMemo(() => {
    if (!showtime) return 0;
    return selectedSeats.reduce(
      (sum, s) =>
        sum + (isPremium(s) ? showtime.pricePremium : showtime.priceRegular),
      0,
    );
  }, [selectedSeats, showtime]);

  const resetBooking = useCallback(() => {
    setTitle(null);
    setShowtimeState(null);
    setSelectedSeats([]);
    setReservation(null);
    setGeneralQtyState(DEFAULT_GENERAL);
    setPremiumQtyState(DEFAULT_PREMIUM);
  }, []);

  const value = {
    title,
    showtime,
    selectedSeats,
    generalQty,
    premiumQty,
    seatQuantity,
    minSeats: MIN_SEATS,
    maxSeats: MAX_SEATS,
    totalPrice,
    reservation,
    setTitleAndReset,
    chooseShowtime,
    setGeneralQty,
    setPremiumQty,
    toggleSeat,
    clearSeats,
    startReservation,
    resetBooking,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx)
    throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  return ctx;
}
