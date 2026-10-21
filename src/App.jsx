import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./context/BookingContext";
import Layout from "./components/layout/Layout";
import RequireAuth from "./components/auth/RequireAuth";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Events from "./pages/Events";
import Detail from "./pages/Detail";
import Showtimes from "./pages/Showtimes";
import Seats from "./pages/Seats";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import MyTickets from "./pages/MyTickets";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import Callback from "./pages/Callback";
import AdminKafka from "./pages/AdminKafka";

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/admin/kafka" element={<AdminKafka />} />
            <Route path="/" element={<Home />} />
            <Route path="/peliculas" element={<Movies />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/titulo/:type/:id" element={<Detail />} />
            <Route path="/titulo/:type/:id/horarios" element={<Showtimes />} />
            <Route
              path="/titulo/:type/:id/asientos"
              element={
                <RequireAuth>
                  <Seats />
                </RequireAuth>
              }
            />
            <Route
              path="/titulo/:type/:id/resumen"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/confirmacion/:code"
              element={
                <RequireAuth>
                  <Confirmation />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/cuenta"
              element={
                <RequireAuth>
                  <MyTickets />
                </RequireAuth>
              }
            />
            <Route
              path="*"
              element={<ComingSoon label="Página no encontrada" />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </BookingProvider>
  );
}
