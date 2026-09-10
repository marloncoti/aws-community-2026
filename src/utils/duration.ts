/** Minutos entre dos horas "HH:MM". Devuelve null si falta alguna o el rango no es válido. */
export function durationMinutes(start: string, end: string): number | null {
	if (!start || !end) return null;

	const [startHour, startMin] = start.split(':').map(Number);
	const [endHour, endMin] = end.split(':').map(Number);
	if ([startHour, startMin, endHour, endMin].some(Number.isNaN)) return null;

	const mins = endHour * 60 + endMin - (startHour * 60 + startMin);
	return mins > 0 ? mins : null;
}

/** Etiqueta corta en versalitas para la duración: "50 MIN", "1 H 45 MIN", "5 H". */
export function durationLabel(start: string, end: string): string {
	const mins = durationMinutes(start, end);
	if (mins === null) return '';
	if (mins < 60) return `${mins} MIN`;

	const hours = Math.floor(mins / 60);
	const rest = mins % 60;
	return rest === 0 ? `${hours} H` : `${hours} H ${rest} MIN`;
}
