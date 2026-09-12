// Carga solicitudes/agenda.csv y solicitudes/ponentes.csv de vuelta a
// src/data/agenda.json y src/data/speakers.json.
//
//   npm run csv:importar          aplica los cambios
//   npm run csv:importar -- --dry solo muestra qué cambiaría
//
// Reglas:
//   · Fila CON id  -> actualiza esa sesión/ponente.
//   · Fila SIN id  -> la crea (el id se genera solo).
//   · La columna QUE_FALTA es informativa; se ignora al importar.
//   · Si una charla trae el nombre de un ponente que ya existe, se enlaza sola
//     (coincidencia exacta de nombre, sin acentos ni mayúsculas).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leerCSV, normalizar, aSlug } from './csv.mjs';
import { resolverPais, paisesConocidos } from './paises.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(AQUI, '..', 'src', 'data');
const DRY = process.argv.includes('--dry');
const leerJSON = (n) => JSON.parse(fs.readFileSync(path.join(DATA, n), 'utf8'));

const TEXTO_AGENDA = fs.readFileSync(path.join(DATA, 'agenda.json'), 'utf8');
const agenda = JSON.parse(TEXTO_AGENDA);

// Las líneas en blanco de agenda.json separan bloques horarios. Se anota cuáles
// las tienen hoy para reproducir el archivo tal cual y que el diff sea mínimo.
const conLineaEnBlanco = new Set();
{
  const lineas = TEXTO_AGENDA.split('\n');
  for (let i = 1; i < lineas.length; i++) {
    const m = lineas[i].match(/"id": "([^"]+)"/);
    if (m && lineas[i - 1].trim() === '') conLineaEnBlanco.add(m[1]);
  }
}
const horariosPrevios = new Set(agenda.map(s => s.startTime));
const salas = leerJSON('agenda-rooms.json');
const tracks = leerJSON('agenda-tracks.json');
const speakers = leerJSON('speakers.json');

const errores = [], cambios = [], avisos = [];
const esPlaceholder = (t) => !t || /^(tema )?por (confirmar|definir)$/i.test(t.trim());

// ------------------------------------------------------------------ ponentes
const ponentesCSV = leerCSV(path.join(AQUI, 'ponentes.csv'));
const dirFotos = path.join(AQUI, '..', 'public', 'images', 'speakers');

for (const [i, fila] of ponentesCSV.entries()) {
  const linea = `ponentes.csv fila ${i + 2}`;
  if (!fila.nombre) {
    if (fila.id_ponente) errores.push(`${linea}: tiene id_ponente pero no nombre`);
    continue;
  }
  const pais = fila.pais ? resolverPais(fila.pais) : null;
  if (fila.pais && !pais) {
    errores.push(`${linea}: país "${fila.pais}" no reconocido. Usa uno de: ${paisesConocidos().join(', ')}`);
    continue;
  }

  let p = fila.id_ponente ? speakers.find(s => s.id === fila.id_ponente) : null;
  if (fila.id_ponente && !p) { errores.push(`${linea}: no existe el ponente "${fila.id_ponente}"`); continue; }

  if (!p) {
    const id = fila.id_ponente || aSlug(fila.nombre);
    if (speakers.some(s => s.id === id)) { errores.push(`${linea}: el ponente "${id}" ya existe; ponlo en su propia fila`); continue; }
    p = { id, country: '', countryCode: '', name: '', role: '', org: '', photo: '', photoSource: '', linkedin: '' };
    speakers.push(p);
    cambios.push(`+ ponente NUEVO: ${id}`);
  }

  const set = (campo, valor) => {
    if (valor === '' || valor === undefined || p[campo] === valor) return;
    cambios.push(`~ ${p.id}.${campo}: "${p[campo]}" -> "${valor}"`);
    p[campo] = valor;
  };
  set('name', fila.nombre);
  set('role', fila.cargo);
  set('org', fila.organizacion);
  set('linkedin', fila.linkedin);
  if (pais) { set('country', pais.country); set('countryCode', pais.countryCode); }

  // Foto: se acepta el nombre de archivo si ya está en public/images/speakers/
  const archivo = fila.foto || `${p.id}.webp`;
  if (fs.existsSync(path.join(dirFotos, archivo))) set('photo', `/images/speakers/${archivo}`);
  else avisos.push(`foto pendiente de ${p.name}: falta public/images/speakers/${archivo}`);
}

