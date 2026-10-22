import { useEffect, useState } from "react";
import { getRegiones } from "../services/carteleraService";

export function useFiltrosCascada() {
  const [regiones, setRegiones] = useState([]);
  const [region, setRegion] = useState("");

  useEffect(() => {
    getRegiones().then(setRegiones).catch(console.error);
  }, []);

  return { regiones, region, setRegion };
}
