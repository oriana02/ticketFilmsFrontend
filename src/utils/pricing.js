// Funcion.precioAsociado es el precio General (asientos ESTANDAR).
// El Premium cuesta un 30% más, redondeado a los $100 más cercanos.
export const PREMIUM_MULTIPLIER = 1.3;

export function premiumPrice(basePrice) {
  return Math.round((Number(basePrice) * PREMIUM_MULTIPLIER) / 100) * 100;
}
