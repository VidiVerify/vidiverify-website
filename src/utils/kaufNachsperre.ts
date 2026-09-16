/**
 * Die Nachsperre im Browser: zehn Minuten nach einer Zahlung kein zweiter
 * Kauf derselben Lizenz für dieselbe VV-ID.
 *
 * Der Worker sperrt ebenso, und zwar für jedes Gerät (`NACHSPERRE_MS` in
 * `worker/src/index.js`, Source-Repo). Diese Sperre ist die schnelle erste
 * Hürde davor: Sie greift in jedem Tab dieses Browsers, ohne dass eine
 * Anfrage rausgeht, und hängt an keiner Ablage, die erst nach einer Minute
 * überall sichtbar ist. Anlass war der Doppelkauf vom 15.09.2026 - zwei
 * bezahlte PRO-Käufe für dieselbe VV-ID im Abstand von 2:43 min.
 *
 * **Warum `localStorage` und nicht `sessionStorage`:** Der Fall sind zwei
 * Tabs, und `sessionStorage` gilt je Tab. Gespeichert werden nur VV-ID,
 * Lizenztyp und Ablaufzeit - keine Anschrift, keine Emailadresse -, und ein
 * abgelaufener Eintrag wird beim nächsten Lesen entfernt.
 *
 * **Die VV-ID ist der Schlüssel, nicht die IP-Adresse.** Hinter einem
 * Büroanschluss teilen sich viele eine Adresse, am Handy wechselt sie ständig.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-16_Auffang-Reiter-und-Metadatenlauf.md
 */

export const NACHSPERRE_MS = 10 * 60 * 1000;

const PRAEFIX = "vv-kauf-nachsperre:";

type Typ = "pro" | "lifetime";

interface Eintrag {
   typ: Typ;
   bis: number;
}

function speicher(): Storage | null {
   try {
      return typeof window !== "undefined" ? window.localStorage : null;
   } catch {
      // Gesperrter Speicher (privates Fenster, Richtlinie): Dann sperrt eben
      // nur der Worker. Ein Kauf darf daran nicht scheitern.
      return null;
   }
}

function schluessel(vvid: string): string {
   return PRAEFIX + vvid.trim().toUpperCase();
}

/** Nach einer abgeschlossenen Zahlung aufrufen. */
export function nachsperreSetzen(vvid: string, typ: Typ, jetzt = Date.now()): void {
   const ablage = speicher();
   if (!ablage || !vvid.trim()) return;
   const eintrag: Eintrag = { typ, bis: jetzt + NACHSPERRE_MS };
   try {
      ablage.setItem(schluessel(vvid), JSON.stringify(eintrag));
   } catch {
      // Voller oder gesperrter Speicher - siehe oben.
   }
}

/**
 * Ist ein Kauf von `wunsch` für diese VV-ID gerade gesperrt?
 *
 * Offen bleibt das Upgrade: Wer eben PRO gekauft hat, darf LIFETIME kaufen.
 * Ob PRO dafür schon verbucht ist, prüft der Worker - der Browser weiss es
 * nicht.
 */
export function nachsperreGilt(vvid: string, wunsch: Typ, jetzt = Date.now()): boolean {
   const ablage = speicher();
   if (!ablage || !vvid.trim()) return false;
   let eintrag: Eintrag | null = null;
   try {
      const roh = ablage.getItem(schluessel(vvid));
      eintrag = roh ? (JSON.parse(roh) as Eintrag) : null;
   } catch {
      eintrag = null;
   }
   if (!eintrag || typeof eintrag.bis !== "number") return false;
   if (eintrag.bis <= jetzt) {
      try {
         ablage.removeItem(schluessel(vvid));
      } catch {
         // Bleibt er liegen, ist er beim nächsten Mal wieder abgelaufen.
      }
      return false;
   }
   return !(eintrag.typ === "pro" && wunsch === "lifetime");
}
