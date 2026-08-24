import { Link } from "react-router-dom";

export default function ComingSoon({ label }) {
  return (
    <div className="container" style={{ padding: "120px 0", textAlign: "center" }}>
      <span className="eyebrow" style={{ justifyContent: "center" }}>En construcción</span>
      <h1 style={{ fontSize: "clamp(28px,4vw,44px)", marginTop: 14 }}>{label}</h1>
      <p style={{ color: "var(--ink-soft)", marginTop: 14 }}>
        Esta pantalla del flujo de compra se agrega en la próxima iteración.
      </p>
      <Link to="/" className="btn btn--outline btn--m" style={{ marginTop: 28 }}>
        Volver al inicio
      </Link>
    </div>
  );
}
