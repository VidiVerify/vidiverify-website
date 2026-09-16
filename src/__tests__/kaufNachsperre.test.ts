import { afterEach, describe, expect, it, vi } from "vitest";
import { NACHSPERRE_MS, nachsperreGilt, nachsperreSetzen } from "@utils/kaufNachsperre";

/**
 * Die Nachsperre im Browser. Anlass war der Doppelkauf vom 15.09.2026: zwei
 * bezahlte PRO-Käufe für dieselbe VV-ID im Abstand von 2:43 min. Geprüft wird,
 * dass die Sperre dieses Fenster überdeckt, das Upgrade offen lässt und bei
 * einem gesperrten Speicher den Kauf nicht verhindert.
 */
const JETZT = Date.parse("2026-09-16T20:00:00.000Z");
const MINUTE = 60 * 1000;

afterEach(() => {
   window.localStorage.clear();
   vi.restoreAllMocks();
});

describe("kaufNachsperre", () => {
   it("sperrt denselben Typ im beobachteten Abstand von 2:43 min", () => {
      nachsperreSetzen("VV-CJPC5", "pro", JETZT);
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + 2 * MINUTE + 43_000)).toBe(true);
   });

   it("dauert zehn Minuten und nicht nur zwei", () => {
      expect(NACHSPERRE_MS).toBe(10 * MINUTE);
      nachsperreSetzen("VV-CJPC5", "pro", JETZT);
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + 9 * MINUTE)).toBe(true);
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + 10 * MINUTE)).toBe(false);
   });

   it("räumt einen abgelaufenen Eintrag ab", () => {
      nachsperreSetzen("VV-CJPC5", "pro", JETZT);
      nachsperreGilt("VV-CJPC5", "pro", JETZT + 11 * MINUTE);
      expect(window.localStorage.getItem("vv-kauf-nachsperre:VV-CJPC5")).toBeNull();
   });

   it("lässt das Upgrade von PRO auf LIFETIME offen", () => {
      nachsperreSetzen("VV-CJPC5", "pro", JETZT);
      expect(nachsperreGilt("VV-CJPC5", "lifetime", JETZT + MINUTE)).toBe(false);
   });

   it("sperrt nach LIFETIME jeden weiteren Kauf", () => {
      nachsperreSetzen("VV-CJPC5", "lifetime", JETZT);
      expect(nachsperreGilt("VV-CJPC5", "lifetime", JETZT + MINUTE)).toBe(true);
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + MINUTE)).toBe(true);
   });

   it("gilt je VV-ID und unabhängig von der Schreibweise", () => {
      nachsperreSetzen(" vv-cjpc5 ", "pro", JETZT);
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + MINUTE)).toBe(true);
      expect(nachsperreGilt("VV-ANDER", "pro", JETZT + MINUTE)).toBe(false);
   });

   it("speichert keine Personendaten", () => {
      nachsperreSetzen("VV-CJPC5", "pro", JETZT);
      const roh = window.localStorage.getItem("vv-kauf-nachsperre:VV-CJPC5") || "";
      expect(Object.keys(JSON.parse(roh)).sort()).toEqual(["bis", "typ"]);
   });

   it("hält einen Kauf nicht auf, wenn der Speicher gesperrt ist", () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
         throw new Error("gesperrt");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
         throw new Error("gesperrt");
      });
      expect(() => nachsperreSetzen("VV-CJPC5", "pro", JETZT)).not.toThrow();
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT + MINUTE)).toBe(false);
   });

   it("nimmt einen kaputten Eintrag nicht als Sperre", () => {
      window.localStorage.setItem("vv-kauf-nachsperre:VV-CJPC5", "{kein json");
      expect(nachsperreGilt("VV-CJPC5", "pro", JETZT)).toBe(false);
   });
});
