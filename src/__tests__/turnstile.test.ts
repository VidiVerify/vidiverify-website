import { describe, expect, it } from "vitest";
import { TURNSTILE_SITEKEY, turnstileSchluessel } from "@utils/turnstile";

/**
 * Der Prüfgegenstand ist ein einziger Satz: **Auf der ausgelieferten Seite
 * darf nie ein Testschlüssel stehen.**
 *
 * Cloudflares Testschlüssel bestehen immer — ein Formular mit einem solchen
 * Schlüssel sieht geschützt aus und ist offen. Cloudflare zeichnet dazu zwar
 * eine rote Warnzeile ins Widget, aber seit es mit `interaction-only`
 * normalerweise unsichtbar bleibt, sähe sie niemand.
 */
describe("Turnstile-Schlüssel", () => {
   const ECHT = TURNSTILE_SITEKEY;

   it("nimmt auf der Wirkdomain den echten Schlüssel", () => {
      expect(turnstileSchluessel("vidiverify.de", "")).toBe(ECHT);
      expect(turnstileSchluessel("vidiverify.com", "?bot=1")).toBe(ECHT);
      expect(turnstileSchluessel("www.vidiverify.de", "?bot=1")).toBe(ECHT);
   });

   it("nimmt einen Testschlüssel ausschliesslich auf dem eigenen Rechner", () => {
      expect(turnstileSchluessel("localhost", "")).not.toBe(ECHT);
      expect(turnstileSchluessel("127.0.0.1", "")).not.toBe(ECHT);
   });

   it("stellt mit ?bot=1 die Rückfrage her — aber nur lokal", () => {
      const mitRueckfrage = turnstileSchluessel("localhost", "?bot=1");
      const ohne = turnstileSchluessel("localhost", "");
      expect(mitRueckfrage).not.toBe(ohne);
      expect(mitRueckfrage.startsWith("3x")).toBe(true);
   });

   it("hat überhaupt einen echten Schlüssel hinterlegt", () => {
      // Ohne ihn nimmt das Formular live nichts an. Das ist die richtige
      // Vorgabe, aber kein Zustand, in dem etwas ausgeliefert werden sollte.
      expect(turnstileSchluessel("vidiverify.de", "")).not.toBe("");
   });
});
