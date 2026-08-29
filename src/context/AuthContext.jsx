import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

// RF-01/RF-02/RF-03: login vía Google Auth Platform con OpenID Connect.
// El "credential" que entrega Google es un JWT (ID token) real, firmado por
// Google — el mismo que en producción debe adjuntarse como Bearer en cada
// request y que ms-boletos validará como resource server (issuer accounts.google.com).
const AuthContext = createContext(null);
const STORAGE_KEY = "tf_google_credential";

function decodeProfile(credential) {
  const claims = jwtDecode(credential);
  return {
    sub: claims.sub,
    name: claims.name,
    email: claims.email,
    picture: claims.picture,
    token: credential,
    exp: claims.exp,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | authenticated

  // Restaura la sesión si el JWT guardado todavía no expiró.
  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const profile = decodeProfile(saved);
      if (profile.exp * 1000 > Date.now()) {
        setUser(profile);
        setStatus("authenticated");
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const loginWithGoogle = useCallback((credentialResponse) => {
    setStatus("loading");
    try {
      const profile = decodeProfile(credentialResponse.credential);
      sessionStorage.setItem(STORAGE_KEY, credentialResponse.credential);
      setUser(profile);
      setStatus("authenticated");
      return profile;
    } catch (err) {
      setStatus("idle");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    googleLogout();
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setStatus("idle");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, isAuthenticated: !!user, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
