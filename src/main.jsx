import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import "./index.css";
import App from "./App.jsx";
import { userManager } from "./auth/oidcConfig";

createRoot(document.getElementById("root")).render(
  <AuthProvider userManager={userManager}>
    <App />
  </AuthProvider>,
);
