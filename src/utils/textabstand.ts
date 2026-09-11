/**
 * Der Abstand zweier Zeichenketten: wie viele Tippfehler sie trennen.
 *
 * Nach Damerau-Levenshtein, nicht nach Levenshtein - der Unterschied ist genau
 * der Fall, um den es hier geht: **Zwei vertauschte Nachbarzeichen sind EIN
 * Tippfehler**, nicht zwei. `Schwiez` statt `Schweiz`, `Deutshcland` statt
 * `Deutschland`, `gmial.com` statt `gmail.com` - das ist immer dieselbe
 * verrutschte Fingerbewegung.
 *
 * Ohne diese Regel bräuchte jeder solche Vertipper den Grenzwert 2, und damit
 * gälte auch `gmx.de` als Vorschlag für `gmx.at` - zwei Postfächer, die es
 * beide gibt.
 *
 * An zwei Stellen gebraucht (Emaildomain und Land); als zwei Kopien wären es
 * zwei Fassungen derselben Rechnung.
 */
export function abstand(a: string, b: string): number {
   const n = a.length;
   const m = b.length;
   if (!n) return m;
   if (!m) return n;

   // Volle Matrix statt zweier Zeilen: Die Vertauschung braucht den Blick auf
   // die vorletzte Zeile, und die verglichenen Wörter sind kurz.
   const d: number[][] = Array.from({ length: n + 1 },
      (_, i) => Array.from({ length: m + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));

   for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
         const kosten = a[i - 1] === b[j - 1] ? 0 : 1;
         d[i][j] = Math.min(
            d[i - 1][j] + 1,            // löschen
            d[i][j - 1] + 1,            // einfügen
            d[i - 1][j - 1] + kosten,   // ersetzen
         );
         if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);   // vertauschen
         }
      }
   }
   return d[n][m];
}

export default abstand;
