/**
 * Ob die Tester-Aktion läuft - aus demselben Manifest, das auch die
 * Anwendung liest (`vidiverify.de/tester/manifest.json`).
 *
 * **Die Regel steht hier und nur hier.** Sie stand bis zum 21.09.2026
 * ausschliesslich im Teaser (`TesterPromo.tsx`); als der Kaufweg sie ein
 * zweites Mal brauchte, wäre daraus eine zweite Fassung geworden - und die
 * eine hätte die Aktion beendet, während die andere sie weiter anbietet.
 *
 * Beendet ist die Aktion, wenn `ended` gesetzt ist ODER ein Enddatum in der
 * Vergangenheit liegt. `active` allein genügt nicht: „ended gewinnt gegen
 * active" ist auch in der Anwendung so entschieden.
 */
import { useEffect, useState } from "react";

export const TESTER_MANIFEST_URL = "/tester/manifest.json";

export interface TesterManifest {
   active?: boolean;
   ended?: boolean;
   end_at?: string | null;
   action_end_at?: string | null;
}

/** Ist die Aktion vorbei? Ohne Manifest lautet die Antwort „nein" - der
 *  Aufrufer entscheidet, was er daraus macht. */
export function aktionBeendet(m: TesterManifest | null): boolean {
   if (!m) return false;
   const endeRoh = m.action_end_at ?? m.end_at ?? null;
   return m.ended === true
      || (endeRoh !== null && Date.parse(endeRoh) < Date.now());
}

/** Läuft die Aktion gerade - also aktiv UND nicht beendet? */
export function aktionLaeuft(m: TesterManifest | null): boolean {
   return !!m && m.active === true && !aktionBeendet(m);
}

/**
 * Der Zustand der Aktion für ein Fenster, das ihn nur erwähnen will.
 *
 * Der Rückfall ist bewusst `false`: Wer keine Auskunft bekommt, verspricht
 * lieber nichts, als eine Aktion zu bewerben, die es nicht mehr gibt.
 */
export function useTesterAktion(aktiv = true): boolean {
   const [laeuft, setLaeuft] = useState(false);

   useEffect(() => {
      if (!aktiv) return;
      let abgemeldet = false;
      fetch(TESTER_MANIFEST_URL, { cache: "no-store" })
         .then((r) => (r.ok ? (r.json() as Promise<TesterManifest>) : null))
         .then((m) => { if (!abgemeldet) setLaeuft(aktionLaeuft(m)); })
         .catch(() => { if (!abgemeldet) setLaeuft(false); });
      return () => { abgemeldet = true; };
   }, [aktiv]);

   return laeuft;
}
