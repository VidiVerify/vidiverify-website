/**
 * Welcher Turnstile-Schlüssel gilt — und warum es dafür eine eigene Datei gibt.
 *
 * Die Wahl entscheidet, ob das Bestellformular geschützt ist oder nur so
 * aussieht. Cloudflares Testschlüssel bestehen immer; einer davon auf der
 * ausgelieferten Seite wäre eine offene Tür mit einem Schild „geschlossen"
 * daran. Cloudflare zeichnet zwar eine Warnzeile ins Widget, aber seit es mit
 * `interaction-only` im Regelfall unsichtbar bleibt, sähe sie niemand.
 *
 * Deshalb steht die Regel hier und nicht im Fenster: als reine Funktion, mit
 * Host und Abfrage als Parametern, damit ein Prüfstand sie prüfen kann, ohne
 * `window.location` zu fälschen (`src/__tests__/turnstile.test.ts`).
 */

/* Der öffentliche Schlüssel des Widgets.
 *
 * Kein Geheimnis — er steht ohnehin im ausgelieferten Seitenquelltext; das
 * Geheimnis ist das Gegenstück im Worker (`TURNSTILE_SECRET`). Ist er leer,
 * nimmt das Formular KEINE Anfragen an, statt sie ungeschützt zu senden.
 */
export const TURNSTILE_SITEKEY = "0x4AAAAAAEuYPC8XeM7ig91Z";

/* Der Testschlüssel von Cloudflare: besteht immer, ist ausdrücklich dafür
 * gedacht. Ohne ihn stünde beim Entwickeln dauerhaft der Hinweis, dass gerade
 * nichts angenommen werden kann — man sähe also nie das Fenster, das der
 * Kunde sieht. Das echte Widget kennt `localhost` nicht als Hostnamen und
 * würde dort ohnehin nicht laden. */
export const TURNSTILE_TEST = "1x00000000000000000000AA";

/* Derselbe Vorrat, aber dieser erzwingt eine Rückfrage. Mit
 * `interaction-only` ist das Widget im Regelfall unsichtbar — was gut ist und
 * zugleich heisst, dass man den einen Fall nie zu Gesicht bekommt, auf den es
 * ankommt. Über `?bot=1` lässt er sich lokal herstellen. */
export const TURNSTILE_TEST_RUECKFRAGE = "3x00000000000000000000FF";

export function turnstileSchluessel(
   host: string = window.location.hostname,
   suche: string = window.location.search,
): string {
   if (host !== "localhost" && host !== "127.0.0.1") return TURNSTILE_SITEKEY;
   return new URLSearchParams(suche).get("bot") === "1"
      ? TURNSTILE_TEST_RUECKFRAGE
      : TURNSTILE_TEST;
}
