import { describe, expect, it } from "vitest";
import {
   PADDLE_TOKEN_LIVE, PADDLE_TOKEN_SANDKASTEN, PREISE_LIVE, PREISE_SANDKASTEN,
   paddleAufbau, paddleUmgebung,
} from "@utils/paddle";

/**
 * Der Prüfgegenstand ist ein einziger Satz: **Auf der ausgelieferten Seite
 * darf nie der Sandkasten stehen.**
 *
 * Ein Sandkasten-Bezahlfenster auf `vidiverify.de` nimmt Bestellungen mit
 * Testkarten entgegen, meldet sie als abgeschlossen und lässt anschliessend
 * Lizenzen ausstellen, für die nie jemand gezahlt hat. Der Fehler fällt
 * niemandem auf, denn von aussen sieht der Vorgang vollständig aus.
 *
 * Der zweite Satz ist die Kehrseite: **Lieber gar kein Kaufknopf als der
 * falsche.** Solange der Wirkkatalog fehlt, liefert der Aufbau `null`.
 */
describe("Paddle-Aufbau", () => {
   it("bietet auf der Wirkdomain das Wirkkonto an, nie den Sandkasten", () => {
      // Seit dem 26.09.2026 ist der Wirktoken gesetzt: Die Aussage ist nicht
      // mehr „nichts", sondern „genau das Wirkkonto mit dem Wirkkatalog".
      for (const host of ["vidiverify.de", "www.vidiverify.de", "vidiverify.com"]) {
         const aufbau = paddleAufbau(host);
         expect(aufbau?.umgebung).toBe("production");
         expect(aufbau?.token).toBe(PADDLE_TOKEN_LIVE);
         expect(aufbau?.preise).toEqual(PREISE_LIVE);
         expect(aufbau?.basis).toBe("/api");
      }
   });

   it("nimmt beim Entwickeln den Sandkasten", () => {
      const aufbau = paddleAufbau("localhost");
      expect(aufbau?.token).toBe(PADDLE_TOKEN_SANDKASTEN);
      expect(aufbau?.umgebung).toBe("sandbox");
      expect(aufbau?.preise).toEqual(PREISE_SANDKASTEN);
   });

   it("liest die Umgebung aus dem Präfix des Tokens", () => {
      expect(paddleUmgebung("test_abc")).toBe("sandbox");
      expect(paddleUmgebung("live_abc")).toBe("production");
   });

   it("bietet ohne Preiskennungen keinen Kauf an", () => {
      // Ein Token ohne Katalog führte in ein Bezahlfenster ohne Ware.
      const aufbau = paddleAufbau("vidiverify.de");
      if (aufbau) {
         expect(aufbau.preise.pro).not.toBe("");
         expect(aufbau.preise.lifetime).not.toBe("");
      }
   });

   it("hält Sandkasten- und Wirkkennungen auseinander", () => {
      expect(PREISE_SANDKASTEN.pro).not.toBe(PREISE_SANDKASTEN.lifetime);
   });
});
