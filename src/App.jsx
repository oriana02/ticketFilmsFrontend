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
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import Callback from "./pages/Callback"; // ← agregar

export default function App() {
  return (
    <BookingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
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
                  <ComingSoon label="Resumen de compra" />
                </RequireAuth>
              }
            />
            <Route
              path="/confirmacion/:code"
              element={
                <RequireAuth>
                  <ComingSoon label="Confirmación de compra" />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/callback" element={<Callback />} /> {/* ← agregar */}
            <Route
              path="/cuenta"
              element={
                <RequireAuth>
                  <ComingSoon label="Mis boletos" />
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