// -------------------------------------------------------------------- agenda
const porNombre = new Map(speakers.map(s => [normalizar(s.name), s.id]));
const salaPorNombre = new Map();
for (const s of salas) for (const clave of [s.id, s.name, s.nickname].filter(Boolean)) salaPorNombre.set(normalizar(clave), s.id);
const trackPorNombre = new Map();
for (const t of tracks) for (const clave of [t.id, t.name]) trackPorNombre.set(normalizar(clave), t.id);

const nuevas = [];
for (const [i, fila] of agendaCSVfilas()) {
  const linea = `agenda.csv fila ${i + 2}`;
  const esCharla = normalizar(fila.tipo) !== 'plenaria';

  if (fila.hora_inicio && !/^\d{2}:\d{2}$/.test(fila.hora_inicio)) { errores.push(`${linea}: hora_inicio "${fila.hora_inicio}" debe ser HH:MM`); continue; }
  if (fila.hora_fin && !/^\d{2}:\d{2}$/.test(fila.hora_fin)) { errores.push(`${linea}: hora_fin "${fila.hora_fin}" debe ser HH:MM`); continue; }

  const roomIds = [];
  for (const nombre of (fila.salon || '').split('+').map(x => x.trim()).filter(Boolean)) {
    const id = salaPorNombre.get(normalizar(nombre));
    if (!id) { errores.push(`${linea}: salón "${nombre}" no existe. Usa: ${salas.map(s => s.name).join(', ')}`); continue; }
    roomIds.push(id);
  }
  let trackId = '';
  if (fila.track) {
    trackId = trackPorNombre.get(normalizar(fila.track)) ?? '';
    if (!trackId) { errores.push(`${linea}: track "${fila.track}" no existe. Usa: ${tracks.map(t => t.name).join(', ')}`); continue; }
  }

  let s = fila.id_sesion ? agenda.find(x => x.id === fila.id_sesion) : null;
  if (fila.id_sesion && !s) { errores.push(`${linea}: no existe la sesión "${fila.id_sesion}"`); continue; }

  if (!s) {
    if (!fila.hora_inicio) { errores.push(`${linea}: una sesión nueva necesita hora_inicio`); continue; }
    const base = esCharla && roomIds.length ? `${fila.hora_inicio.replace(':', '')}-${roomIds.join('-')}`
                                           : `${fila.hora_inicio.replace(':', '')}-${aSlug(fila.titulo).slice(0, 24) || 'sesion'}`;
    let id = base, n = 2;
    while (agenda.some(x => x.id === id) || nuevas.some(x => x.id === id)) id = `${base}-${n++}`;
    s = { id, type: esCharla ? 'talk' : 'general', startTime: '', endTime: '', title: '',
          speakerName: '', speakerOrg: '', speakerId: '', roomIds: [], track: '', notes: '' };
    nuevas.push(s);
    cambios.push(`+ sesión NUEVA: ${id}`);
  }

  const set = (campo, valor) => {
    if (valor === '' || valor === undefined) return;
    if (JSON.stringify(s[campo]) === JSON.stringify(valor)) return;
    cambios.push(`~ ${s.id}.${campo}: ${JSON.stringify(s[campo])} -> ${JSON.stringify(valor)}`);
    s[campo] = valor;
  };
  set('type', esCharla ? 'talk' : 'general');
  set('startTime', fila.hora_inicio);
  set('endTime', fila.hora_fin);
  set('title', fila.titulo);
  set('speakerName', fila.ponente);
  set('speakerOrg', fila.organizacion);
  set('track', trackId);
  set('notes', fila.notas);
  if (roomIds.length) set('roomIds', roomIds);

  // Vincular ponente: id explícito si viene; si no, coincidencia exacta de nombre.
  if (fila.id_ponente) {
    if (!speakers.some(x => x.id === fila.id_ponente)) errores.push(`${linea}: id_ponente "${fila.id_ponente}" no existe en ponentes.csv ni en speakers.json`);
    else set('speakerId', fila.id_ponente);
  } else if (!s.speakerId && s.speakerName && !esPlaceholder(s.speakerName)) {
    const id = porNombre.get(normalizar(s.speakerName));
    if (id) set('speakerId', id);
    else if (s.type === 'talk') avisos.push(`"${s.speakerName}" (${s.id}) no está en ponentes.csv: la tarjeta saldrá con iniciales y sin bandera`);
  }

  // La organización del ponente rellena la de la charla si quedó vacía.
  if (!s.speakerOrg && s.speakerId) {
    const p = speakers.find(x => x.id === s.speakerId);
    if (p?.org) set('speakerOrg', p.org);
  }
}

