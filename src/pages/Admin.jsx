import { useCallback, useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  getEventos,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
  getFuncionesPorEvento,
  crearFuncion,
  actualizarFuncion,
  eliminarFuncion,
} from "../services/carteleraService";
import useSalas from "../hooks/useSalas";
import { formatMoney } from "../utils/format";
import { errorMessage } from "../utils/apiError";
import Badge from "../components/common/Badge";
import "../styles/Admin.css";

const ADMIN_GROUP = import.meta.env.VITE_ADMIN_GROUP || "admin";

const TIPOS = ["PELICULA", "CONCIERTO", "DEPORTE", "TEATRO", "FERIA", "CORPORATIVO"];
const ESTADOS = ["ACTIVO", "PROXIMAMENTE", "INACTIVO"];

const EVENTO_VACIO = {
  titulo: "",
  tipoEvento: "PELICULA",
  estado: "ACTIVO",
  urlImagen: "",
  region: "",
  ciudad: "",
  sede: "",
  duracionMinutos: "",
  clasificacion: "",
  origen: "",
  director: "",
  reparto: "",
  genero: "",
  idioma: "",
  descripcion: "",
};

const FUNCION_VACIA = {
  fechaHora: "",
  sala: "",
  tipoSala: "",
  subtitulada: false,
  precioAsociado: "",
};

