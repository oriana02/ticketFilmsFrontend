import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
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

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/peliculas" element={<Movies />} />
              <Route path="/eventos" element={<Events />} />
              <Route path="/titulo/:type/:id" element={<Detail />} />

              {/* Fecha/horario: público (CA-02) */}
              <Route
                path="/titulo/:type/:id/horarios"
                element={<Showtimes />}
              />

              {/* Desde aquí en adelante requiere sesión (RF-17 / CA-03) */}
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
              <Route
                path="/cuenta"
                element={
                  <RequireAuth>
                    <ComingSoon label="Mis boletos" />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<ComingSoon label="Página no encontrada" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}
