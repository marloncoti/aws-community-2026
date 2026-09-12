// Genera solicitudes/agenda.csv y solicitudes/ponentes.csv a partir del estado
// actual de src/data/*.json, marcando en la primera columna qué falta de cada
// fila. Se puede volver a correr en cualquier momento: siempre refleja el JSON.
//
//   npm run csv:generar
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { escribirCSV, normalizar } from './csv.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(AQUI, '..', 'src', 'data');
const leerJSON = (n) => JSON.parse(fs.readFileSync(path.join(DATA, n), 'utf8'));

const agenda = leerJSON('agenda.json');
const salas = leerJSON('agenda-rooms.json');
const tracks = leerJSON('agenda-tracks.json');
const speakers = leerJSON('speakers.json');
const organizers = leerJSON('organizers.json');

const personas = Object.fromEntries([...organizers, ...speakers].map(p => [p.id, p]));
const salaPorId = Object.fromEntries(salas.map(s => [s.id, s]));
const trackPorId = Object.fromEntries(tracks.map(t => [t.id, t]));

const esPlaceholder = (t) => !t || /^(tema )?por (confirmar|definir)$/i.test(t.trim());

// ---------------------------------------------------------------- agenda.csv
const COLS_AGENDA = ['QUE_FALTA', 'id_sesion', 'tipo', 'hora_inicio', 'hora_fin',
  'salon', 'titulo', 'ponente', 'id_ponente', 'organizacion', 'track', 'notas'];

const filasAgenda = agenda.map(s => {
  const falta = [];
  if (esPlaceholder(s.title)) falta.push('título');
  if (s.type === 'talk') {
    if (esPlaceholder(s.speakerName)) falta.push('ponente');
    else if (!s.speakerId) falta.push('vincular ponente (queda sin foto ni bandera)');
    if (!s.speakerOrg) falta.push('organización');
    if (!s.track) falta.push('track');
  }
  return {
    QUE_FALTA: falta.length ? 'FALTA: ' + falta.join(', ') : 'OK',
    id_sesion: s.id,
    tipo: s.type === 'general' ? 'plenaria' : 'charla',
    hora_inicio: s.startTime,
    hora_fin: s.endTime,
    salon: s.roomIds.map(id => salaPorId[id]?.name ?? id).join(' + '),
    titulo: esPlaceholder(s.title) ? '' : s.title,
    ponente: esPlaceholder(s.speakerName) ? '' : s.speakerName,
    id_ponente: s.speakerId,
    organizacion: s.speakerOrg,
    track: trackPorId[s.track]?.name ?? s.track,
    notas: s.notes,
  };
});

for (let i = 0; i < 3; i++) {
  filasAgenda.push({
    QUE_FALTA: i === 0 ? 'NUEVA — llena esta fila para agregar una sesión (deja id_sesion vacío)' : '',
    id_sesion: '', tipo: 'charla', hora_inicio: '', hora_fin: '', salon: '',
    titulo: '', ponente: '', id_ponente: '', organizacion: '', track: '', notas: '',
  });
}

// -------------------------------------------------------------- ponentes.csv
const COLS_PONENTES = ['QUE_FALTA', 'id_ponente', 'nombre', 'cargo', 'organizacion',
  'pais', 'linkedin', 'foto'];

const dirFotos = path.join(AQUI, '..', 'public', 'images', 'speakers');
const enAgenda = new Set(agenda.map(s => s.speakerId).filter(Boolean));

const filasPonentes = speakers.map(p => {
  const falta = [];
  if (!p.role) falta.push('cargo');
  if (!p.org) falta.push('organización');
  if (!p.countryCode) falta.push('país');
  if (!p.linkedin) falta.push('LinkedIn');
  const archivo = p.photo ? path.basename(p.photo) : '';
  if (!archivo || !fs.existsSync(path.join(dirFotos, archivo))) falta.push('foto');
  if (!enAgenda.has(p.id)) falta.push('no tiene charla asignada en la agenda');
  return {
    QUE_FALTA: falta.length ? 'FALTA: ' + falta.join(', ') : 'OK',
    id_ponente: p.id, nombre: p.name, cargo: p.role, organizacion: p.org,
    pais: p.country, linkedin: p.linkedin, foto: archivo,
  };
});

for (let i = 0; i < 5; i++) {
  filasPonentes.push({
    QUE_FALTA: i === 0 ? 'NUEVO — llena esta fila para agregar un ponente (deja id_ponente vacío)' : '',
    id_ponente: '', nombre: '', cargo: '', organizacion: '', pais: '', linkedin: '', foto: '',
  });
}

escribirCSV(path.join(AQUI, 'agenda.csv'), COLS_AGENDA, filasAgenda);
escribirCSV(path.join(AQUI, 'ponentes.csv'), COLS_PONENTES, filasPonentes);

const pendAgenda = filasAgenda.filter(f => f.QUE_FALTA.startsWith('FALTA')).length;
const pendPonentes = filasPonentes.filter(f => f.QUE_FALTA.startsWith('FALTA')).length;
console.log(`agenda.csv   — ${agenda.length} sesiones (${pendAgenda} con datos pendientes)`);
console.log(`ponentes.csv — ${speakers.length} ponentes (${pendPonentes} con datos pendientes)`);
console.log(`\nSalones válidos: ${salas.map(s => s.name).join(' | ')}`);
console.log(`Tracks válidos:  ${tracks.map(t => t.name).join(' | ')}`);
