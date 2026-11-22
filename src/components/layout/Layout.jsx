import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NoAccess from "../../pages/NoAccess";
import { hasAccess } from "../../config/versions";

export default function Layout() {
  const { pathname } = useLocation();
  const auth = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Autenticado pero sin el grupo de esta versión (ni admin): bloqueado.
  const blocked = auth.isAuthenticated && !hasAccess(auth.user);

  return (
    <div className="app-shell">
      <Navbar />
      <main>{blocked ? <NoAccess /> : <Outlet />}</main>
      <Footer />
    </div>
  );
}
