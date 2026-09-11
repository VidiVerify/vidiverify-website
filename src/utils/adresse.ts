/**
 * Gerätekennung und Programmversion aus der Adresse - einmal gelesen, danach
 * aus der Adresse entfernt.
 *
 * Die Anwendung führt mit `/pro?vvid=…&ver=…` und `/lizenz-anfrage?vvid=…`
 * hierher; ohne die Kennung liesse sich ein Kauf keiner Installation zuordnen,
 * sie muss also mitkommen. Sie soll aber nicht **stehen bleiben**: In der
 * Adresse landet sie im Browserverlauf, auf jedem Bildschirmfoto und in jedem
 * Link, den ein Kunde weiterreicht - und wer eine VV-ID kennt, kann bei der
 * Abholstelle das Token dazu anfordern, in dem die Emailadresse des Kunden
 * steht (Sicherheitsprüfung 11.09.2026, Befund 3).
 *
 * Bis dahin wurde die Adresse erst beim SCHLIESSEN der Fenster aufgeräumt -
 * also erst, nachdem der Kunde das Formular ausgefüllt und den Bezahlvorgang
 * durchlaufen hatte. Genau in dieser Zeit war sie sichtbar.
 *
 * Deshalb zwei getrennte Schritte: `kennungLesen()` liest (und merkt sich das
 * Ergebnis für die ganze Sitzung), `kennungAufraeumen()` entfernt die beiden
 * Parameter. Das Merken ist die Voraussetzung dafür, dass das Aufräumen
 * überhaupt gefahrlos ist: Wer danach liest, bekommt weiterhin die Werte.
 */

export type Kennung = {
   /** `VV-XXXXX`, oder leer, wenn die Adresse keine trug. */
   vvid: string;
   /** Programmversion der aufrufenden Installation, oder leer. */
   version: string;
};

let gemerkt: Kennung | null = null;

/** Liest Kennung und Version. Beim ersten Aufruf aus der Adresse, danach aus
 *  dem Gedächtnis - auch dann, wenn die Adresse längst aufgeräumt ist. */
export function kennungLesen(): Kennung {
   if (gemerkt) return gemerkt;
   const parameter = new URLSearchParams(window.location.search);
   gemerkt = {
      vvid: (parameter.get("vvid") || "").trim().toUpperCase(),
      version: (parameter.get("ver") || "").trim(),
   };
   return gemerkt;
}

/** Entfernt `vvid` und `ver` aus der Adresse, ohne die Seite neu zu laden.
 *
 *  Entfernt werden **nur diese beiden**: Andere Parameter gehören anderen
 *  Stellen (`promo` der Testeraktion, `bot` der Turnstile-Probe), und wer die
 *  ganze Abfrage wegwirft, nimmt sie mit. Der Anker bleibt ebenfalls stehen -
 *  an ihm hängt, welches Fenster offen ist. */
export function kennungAufraeumen(): void {
   const parameter = new URLSearchParams(window.location.search);
   if (!parameter.has("vvid") && !parameter.has("ver")) return;
   kennungLesen();            // erst sichern, dann entfernen
   parameter.delete("vvid");
   parameter.delete("ver");
   const rest = parameter.toString();
   try {
      window.history.replaceState(
         null, "",
         window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash);
   } catch {
      // Ein Browser, der das verweigert, ist kein Grund, den Kaufweg
      // anzuhalten. Die Kennung steht dann weiterhin in der Adresse - so wie
      // vor dieser Änderung auch.
   }
}
