import { describe, expect, it } from "vitest";
import { tokenPasst, tokenTyp } from "@utils/lizenzToken";

/**
 * Die Erfolgsansicht meldet einen Kauf erst fertig, wenn das abgeholte Token
 * den gekauften Typ trägt. Anlass (Befund K1, 18.09.2026): Beim Upgrade
 * PRO → LIFETIME kam sofort das alte PRO-Token zurück und stand als neue
 * Lizenz auf der Seite.
 */

/** Baut ein Token wie der Worker: `VV1.<Nutzlast>.<Signatur>`, base64url. */
function token(felder: Record<string, string>): string {
   const bytes = new TextEncoder().encode(JSON.stringify(felder));
   const b64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
   return `VV1.${b64}.c2lnbmF0dXI`;
}

const PRO = token({
   email: "kunde@example.de", license_generation: "1.x",
   license_type: "pro", vv_id: "VV-CJPC5",
});
const LIFETIME = token({
   email: "kunde@example.de", license_generation: "all",
   license_type: "lifetime", vv_id: "VV-CJPC5",
});

describe("lizenzToken", () => {
   it("liest den Typ aus der Nutzlast", () => {
      expect(tokenTyp(PRO)).toBe("pro");
      expect(tokenTyp(LIFETIME)).toBe("lifetime");
   });

   it("das alte PRO-Token passt NICHT zu einem LIFETIME-Kauf", () => {
      expect(tokenPasst(PRO, "lifetime")).toBe(false);
      expect(tokenPasst(LIFETIME, "lifetime")).toBe(true);
   });

   it("ein PRO-Kauf erkennt sein Token", () => {
      expect(tokenPasst(PRO, "pro")).toBe(true);
   });

   it("liest eine Nutzlast mit Umlaut in der Emailadresse", () => {
      const umlaut = token({
         email: "hans.müller@example.de", license_generation: "all",
         license_type: "lifetime", vv_id: "VV-CJPC5",
      });
      expect(tokenPasst(umlaut, "lifetime")).toBe(true);
   });

   it("ein unlesbares Token passt nie", () => {
      expect(tokenPasst("", "pro")).toBe(false);
      expect(tokenPasst("AAAA-BBBB-CCCC-DDDD", "pro")).toBe(false);
      expect(tokenPasst("VV1.!!!.sig", "pro")).toBe(false);
      expect(tokenPasst("VV2." + PRO.split(".")[1] + ".sig", "pro")).toBe(false);
   });
});
