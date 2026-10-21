import { useCallback, useEffect, useState } from "react";
import {
  getTopicos,
  getTopico,
  crearTopico,
  eliminarTopico,
  getGruposConsumidores,
} from "../services/kafkaAdminService";
import { errorMessage } from "../utils/apiError";
import Badge from "../components/common/Badge";
import "../styles/AdminKafka.css";

// Mismos tópicos que protege el backend (KafkaAdminService.TOPICOS_PROTEGIDOS).
const PROTEGIDOS = new Set([
  "boleto.comprado",
  "compra.fallida",
  "reserva.expirada",
  "boleto.comprado.DLT",
  "compra.fallida.DLT",
  "reserva.expirada.DLT",
]);

// Mismo patrón que valida el backend.
const NOMBRE_VALIDO = /^[a-zA-Z0-9._-]{1,249}$/;

const FORM_INICIAL = { nombre: "", particiones: 1, replicas: 1 };

export default function AdminKafka() {
  const [state, setState] = useState({
    status: "loading",
    topicos: [],
    grupos: [],
  });
  const [form, setForm] = useState(FORM_INICIAL);
  const [formError, setFormError] = useState("");
  const [creando, setCreando] = useState(false);
  const [feedback, setFeedback] = useState(null); // { tipo: "ok" | "error", texto }
  const [borrando, setBorrando] = useState(null); // nombre en proceso de borrado
  const [detalles, setDetalles] = useState({}); // { [nombre]: TopicoDto }

  const cargar = useCallback(async () => {
    try {
      const [topicos, grupos] = await Promise.all([
        getTopicos(),
        getGruposConsumidores(),
      ]);
      setState({ status: "ok", topicos: [...topicos].sort(), grupos });
    } catch (err) {
      setState({
        status: err.response?.status ?? "error",
        topicos: [],
        grupos: [],
      });
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  function validar({ nombre, particiones, replicas }) {
    if (!nombre.trim()) return "El nombre es obligatorio.";
    if (nombre === "." || nombre === "..") return "Nombre inválido.";
    if (!NOMBRE_VALIDO.test(nombre))
      return "Solo letras, números, punto, guion y guion bajo (sin espacios).";
    if (!Number.isInteger(particiones) || particiones < 1 || particiones > 100)
      return "Las particiones deben estar entre 1 y 100.";
    if (!Number.isInteger(replicas) || replicas < 1 || replicas > 10)
      return "Las réplicas deben estar entre 1 y 10.";
    return "";
  }

  async function handleCrear(e) {
    e.preventDefault();
    if (creando) return;
    const datos = {
      nombre: form.nombre.trim(),
      particiones: Number(form.particiones),
      replicas: Number(form.replicas),
    };
    const problema = validar(datos);
    setFormError(problema);
    if (problema) return;

    setCreando(true);
    setFeedback(null);
    try {
      await crearTopico(datos);
      setFeedback({ tipo: "ok", texto: `Tópico "${datos.nombre}" creado.` });
      setForm(FORM_INICIAL);
      await cargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos crear el tópico."),
      });
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(nombre) {
    if (borrando) return;
    if (
      !window.confirm(
        `¿Eliminar el tópico "${nombre}"? Esta acción no se puede deshacer.`,
      )
    )
      return;

    setBorrando(nombre);
    setFeedback(null);
    try {
      await eliminarTopico(nombre);
      setFeedback({ tipo: "ok", texto: `Tópico "${nombre}" eliminado.` });
      setDetalles((d) => {
        const { [nombre]: _quitado, ...resto } = d;
        return resto;
      });
      await cargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos eliminar el tópico."),
      });
    } finally {
      setBorrando(null);
    }
  }

  async function toggleDetalle(nombre) {
    if (detalles[nombre]) {
      setDetalles((d) => {
        const { [nombre]: _quitado, ...resto } = d;
        return resto;
      });
      return;
    }
    try {
      const dto = await getTopico(nombre);
      setDetalles((d) => ({ ...d, [nombre]: dto }));
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos cargar el detalle del tópico."),
      });
    }
  }

  if (state.status === "loading") {
    return (
      <div className="container empty-state">
        <strong>Cargando…</strong>
      </div>
    );
  }

  if (state.status === 403) {
    return (
      <div className="container empty-state">
        <strong>No tienes permisos de administrador</strong>
        <p>Tu usuario debe pertenecer al grupo admin de Cognito.</p>
      </div>
    );
  }

  if (state.status !== "ok") {
    return (
      <div className="container empty-state">
        <strong>No pudimos cargar la administración de Kafka</strong>
        <p>
          {state.status === 404
            ? "El API Manager no tiene la ruta /api/admin/** configurada."
            : "Revisa que ms-notificaciones y Kafka estén arriba."}
        </p>
        <button
          className="btn btn--outline btn--m"
          style={{ marginTop: 24 }}
          onClick={() => {
            setState({ status: "loading", topicos: [], grupos: [] });
            cargar();
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container admin-kafka">
      <div className="page-head">
        <span className="eyebrow">Administración</span>
        <h1 className="page-head__title">Kafka</h1>
        <p className="page-head__note">
          Tópicos y grupos de consumidores de ms-notificaciones.
        </p>
      </div>

      {feedback && (
        <div
          className={`admin-kafka__feedback admin-kafka__feedback--${feedback.tipo}`}
          role={feedback.tipo === "error" ? "alert" : "status"}
        >
          {feedback.texto}
        </div>
      )}

      {/* ---------- Crear tópico ---------- */}
      <section className="admin-kafka__card">
        <h2 className="admin-kafka__title">Crear tópico</h2>
        <form className="admin-kafka__form" onSubmit={handleCrear} noValidate>
          <label className="admin-kafka__field admin-kafka__field--grow">
            <span>Nombre</span>
            <input
              type="text"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="ej. test.topic"
              maxLength={249}
              autoComplete="off"
            />
          </label>
          <label className="admin-kafka__field">
            <span>Particiones</span>
            <input
              type="number"
              min={1}
              max={100}
              value={form.particiones}
              onChange={(e) =>
                setForm({ ...form, particiones: e.target.value })
              }
            />
          </label>
          <label className="admin-kafka__field">
            <span>Réplicas</span>
            <input
              type="number"
              min={1}
              max={10}
              value={form.replicas}
              onChange={(e) => setForm({ ...form, replicas: e.target.value })}
            />
          </label>
          <button
            type="submit"
            className="btn btn--primary btn--m"
            disabled={creando}
          >
            {creando ? "Creando…" : "Crear"}
          </button>
        </form>
        {formError && (
          <p className="admin-kafka__error" role="alert">
            {formError}
          </p>
        )}
      </section>

      {/* ---------- Lista de tópicos ---------- */}
      <section className="admin-kafka__card">
        <div className="admin-kafka__head">
          <h2 className="admin-kafka__title">
            Tópicos ({state.topicos.length})
          </h2>
          <button className="btn btn--outline btn--s" onClick={cargar}>
            Actualizar
          </button>
        </div>

        {state.topicos.length === 0 ? (
          <p className="admin-kafka__empty">No hay tópicos.</p>
        ) : (
          <ul className="admin-kafka__list">
            {state.topicos.map((nombre) => {
              const protegido = PROTEGIDOS.has(nombre);
              const detalle = detalles[nombre];
              return (
                <li key={nombre} className="admin-kafka__item">
                  <div className="admin-kafka__row">
                    <span className="admin-kafka__name">{nombre}</span>
                    {protegido && <Badge tone="navy">Sistema</Badge>}
                    <div className="admin-kafka__actions">
                      <button
                        className="btn btn--ghost btn--s"
                        onClick={() => toggleDetalle(nombre)}
                      >
                        {detalle ? "Ocultar" : "Detalle"}
                      </button>
                      <button
                        className="btn btn--outline btn--s"
                        onClick={() => handleEliminar(nombre)}
                        disabled={protegido || borrando === nombre}
                        title={
                          protegido
                            ? "Los tópicos del sistema no se pueden eliminar"
                            : undefined
                        }
                      >
                        {borrando === nombre ? "Eliminando…" : "Eliminar"}
                      </button>
                    </div>
                  </div>
                  {detalle && (
                    <p className="admin-kafka__detail">
                      {detalle.particiones}{" "}
                      {detalle.particiones === 1 ? "partición" : "particiones"}{" "}
                      · {detalle.replicas}{" "}
                      {detalle.replicas === 1 ? "réplica" : "réplicas"}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ---------- Grupos de consumidores ---------- */}
      <section className="admin-kafka__card">
        <h2 className="admin-kafka__title">
          Grupos de consumidores ({state.grupos.length})
        </h2>
        {state.grupos.length === 0 ? (
          <p className="admin-kafka__empty">No hay grupos de consumidores.</p>
        ) : (
          <ul className="admin-kafka__list">
            {state.grupos.map((g) => (
              <li key={g.grupoId} className="admin-kafka__item">
                <div className="admin-kafka__row">
                  <span className="admin-kafka__name">{g.grupoId}</span>
                  <Badge tone="outline">{g.estado}</Badge>
                </div>
                <p className="admin-kafka__detail">
                  {g.topicos.length > 0
                    ? g.topicos.join(", ")
                    : "Sin consumidores conectados"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
