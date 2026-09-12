// Utilidades CSV compartidas por generar-csv.mjs e importar-csv.mjs.
// Pensadas para el viaje de ida y vuelta a Excel: BOM UTF-8 al escribir (si no,
// Excel rompe los acentos) y detección de separador al leer (Excel en español
// suele guardar con ";" en vez de ",").
import fs from 'node:fs';

const BOM = '﻿';

function detectarSeparador(primeraLinea) {
  let comas = 0, puntoComas = 0, dentroDeComillas = false;
  for (const ch of primeraLinea) {
    if (ch === '"') dentroDeComillas = !dentroDeComillas;
    else if (!dentroDeComillas && ch === ',') comas++;
    else if (!dentroDeComillas && ch === ';') puntoComas++;
  }
  return puntoComas > comas ? ';' : ',';
}

/** Parsea texto CSV a array de arrays. Soporta comillas, comas y saltos de línea dentro de celdas. */
export function parsearCSV(texto) {
  texto = texto.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const sep = detectarSeparador(texto.split('\n')[0]);
  const filas = [];
  let fila = [], celda = '', dentroDeComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const ch = texto[i];
    if (dentroDeComillas) {
      if (ch === '"') {
        if (texto[i + 1] === '"') { celda += '"'; i++; }
        else dentroDeComillas = false;
      } else celda += ch;
    } else if (ch === '"') dentroDeComillas = true;
    else if (ch === sep) { fila.push(celda); celda = ''; }
    else if (ch === '\n') { fila.push(celda); filas.push(fila); fila = []; celda = ''; }
    else celda += ch;
  }
  if (celda !== '' || fila.length) { fila.push(celda); filas.push(fila); }
  return filas;
}

/** Lee un CSV y devuelve array de objetos usando la primera fila como encabezados. */
export function leerCSV(ruta) {
  const filas = parsearCSV(fs.readFileSync(ruta, 'utf8'));
  if (!filas.length) return [];
  const encabezados = filas[0].map(h => h.trim());
  return filas.slice(1)
    .filter(f => f.some(c => c.trim() !== ''))   // ignora filas vacías
    .map(f => Object.fromEntries(encabezados.map((h, i) => [h, (f[i] ?? '').trim()])));
}

function escapar(valor) {
  const s = String(valor ?? '');
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Escribe un CSV (con BOM) desde encabezados + array de objetos. */
export function escribirCSV(ruta, encabezados, filas) {
  const lineas = [encabezados.join(',')];
  for (const fila of filas) lineas.push(encabezados.map(h => escapar(fila[h])).join(','));
  fs.writeFileSync(ruta, BOM + lineas.join('\r\n') + '\r\n');
}

/** Normaliza para comparar: sin acentos, minúsculas, sin puntuación. */
export const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Convierte un nombre en id: "Hernán Villavicencio S" -> "hernan-villavicencio-s". */
export const aSlug = (s) => normalizar(s).replace(/ /g, '-');
