/**
 * Die beiden Vorschlagslogiken im Bestellformular.
 *
 * Beide haben dieselbe Gratwanderung: Ein zu enger Grenzwert fängt den
 * Vertipper nicht, ein zu weiter schlägt eine Adresse vor, die es wirklich
 * gibt. `mail.de` darf nicht als `gmail.com` gelten, und `gmx.net` nicht als
 * `gmx.de` - das sind verschiedene Postfächer.
 */
import { describe, it, expect } from "vitest";
import { emailVorschlag } from "@utils/emailVorschlag";
import { landVorschlag, laenderNamen } from "@utils/laender";

describe("emailVorschlag", () => {
   it("erkennt die gängigen Vertipper", () => {
      expect(emailVorschlag("max@gmail.con")).toBe("max@gmail.com");
      expect(emailVorschlag("max@gmial.com")).toBe("max@gmail.com");
      expect(emailVorschlag("max@gmx.d")).toBe("max@gmx.de");
      expect(emailVorschlag("max@web.d")).toBe("max@web.de");
      expect(emailVorschlag("max@hotmal.com")).toBe("max@hotmail.com");
      expect(emailVorschlag("max@yaho.com")).toBe("max@yahoo.com");
   });

   it("ergänzt eine fehlende Endung nur, wenn sie eindeutig ist", () => {
      expect(emailVorschlag("max@googlemail")).toBe("max@googlemail.com");
      // `gmx` beginnt vier bekannte Domains - hier ist nichts eindeutig.
      expect(emailVorschlag("max@gmx")).toBeNull();
   });

   it("lässt richtige Adressen in Ruhe", () => {
      for (const gut of ["max@gmail.com", "max@gmx.net", "max@t-online.de",
                         "max@mail.de", "max@proton.me"]) {
         expect(emailVorschlag(gut)).toBeNull();
      }
   });

   it("schlägt bei unbekannten Domains nichts vor", () => {
      expect(emailVorschlag("max@meinefirma.de")).toBeNull();
      expect(emailVorschlag("kontakt@vidiverify.de")).toBeNull();
   });

   it("kommt mit unfertigen Eingaben zurecht", () => {
      for (const kaputt of ["", "ohne-at", "max@", "@gmail.com", "   "]) {
         expect(emailVorschlag(kaputt)).toBeNull();
      }
   });
});

describe("landVorschlag", () => {
   it("kennt die Länder in beiden Sprachen", () => {
      expect(laenderNamen("de")).toContain("Deutschland");
      expect(laenderNamen("de")).toContain("Österreich");
      expect(laenderNamen("en")).toContain("Germany");
   });

   it("erkennt den vertauschten Buchstaben", () => {
      expect(landVorschlag("Deutshcland", "de")).toBe("Deutschland");
      expect(landVorschlag("Osterreich", "de")).toBe("Österreich");
      expect(landVorschlag("Schwiez", "de")).toBe("Schweiz");
      expect(landVorschlag("Germny", "en")).toBe("Germany");
   });

   it("lässt richtige Eingaben in Ruhe, auch klein geschrieben", () => {
      expect(landVorschlag("Deutschland", "de")).toBeNull();
      expect(landVorschlag("deutschland", "de")).toBeNull();
      expect(landVorschlag("Schweiz", "de")).toBeNull();
   });

   it("schlägt bei zu kurzer oder zu ferner Eingabe nichts vor", () => {
      expect(landVorschlag("De", "de")).toBeNull();
      expect(landVorschlag("Absurdistan", "de")).toBeNull();
   });
});
