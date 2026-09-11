/**
 * Welche Welt die Seite fragt - und warum das an EINER Stelle steht.
 *
 * Website und Worker liegen im Betrieb auf derselben Zone, deshalb rufen alle
 * Formulare relativ auf (`/api/…`). Beim Entwickeln gibt es aber zwei Worker:
 * den Wirk-Worker auf `vidiverify.de` und den Sandkasten auf `workers.dev`.
 *
 * Die Bestellanfrage fragte bis zum 11.09.2026 immer den Wirk-Worker. Zwei
 * Folgen, beide unangenehm: Ein Rabattcode, der im Sandkasten angelegt wurde,
 * galt dort als unbekannt - er sah kaputt aus und war es nicht
 * (Anwenderbefund). Und jede lokal abgeschickte Testanfrage landete in der
 * WIRKABLAGE, zwischen den echten Bestellungen.
 *
 * Deshalb gilt jetzt: **Auf localhost spricht alles mit dem Sandkasten.** Wer
 * lokal etwas ausprobiert, probiert es im Sandkasten aus - ohne daran denken
 * zu müssen.
 */

/** Der Pfad, über den der Entwicklungsserver den Sandkasten erreicht. */
export const SANDKASTEN_BASIS = "/sandkasten-api";

/** Der Regelfall: derselbe Ursprung wie die Website. */
export const WIRK_BASIS = "/api";

export function apiBasis(host: string = window.location.hostname): string {
   const lokal = host === "localhost" || host === "127.0.0.1"
      || host.endsWith(".local");
   return lokal ? SANDKASTEN_BASIS : WIRK_BASIS;
}
