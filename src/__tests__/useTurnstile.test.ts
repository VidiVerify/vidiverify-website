/**
 * Die Sicherheitsabfrage wartet auf ein fehlendes Token, statt es zu vermissen.
 *
 * Anwenderbefund VM-Probe 14.09.2026: Nach einem Neuladen stand „Bitte die
 * Sicherheitsabfrage darüber bestätigen" - über einem unsichtbaren Widget.
 * Geprüft wird `useTurnstile` gegen ein nachgebautes Turnstile, das sich
 * steuern lässt wie das echte: Token liefern, Rückfrage stellen, schweigen.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTurnstile } from "@utils/useTurnstile";

type Optionen = Record<string, (arg?: string) => void>;

let optionen: Optionen = {};
let entfernt: string[] = [];
let zurueckgesetzt = 0;

function turnstileNachbauen() {
   let zaehler = 0;
   window.turnstile = {
      render: (_el: HTMLElement, o: Record<string, unknown>) => {
         optionen = o as unknown as Optionen;
         zaehler += 1;
         return `widget-${zaehler}`;
      },
      reset: () => { zurueckgesetzt += 1; },
      remove: (id: string) => { entfernt.push(id); },
   };
}

function mitRahmen() {
   const hook = renderHook(
      ({ offen }) => {
         const t = useTurnstile(offen, "1x00000000000000000000AA", "de");
         // Der Rahmen muss stehen, bevor gezeichnet wird - wie im Formular.
         if (!t.rahmenRef.current) {
            (t.rahmenRef as { current: HTMLDivElement | null }).current =
               document.createElement("div");
         }
         return t;
      },
      { initialProps: { offen: false } });
   hook.rerender({ offen: true });
   return hook;
}

beforeEach(() => {
   vi.useFakeTimers();
   optionen = {};
   entfernt = [];
   zurueckgesetzt = 0;
   turnstileNachbauen();
   // jsdom kennt kein Scrollen.
   Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
   vi.useRealTimers();
   delete window.turnstile;
});

describe("useTurnstile", () => {
   it("liefert ein vorhandenes Token sofort", async () => {
      const { result } = mitRahmen();
      act(() => optionen.callback("tok-1"));
      await expect(result.current.tokenHolen()).resolves.toEqual({ token: "tok-1" });
   });

   it("wartet auf ein Token, das erst nach dem Klick kommt", async () => {
      const { result } = mitRahmen();
      const warten = result.current.tokenHolen();
      act(() => { vi.advanceTimersByTime(1500); });
      act(() => optionen.callback("tok-spaet"));
      await expect(warten).resolves.toEqual({ token: "tok-spaet" });
   });

   it("stösst eine hängende Prüfung einmal neu an und meldet Schweigen erst am Ende", async () => {
      const { result } = mitRahmen();
      const warten = result.current.tokenHolen();
      act(() => { vi.advanceTimersByTime(3100); });
      expect(zurueckgesetzt).toBe(1);
      act(() => { vi.advanceTimersByTime(9000); });
      await expect(warten).resolves.toEqual({ token: "", grund: "stumm" });
   });

   it("unterscheidet eine offene Rückfrage vom Schweigen und stört sie nicht", async () => {
      const { result } = mitRahmen();
      const warten = result.current.tokenHolen();
      act(() => optionen["before-interactive-callback"]());
      act(() => { vi.advanceTimersByTime(12100); });
      expect(zurueckgesetzt).toBe(0);
      // Wer wartet, bekommt die Rückfrage zu sehen.
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      await expect(warten).resolves.toEqual({ token: "", grund: "rueckfrage" });
   });

   it("meldet eine bereits offene Rückfrage sofort, ohne zwölf Sekunden zu warten", async () => {
      // Anwenderbefund 15.09.2026: Mit `?bot=1` steht die Rückfrage schon beim
      // Öffnen im Fenster. Der Klick wartete danach die volle Frist ab und
      // meldete dann dasselbe - fünfzehn Sekunden hängende Schaltfläche.
      const { result } = mitRahmen();
      act(() => optionen["before-interactive-callback"]());
      const warten = result.current.tokenHolen();
      // KEIN Vorspulen: Die Antwort muss ohne Zeitablauf da sein.
      await expect(warten).resolves.toEqual({ token: "", grund: "rueckfrage" });
      expect(zurueckgesetzt).toBe(0);
   });

   it("ein Fehler der Abfrage hebt den Rückfrage-Vermerk wieder auf", async () => {
      // Codex-Review 16.09.2026: Cloudflare meldet `error-callback` ohne
      // vorheriges `after-interactive-callback`. Ohne Bereinigung bliebe der
      // Vermerk stehen, und seit `tokenHolen` bei offener Rückfrage sofort
      // antwortet, käme der Kunde gar nicht mehr durch.
      const { result } = mitRahmen();
      act(() => optionen["before-interactive-callback"]());
      act(() => optionen["error-callback"]());
      const warten = result.current.tokenHolen();
      act(() => optionen.callback("tok-nach-fehler"));
      await expect(warten).resolves.toEqual({ token: "tok-nach-fehler" });
   });

   it("ein verbrauchtes Token wird nicht zweimal ausgegeben", async () => {
      const { result } = mitRahmen();
      act(() => optionen.callback("tok-1"));
      act(() => result.current.verbraucht());
      expect(zurueckgesetzt).toBe(1);
      const warten = result.current.tokenHolen();
      act(() => optionen.callback("tok-2"));
      await expect(warten).resolves.toEqual({ token: "tok-2" });
   });

   it("Schliessen während des Wartens gibt eine Absage, kein Token", async () => {
      // Codex-Review 15.09.2026: Ein Wartender überlebte das Schliessen, und
      // ein neues Widget nach dem Wiederöffnen erfüllte ihn - die Kaufseite
      // legte dann ohne Klick eine Transaktion an.
      const { result, rerender } = mitRahmen();
      const warten = result.current.tokenHolen();
      rerender({ offen: false });
      await expect(warten).resolves.toEqual({ token: "", grund: "abgebrochen" });
      rerender({ offen: true });
      act(() => optionen.callback("tok-neu"));
      // Der alte Wartende ist weg; das neue Token wartet auf einen neuen Klick.
      await expect(result.current.tokenHolen()).resolves.toEqual({ token: "tok-neu" });
   });

   it("entfernt das Widget beim Schliessen und vergisst das Token", async () => {
      const { result, rerender } = mitRahmen();
      act(() => optionen.callback("tok-1"));
      rerender({ offen: false });
      expect(entfernt).toEqual(["widget-1"]);
      rerender({ offen: true });
      const warten = result.current.tokenHolen();
      act(() => optionen.callback("tok-neu"));
      await expect(warten).resolves.toEqual({ token: "tok-neu" });
   });
});
