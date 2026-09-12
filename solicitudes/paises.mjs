// Mapa país -> código ISO para la bandera de las tarjetas (utils/flag.ts).
// Se acepta el nombre escrito con o sin acentos, en cualquier caso.
import { normalizar } from './csv.mjs';

const PAISES = {
  guatemala: 'GT', mexico: 'MX', colombia: 'CO', peru: 'PE', chile: 'CL',
  panama: 'PA', 'costa rica': 'CR', ecuador: 'EC', argentina: 'AR', brasil: 'BR',
  bolivia: 'BO', uruguay: 'UY', paraguay: 'PY', venezuela: 'VE', honduras: 'HN',
  'el salvador': 'SV', nicaragua: 'NI', 'republica dominicana': 'DO', cuba: 'CU',
  'puerto rico': 'PR', espana: 'ES', 'estados unidos': 'US', canada: 'CA',
};

/** Devuelve { country, countryCode } o null si el país no está en el mapa. */
export function resolverPais(texto) {
  if (!texto) return null;
  const clave = normalizar(texto);
  if (!PAISES[clave]) return null;
  // Se guarda el nombre tal como lo escribieron (es lo que se muestra en el tooltip).
  return { country: texto.trim(), countryCode: PAISES[clave] };
}

export const paisesConocidos = () => Object.keys(PAISES);