function Field({ label, grow, children }) {
  return (
    <label className={`admin__field ${grow ? "admin__field--grow" : ""}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Feedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div
      className={`admin__feedback admin__feedback--${feedback.tipo}`}
      role={feedback.tipo === "error" ? "alert" : "status"}
    >
      {feedback.texto}
    </div>
  );
}

// ───────────────────────── Películas / eventos ─────────────────────────
function EventosPanel({ eventos, recargar }) {
  const [form, setForm] = useState(EVENTO_VACIO);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  function reset() {
    setForm(EVENTO_VACIO);
    setEditId(null);
  }

  function handleEditar(ev) {
    setForm(
      Object.fromEntries(
        Object.keys(EVENTO_VACIO).map((k) => [k, ev[k] ?? EVENTO_VACIO[k]]),
      ),
    );
    setEditId(ev.id);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    if (!form.titulo.trim()) {
      setFeedback({ tipo: "error", texto: "El título es obligatorio." });
      return;
    }
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ""),
    );
    if (payload.duracionMinutos) {
      payload.duracionMinutos = Number(payload.duracionMinutos);
    }

    setSaving(true);
    setFeedback(null);
    try {
      if (editId) await actualizarEvento(editId, payload);
      else await crearEvento(payload);
      setFeedback({
        tipo: "ok",
        texto: editId ? "Título actualizado." : "Título creado.",
      });
      reset();
      await recargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos guardar el título."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(ev) {
    if (!window.confirm(`¿Eliminar "${ev.titulo}"? No se puede deshacer.`)) return;
    setFeedback(null);
    try {
      await eliminarEvento(ev.id);
      setFeedback({ tipo: "ok", texto: `"${ev.titulo}" eliminado.` });
      if (editId === ev.id) reset();
      await recargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos eliminar el título."),
      });
    }
  }

  return (
    <>
      <Feedback feedback={feedback} />

      <section className="admin__card">
        <h2 className="admin__title">
          {editId ? `Editar título #${editId}` : "Crear película / evento"}
        </h2>
        <form className="admin__form" onSubmit={handleSubmit} noValidate>
          <Field label="Título" grow>
            <input value={form.titulo} onChange={set("titulo")} maxLength={200} />
          </Field>
          <Field label="Tipo">
            <select value={form.tipoEvento} onChange={set("tipoEvento")}>
              {TIPOS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado">
            <select value={form.estado} onChange={set("estado")}>
              {ESTADOS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="URL de imagen" grow>
            <input value={form.urlImagen} onChange={set("urlImagen")} />
          </Field>
          <Field label="Género(s), separados por coma" grow>
            <input value={form.genero} onChange={set("genero")} />
          </Field>
          <Field label="Duración (min)">
            <input
              type="number"
              min={1}
              value={form.duracionMinutos}
              onChange={set("duracionMinutos")}
            />
          </Field>
          <Field label="Clasificación">
            <input value={form.clasificacion} onChange={set("clasificacion")} />
          </Field>
          <Field label="Región">
            <input value={form.region} onChange={set("region")} />
          </Field>
          <Field label="Ciudad">
            <input value={form.ciudad} onChange={set("ciudad")} />
          </Field>
          <Field label="Sede">
            <input value={form.sede} onChange={set("sede")} />
          </Field>
          <Field label="Dirección">
            <input value={form.director} onChange={set("director")} />
          </Field>
          <Field label="Reparto, separado por coma" grow>
            <input value={form.reparto} onChange={set("reparto")} />
          </Field>
          <Field label="Idioma">
            <input value={form.idioma} onChange={set("idioma")} />
          </Field>
          <Field label="Origen">
            <input value={form.origen} onChange={set("origen")} />
          </Field>
          <Field label="Descripción" grow>
            <textarea rows={3} value={form.descripcion} onChange={set("descripcion")} />
          </Field>

          <div className="admin__form-actions">
            <button type="submit" className="btn btn--primary btn--m" disabled={saving}>
              {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear"}
            </button>
            {editId && (
              <button type="button" className="btn btn--outline btn--m" onClick={reset}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin__card">
        <div className="admin__head">
          <h2 className="admin__title">Títulos ({eventos.length})</h2>
          <button className="btn btn--outline btn--s" onClick={recargar}>
            Actualizar
          </button>
        </div>
        {eventos.length === 0 ? (
          <p className="admin__empty">No hay títulos.</p>
        ) : (
          <ul className="admin__list">
            {eventos.map((ev) => (
              <li key={ev.id} className="admin__item">
                <div className="admin__row">
                  <span className="admin__name">{ev.titulo}</span>
                  <Badge tone="outline">{ev.tipoEvento}</Badge>
                  <Badge tone={ev.estado === "ACTIVO" ? "navy" : "default"}>
                    {ev.estado}
                  </Badge>
                  <div className="admin__actions">
                    <button className="btn btn--ghost btn--s" onClick={() => handleEditar(ev)}>
                      Editar
                    </button>
                    <button className="btn btn--outline btn--s" onClick={() => handleEliminar(ev)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// ───────────────────────── Funciones ─────────────────────────
function FuncionesPanel({ eventos }) {
  const salas = useSalas();
  const [eventoSel, setEventoSel] = useState("");
  const [funciones, setFunciones] = useState([]);
  const [form, setForm] = useState(FUNCION_VACIA);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const eventoId = eventoSel || (eventos[0] ? String(eventos[0].id) : "");

  const cargar = useCallback(async () => {
    if (!eventoId) {
      setFunciones([]);
      return;
    }
    try {
      const list = await getFuncionesPorEvento(eventoId);
      setFunciones(
        [...list].sort((a, b) => String(a.fechaHora).localeCompare(String(b.fechaHora))),
      );
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos cargar las funciones."),
      });
    }
  }, [eventoId]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  function reset() {
    setForm(FUNCION_VACIA);
    setEditId(null);
  }

  function handleEditar(f) {
    setForm({
      fechaHora: String(f.fechaHora).slice(0, 16),
      sala: f.sala ?? "",
      tipoSala: f.tipoSala ?? "",
      subtitulada: String(f.subtitulada ?? "").toUpperCase().startsWith("S"),
      precioAsociado: f.precioAsociado ?? "",
    });
    setEditId(f.id);
    setFeedback(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    if (!eventoId) {
      setFeedback({ tipo: "error", texto: "Elige un título primero." });
      return;
    }
    if (!form.fechaHora || !form.sala || form.precioAsociado === "") {
      setFeedback({ tipo: "error", texto: "Fecha y hora, sala y precio son obligatorios." });
      return;
    }
    const payload = {
      eventoId: Number(eventoId),
      fechaHora: form.fechaHora.length === 16 ? `${form.fechaHora}:00` : form.fechaHora,
      sala: form.sala,
      tipoSala: form.tipoSala,
      subtitulada: form.subtitulada ? "SI" : "NO",
      precioAsociado: Number(form.precioAsociado),
    };

    setSaving(true);
    setFeedback(null);
    try {
      if (editId) await actualizarFuncion(editId, payload);
      else await crearFuncion(payload);
      setFeedback({
        tipo: "ok",
        texto: editId ? "Función actualizada." : "Función creada.",
      });
      reset();
      await cargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos guardar la función."),
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(f) {
    if (!window.confirm(`¿Eliminar la función #${f.id}? No se puede deshacer.`)) return;
    setFeedback(null);
    try {
      await eliminarFuncion(f.id);
      setFeedback({ tipo: "ok", texto: "Función eliminada." });
      if (editId === f.id) reset();
      await cargar();
    } catch (err) {
      setFeedback({
        tipo: "error",
        texto: errorMessage(err, "No pudimos eliminar la función."),
      });
    }
  }

  return (
    <>
      <Feedback feedback={feedback} />

      <section className="admin__card">
        <Field label="Título">
          <select
            value={eventoId}
            onChange={(e) => {
              setEventoSel(e.target.value);
              reset();
            }}
          >
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titulo}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="admin__card">
        <h2 className="admin__title">
          {editId ? `Editar función #${editId}` : "Crear función"}
        </h2>
        <form className="admin__form" onSubmit={handleSubmit} noValidate>
          <Field label="Fecha y hora">
            <input type="datetime-local" value={form.fechaHora} onChange={set("fechaHora")} />
          </Field>
          <Field label="Sala">
            <select value={form.sala} onChange={set("sala")}>
              <option value="">Elegir…</option>
              {salas.map((s) => (
                <option key={s.id} value={s.sala_codigo}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de sala">
            <input value={form.tipoSala} onChange={set("tipoSala")} placeholder="2D, 3D, IMAX…" />
          </Field>
          <Field label="Precio General (CLP)">
            <input
              type="number"
              min={0}
              step={100}
              value={form.precioAsociado}
              onChange={set("precioAsociado")}
            />
          </Field>
          <label className="admin__check">
            <input
              type="checkbox"
              checked={form.subtitulada}
              onChange={(e) => setForm({ ...form, subtitulada: e.target.checked })}
            />
            Subtitulada
          </label>

          <div className="admin__form-actions">
            <button type="submit" className="btn btn--primary btn--m" disabled={saving}>
              {saving ? "Guardando…" : editId ? "Guardar cambios" : "Crear función"}
            </button>
            {editId && (
              <button type="button" className="btn btn--outline btn--m" onClick={reset}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="admin__card">
        <h2 className="admin__title">Funciones ({funciones.length})</h2>
        {funciones.length === 0 ? (
          <p className="admin__empty">Este título no tiene funciones.</p>
        ) : (
          <ul className="admin__list">
            {funciones.map((f) => (
              <li key={f.id} className="admin__item">
                <div className="admin__row">
                  <span className="admin__name">
                    {String(f.fechaHora).replace("T", " ").slice(0, 16)}
                  </span>
                  <span>{f.sala}</span>
                  {f.tipoSala && <Badge tone="outline">{f.tipoSala}</Badge>}
                  <span>{formatMoney(f.precioAsociado)}</span>
                  <div className="admin__actions">
                    <button className="btn btn--ghost btn--s" onClick={() => handleEditar(f)}>
                      Editar
                    </button>
                    <button className="btn btn--outline btn--s" onClick={() => handleEliminar(f)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// ───────────────────────── Página ─────────────────────────
export default function Admin() {
  const auth = useAuth();
  const grupos = auth.user?.profile?.["cognito:groups"];
  const isAdmin = Array.isArray(grupos) && grupos.includes(ADMIN_GROUP);

  const [tab, setTab] = useState("titulos");
  const [state, setState] = useState({ status: "loading", eventos: [] });

  const recargar = useCallback(async () => {
    try {
      const eventos = await getEventos();
      setState({ status: "ok", eventos });
    } catch {
      setState({ status: "error", eventos: [] });
    }
  }, []);

  useEffect(() => {
    if (isAdmin) recargar();
  }, [isAdmin, recargar]);

  if (!isAdmin) {
    return (
      <div className="container empty-state">
        <strong>No tienes permisos de administrador</strong>
        <p>Tu usuario debe pertenecer al grupo {ADMIN_GROUP} de Cognito.</p>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="container empty-state">
        <strong>Cargando…</strong>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="container empty-state">
        <strong>No pudimos cargar la cartelera</strong>
        <button className="btn btn--outline btn--m" style={{ marginTop: 24 }} onClick={recargar}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container admin">
      <div className="page-head">
        <span className="eyebrow">Administración</span>
        <h1 className="page-head__title">Cartelera</h1>
        <p className="page-head__note">Crea, edita y elimina películas, eventos y funciones.</p>
      </div>

      <div className="admin__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "titulos"}
          className={`filter-pill ${tab === "titulos" ? "is-active" : ""}`}
          onClick={() => setTab("titulos")}
        >
          Películas y eventos
        </button>
        <button
          role="tab"
          aria-selected={tab === "funciones"}
          className={`filter-pill ${tab === "funciones" ? "is-active" : ""}`}
          onClick={() => setTab("funciones")}
        >
          Funciones
        </button>
      </div>

      {tab === "titulos" ? (
        <EventosPanel eventos={state.eventos} recargar={recargar} />
      ) : (
        <FuncionesPanel eventos={state.eventos} />
      )}
    </div>
  );
}
