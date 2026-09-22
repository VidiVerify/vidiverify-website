/**
 * Wann die Tester-Aktion als beendet gilt.
 *
 * Die Regel lag bis zum 21.09.2026 nur im Teaser. Als der Kaufweg sie ein
 * zweites Mal brauchte - er nennt die Aktion als kostenlosen Weg für Länder,
 * aus denen der Zahlungsanbieter nicht annimmt - wurde sie nach
 * `utils/testerAktion` gezogen. Diese Probe hält beide Seiten an derselben
 * Auskunft fest.
 */
import { describe, it, expect } from "vitest";
import { aktionBeendet, aktionLaeuft } from "@utils/testerAktion";

const GESTERN = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const MORGEN = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

describe("testerAktion", () => {
   it("ended gewinnt gegen active", () => {
      // So steht es auch in der Anwendung: Der Schalter beendet, egal was
      // daneben gesetzt ist.
      expect(aktionLaeuft({ active: true, ended: true })).toBe(false);
      expect(aktionBeendet({ active: true, ended: true })).toBe(true);
   });

   it("ein Enddatum in der Vergangenheit beendet, eines in der Zukunft nicht", () => {
      expect(aktionLaeuft({ active: true, end_at: GESTERN })).toBe(false);
      expect(aktionLaeuft({ active: true, end_at: MORGEN })).toBe(true);
      // Die Website schreibt das Datum mal so, mal so - beide Namen gelten.
      expect(aktionLaeuft({ active: true, action_end_at: GESTERN })).toBe(false);
   });

   it("ohne Datum und ohne Schalter läuft sie, solange active steht", () => {
      // Der Stand vom 21.09.2026: Das Manifest trägt weder `ended` noch ein
      // Enddatum, die Anmeldefrist steht allein auf der Website.
      expect(aktionLaeuft({ active: true })).toBe(true);
      expect(aktionLaeuft({ active: false })).toBe(false);
   });

   it("ohne Manifest wird nichts versprochen", () => {
      // Wer keine Auskunft bekommt, wirbt lieber nicht mit einer Aktion, die
      // es vielleicht nicht mehr gibt.
      expect(aktionLaeuft(null)).toBe(false);
      expect(aktionBeendet(null)).toBe(false);
   });
});
