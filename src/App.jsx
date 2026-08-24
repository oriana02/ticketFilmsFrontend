import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import Events from "./pages/Events";
import Detail from "./pages/Detail";
import ComingSoon from "./pages/ComingSoon";
import InicioSesion from "./components/inicioSesion";

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

              {/* Flujo de compra — se completa en la próxima iteración */}
              <Route
                path="/titulo/:type/:id/horarios"
                element={<ComingSoon label="Selección de fecha y horario" />}
              />
              <Route
                path="/titulo/:type/:id/asientos"
                element={<ComingSoon label="Selección de asientos" />}
              />
              <Route
                path="/titulo/:type/:id/resumen"
                element={<ComingSoon label="Resumen de compra" />}
              />
              <Route
                path="/confirmacion/:code"
                element={<ComingSoon label="Confirmación de compra" />}
              />
              <Route path="/login" element={<InicioSesion />} />
              <Route
                path="/cuenta"
                element={<ComingSoon label="Mis boletos" />}
              />

              <Route
                path="*"
                element={<ComingSoon label="Página no encontrada" />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}
