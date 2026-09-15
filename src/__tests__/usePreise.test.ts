/**
 * Ein eingelöster Rabattcode muss sich zurücknehmen lassen.
 *
 * Anwenderbefund 14.09.2026: Nach „Einlösen" blieb der Nachlass stehen, auch
 * wenn der Code gelöscht oder ersetzt wurde. Geprüft wird hier der Hook, auf
 * dem Kaufseite und Bestellanfrage beide stehen.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { usePreise } from "@utils/usePreise";

const LISTE = { pro: 2990, lifetime: 9990 };
const RABATT = {
   preise: { pro: 2392, lifetime: 7992 },
   listenpreise: LISTE,
   rabatt: { code: "J6EPENWP", art: "prozent", wert: 20, gilt_fuer: ["pro", "lifetime"], bemerkung: null },
};

function antwort(daten: unknown) {
   return Promise.resolve({ ok: true, json: () => Promise.resolve(daten) } as Response);
}

afterEach(() => vi.restoreAllMocks());

describe("usePreise", () => {
   it("verwerfen nimmt den Nachlass zurück und zeigt die Listenpreise", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementation((adresse) =>
         antwort(String(adresse).includes("code=")
            ? RABATT : { preise: LISTE, listenpreise: LISTE }));

      const { result } = renderHook(() => usePreise(true, "/api"));
      await waitFor(() => expect(result.current.laeuft).toBe(false));

      await act(() => result.current.pruefen("J6EPENWP"));
      expect(result.current.rabatt?.code).toBe("J6EPENWP");
      expect(result.current.preise.pro).toBe(2392);

      act(() => result.current.verwerfen());
      expect(result.current.rabatt).toBeNull();
      expect(result.current.preise).toEqual(LISTE);
   });

   it("eine noch laufende Prüfung setzt den Nachlass nach dem Verwerfen nicht wieder ein", async () => {
      let freigeben: (wert: Response) => void = () => {};
      vi.spyOn(globalThis, "fetch").mockImplementation((adresse) =>
         String(adresse).includes("code=")
            ? new Promise<Response>((ok) => { freigeben = ok; })
            : antwort({ preise: LISTE, listenpreise: LISTE }));

      const { result } = renderHook(() => usePreise(true, "/api"));
      await waitFor(() => expect(result.current.laeuft).toBe(false));

      let pruefung: Promise<void> = Promise.resolve();
      act(() => { pruefung = result.current.pruefen("J6EPENWP"); });
      act(() => result.current.verwerfen());
      await act(async () => {
         freigeben({ ok: true, json: () => Promise.resolve(RABATT) } as Response);
         await pruefung;
      });

      expect(result.current.rabatt).toBeNull();
      expect(result.current.preise).toEqual(LISTE);
   });

   it("ein hängender Preisabruf sperrt die Codeprüfung nicht", async () => {
      // Codex-Review Runde 2, 16.09.2026: `laeuft` umfasst auch den Abruf
      // beim Öffnen. Hängt der, stand der Kaufknopf dauerhaft auf „zu",
      // seit er auf diesen Zustand wartet. `codeLaeuft` trennt beides.
      vi.spyOn(globalThis, "fetch").mockImplementation(() => new Promise(() => {}));
      const { result } = renderHook(() => usePreise(true, "/api"));
      await waitFor(() => expect(result.current.laeuft).toBe(true));
      expect(result.current.codeLaeuft).toBe(false);
   });

   it("eine verspätete Antwort für einen alten Code wird nicht übernommen", async () => {
      // Derselbe Review: Feld während der Prüfung geändert, dann trifft die
      // Antwort für den ALTEN Code ein. Vorher zeigten die Kacheln danach
      // einen Nachlass, den der Kauf nicht mitschickte.
      let loesen: ((w: unknown) => void) | null = null;
      vi.spyOn(globalThis, "fetch").mockImplementation((adresse) =>
         String(adresse).includes("code=ALT")
            ? new Promise((f) => { loesen = () => f({
                 ok: true, json: () => Promise.resolve(RABATT),
              } as Response); })
            : antwort({ preise: LISTE, listenpreise: LISTE }));
      const { result } = renderHook(() => usePreise(true, "/api"));
      await waitFor(() => expect(result.current.laeuft).toBe(false));
      act(() => { void result.current.pruefen("ALT"); });
      await waitFor(() => expect(result.current.codeLaeuft).toBe(true));
      // Der Kunde tippt weiter - das Formular verwirft die laufende Prüfung.
      act(() => result.current.verwerfen());
      await act(async () => { loesen?.(null); });
      expect(result.current.rabatt).toBeNull();
      expect(result.current.preise).toEqual(LISTE);
   });
});
