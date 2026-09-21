import { useEffect, useState } from "react";
import { getSalas } from "../services/asientosService";

let cache = null;

export default function useSalas() {
  const [salas, setSalas] = useState(cache ?? []);

  useEffect(() => {
    if (cache) return;
    let cancelled = false;
    getSalas()
      .then((list) => {
        cache = list;
        if (!cancelled) setSalas(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return salas;
}
