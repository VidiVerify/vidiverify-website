/**
 * Passt ein abgeholtes Token zu dem, was eben gekauft wurde?
 *
 * Die Erfolgsansicht fragt nach der Zahlung so lange bei der Abholstelle nach,
 * bis dort ein Token liegt. Beim Upgrade liegt dort aber schon eines: das alte
 * PRO-Token. Die erste Antwort kam deshalb sofort mit dem alten Schlüssel, und
 * die Seite zeigte ihn als die eben bezahlte LIFETIME-Lizenz (Durchsicht
 * 18.09.2026, Befund K1). Fertig ist der Kauf erst, wenn das Token den
 * gekauften Typ trägt.
 *
 * Geprüft wird nur der Typ, nicht die Signatur: Ob ein Token gilt, entscheidet
 * allein die Anwendung. Hier geht es nur um die Frage, ob es schon das neue ist.
 *
 * Aufbau des Tokens (Vertrag mit `license_core.py` und dem Worker):
 * `VV1.<Nutzlast base64url>.<Signatur base64url>`, die Nutzlast ist JSON mit
 * `license_type`.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-18_Kaufweg-Durchsicht-und-Wirkuebergabe.md
 */

/** Der Lizenztyp aus der Nutzlast - oder "", wenn sie sich nicht lesen lässt. */
export function tokenTyp(token: string): string {
   const teile = String(token || "").trim().split(".");
   if (teile.length !== 3 || teile[0] !== "VV1") return "";
   try {
      const b64 = teile[1].replace(/-/g, "+").replace(/_/g, "/");
      const roh = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
      // Die Nutzlast ist UTF-8 (Umlaute in der Emailadresse), `atob` liefert
      // Bytes als Zeichen - erst dekodieren, dann lesen.
      const text = new TextDecoder().decode(
         Uint8Array.from(roh, (z) => z.charCodeAt(0)));
      const daten = JSON.parse(text) as { license_type?: unknown };
      return typeof daten.license_type === "string"
         ? daten.license_type.toLowerCase() : "";
   } catch {
      return "";
   }
}

/**
 * Trägt das Token den gekauften Typ?
 *
 * Ein unlesbares Token passt NICHT. Dann wartet die Seite weiter und meldet
 * nach Ablauf „dauert noch" - die Anwendung holt die Lizenz ohnehin selbst.
 * Ein falscher Schlüssel in der Erfolgsansicht wäre die schlechtere Auskunft.
 */
export function tokenPasst(token: string, gekauft: string): boolean {
   const typ = tokenTyp(token);
   return typ !== "" && typ === gekauft.toLowerCase();
}
