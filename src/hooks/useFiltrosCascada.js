import { useEffect, useState } from "react";
import {
  getRegiones,
  getCiudades,
  getSedes,
} from "../services/carteleraService";

export function useFiltrosCascada() {
  const [regiones, setRegiones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [region, setRegion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [sede, setSede] = useState("");

  // Cargar regiones al montar
  useEffect(() => {
    getRegiones().then(setRegiones).catch(console.error);
  }, []);

  // Al cambiar región → recargar ciudades y resetear ciudad/sede
  useEffect(() => {
    setCiudad("");
    setSede("");
    setSedes([]);
    if (region) {
      getCiudades(region).then(setCiudades).catch(console.error);
    } else {
      setCiudades([]);
    }
  }, [region]);

  // Al cambiar ciudad → recargar sedes y resetear sede
  useEffect(() => {
    setSede("");
    if (ciudad) {
      getSedes(ciudad).then(setSedes).catch(console.error);
    } else {
      setSedes([]);
    }
  }, [ciudad]);

  return {
    regiones,
    ciudades,
    sedes,
    region,
    setRegion,
    ciudad,
    setCiudad,
    sede,
    setSede,
  };
}