function* agendaCSVfilas() {
  const filas = leerCSV(path.join(AQUI, 'agenda.csv'));
  for (const [i, f] of filas.entries()) {
    if (!f.id_sesion && !f.titulo && !f.ponente) continue;  // fila plantilla vacía
    yield [i, f];
  }
}

// Las sesiones nuevas entran al final de su bloque horario.
for (const s of nuevas) {
  let pos = agenda.map(x => x.startTime).lastIndexOf(s.startTime);
  if (pos === -1) { pos = agenda.findIndex(x => x.startTime > s.startTime) - 1; if (pos < -1) pos = agenda.length - 1; }
  agenda.splice(pos + 1, 0, s);
}

// ------------------------------------------------------------------ escritura
if (errores.length) {
  console.error('\n✖ No se importó nada. Corrige esto en el CSV y vuelve a correrlo:\n');
  errores.forEach(e => console.error('  · ' + e));
  process.exit(1);
}

const ORDEN = ['id', 'type', 'startTime', 'endTime', 'title', 'speakerName', 'speakerOrg', 'speakerId', 'roomIds', 'track', 'notes'];
const comoLinea = (o) => '  { ' + ORDEN.map(k => `"${k}": ${Array.isArray(o[k])
  ? '[' + o[k].map(x => JSON.stringify(x)).join(', ') + ']' : JSON.stringify(o[k] ?? '')}`).join(', ') + ' }';

const lineas = ['['];
agenda.forEach((s, i) => {
  // Línea en blanco donde ya la había, y delante de un bloque horario nuevo.
  const abreBloqueNuevo = !horariosPrevios.has(s.startTime) && agenda[i - 1]?.startTime !== s.startTime;
  if (i > 0 && (conLineaEnBlanco.has(s.id) || abreBloqueNuevo)) lineas.push('');
  lineas.push(comoLinea(s) + (i === agenda.length - 1 ? '' : ','));
});
lineas.push(']', '');

if (DRY) {
  console.log(cambios.length ? '\nCambios que se aplicarían:\n' : '\nSin cambios.');
} else {
  // Solo se toca el archivo si su contenido cambió, para no ensuciar el diff.
  const escribirSiCambia = (archivo, contenido) => {
    const ruta = path.join(DATA, archivo);
    if (fs.readFileSync(ruta, 'utf8') === contenido) return;
    fs.writeFileSync(ruta, contenido);
    console.log(`  (escrito ${archivo})`);
  };
  escribirSiCambia('agenda.json', lineas.join('\n'));
  escribirSiCambia('speakers.json', JSON.stringify(speakers, null, 2) + '\n');
  console.log(cambios.length ? '\nCambios aplicados:\n' : '\nSin cambios.');
}
cambios.forEach(c => console.log('  ' + c));
if (avisos.length) {
  console.log('\nPendientes (no bloquean, la página no se rompe):');
  [...new Set(avisos)].forEach(a => console.log('  · ' + a));
}
console.log(`\n${agenda.length} sesiones · ${speakers.length} ponentes${DRY ? '  (dry-run, no se escribió nada)' : ''}`);
