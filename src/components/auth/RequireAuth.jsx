import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// RF-17: exige autenticación antes de seleccionar asientos o confirmar compra.
export default function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
