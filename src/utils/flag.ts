/**
 * Emoji de bandera a partir de un código ISO 3166-1 alfa-2 ("GT" → 🇬🇹).
 * Devuelve "" si el código no es válido, para poder usarlo directo en un `&&`.
 */
export function flagEmoji(countryCode?: string): string {
	if (!countryCode || !/^[A-Z]{2}$/.test(countryCode)) return '';
	return String.fromCodePoint(...Array.from(countryCode, (letter) => 127397 + letter.charCodeAt(0)));
}
