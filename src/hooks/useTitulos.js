import { useEffect, useState } from "react";
import { getEventos } from "../services/carteleraService";
import { adaptEvento } from "../services/carteleraAdapter";

let cache = null; // se recarga al refrescar la página

export default function useTitulos() {
  const [state, setState] = useState(
    cache
      ? { ...cache, loading: false, error: null }
      : { movies: [], events: [], loading: true, error: null },
  );

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    getEventos()
      .then((list) => {
        const all = list.map(adaptEvento).filter((t) => t.status !== "inactivo");
        cache = {
          movies: all.filter((t) => t.type === "pelicula"),
          events: all.filter((t) => t.type === "evento"),
        };
        if (!cancelled) setState({ ...cache, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ movies: [], events: [], loading: false, error: "No pudimos cargar la cartelera" });
        }
      });
    return () => { cancelled = true; };
  }, []);

  return state;
}
