import { createContext, useContext, useState, useCallback } from "react";

// Simula RF-01/RF-02/RF-03: login vía Google Auth Platform (OAuth2/OIDC),
// obtención de JWT y cierre de sesión. Mientras no exista backend, el
// "JWT" es un objeto en memoria; la forma del contrato es la misma que
// tendría la integración real.
const AuthContext = createContext(null);

const MOCK_ACCOUNTS = [
  { name: "Renata Ibáñez", email: "renata.ibanez@gmail.com" },
  { name: "Tomás Elgueta", email: "tomas.elgueta@gmail.com" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | authenticated

  const loginWithGoogle = useCallback(() => {
    setStatus("loading");
    return new Promise((resolve) => {
      setTimeout(() => {
        const account = MOCK_ACCOUNTS[Math.floor(Math.random() * MOCK_ACCOUNTS.length)];
        const token = {
          sub: account.email,
          name: account.name,
          issuedAt: Date.now(),
          // token simulado — el backend real emitiría un JWT firmado
          value: `mock.jwt.${btoa(account.email)}`,
        };
        setUser({ ...account, token });
        setStatus("authenticated");
        resolve(account);
      }, 900);
    });
  }, []);

  const logout = useCallback(() => {
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
