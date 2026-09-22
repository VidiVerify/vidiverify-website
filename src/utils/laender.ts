/**
 * Ländernamen für das Anschriftsfeld - in der Sprache des Kunden.
 *
 * Die Namen werden NICHT gepflegt, sondern aus `Intl.DisplayNames` erzeugt:
 * Der Browser kennt sie bereits, lokalisiert und aktuell. Eine eigene Liste
 * wäre eine zweite Fassung, die veraltet, sobald sich ein Land umbenennt - und
 * sie müsste für jede Sprache übersetzt werden.
 *
 * Gepflegt wird hier nur, WELCHE Länder es gibt: die Zweibuchstabencodes nach
 * ISO 3166-1.
 *
 * **Angeboten wird, nicht vorgeschrieben.** Das Feld bleibt ein Textfeld mit
 * `datalist`; wer einen Landesnamen anders schreibt oder ein Gebiet einträgt,
 * das hier fehlt, kann das tun. Ein Auswahlfeld hätte den Kunden gezwungen,
 * aus 250 Einträgen zu suchen, was er in drei Anschlägen tippt.
 */
import { abstand } from "./textabstand";

const CODES = (
   "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI "
   + "BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN "
   + "CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK "
   + "FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM "
   + "HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN "
   + "KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK "
   + "ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP "
   + "NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW "
   + "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF "
   + "TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI "
   + "VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

const zwischenspeicher = new Map<string, string[]>();
const paarSpeicher = new Map<string, Array<{ code: string; name: string }>>();

/** Alle Ländernamen, alphabetisch in der gewünschten Sprache. */
export function laenderNamen(sprache: string): string[] {
   const schluessel = sprache || "de";
   const fertig = zwischenspeicher.get(schluessel);
   if (fertig) return fertig;

   let namen: string[];
   try {
      const anzeige = new Intl.DisplayNames([schluessel], { type: "region" });
      namen = CODES
         .map((c) => {
            try {
               return anzeige.of(c) || "";
            } catch {
               return "";
            }
         })
         .filter((n) => n && !/^[A-Z]{2}$/.test(n));
   } catch {
      // Ein Browser ohne `Intl.DisplayNames` bekommt keine Vorschläge. Das
      // Feld bleibt ein gewöhnliches Textfeld und funktioniert weiter.
      namen = [];
   }
   namen.sort((a, b) => a.localeCompare(b, schluessel));
   zwischenspeicher.set(schluessel, namen);
   return namen;
}

/**
 * Der Zweibuchstabencode nach ISO 3166-1 zu einem Landesnamen - oder `null`,
 * wenn sich der Name keinem Land zuordnen lässt.
 *
 * Gebraucht für den Kaufweg: Paddle bestimmt aus dem Code den Steuerort, und
 * ein Klartextname wäre dort unbrauchbar. **Die Zuordnung gehört hierher und
 * nicht in das Fenster**, weil sie dieselbe Liste benutzt wie die Vorschläge -
 * zwei Listen liefen auseinander, und dann stünde im Feld ein Land, das der
 * Kauf nicht kennt.
 *
 * Ein bereits eingegebener Code wird durchgereicht: Wer „DE" tippt, meint DE.
 */
export function laenderCode(eingabe: string, sprache: string): string | null {
   const roh = (eingabe || "").trim();
   if (!roh) return null;
   if (/^[A-Za-z]{2}$/.test(roh)) {
      const gross = roh.toUpperCase();
      return CODES.includes(gross) ? gross : null;
   }
   try {
      const anzeige = new Intl.DisplayNames([sprache || "de"], { type: "region" });
      const klein = roh.toLocaleLowerCase(sprache || "de");
      for (const code of CODES) {
         const name = anzeige.of(code) || "";
         if (name && name.toLocaleLowerCase(sprache || "de") === klein) return code;
      }
   } catch {
      // Ohne `Intl.DisplayNames` bleibt nur der Code selbst. Das Feld sagt
      // dann, dass es das Land nicht erkennt - besser als eine Vermutung.
   }
   return null;
}

/**
 * Die Länder als Paare aus Code und Namen, in der Reihenfolge der Namen.
 *
 * Gebraucht, wo zu einem angezeigten Namen der Code bekannt sein muss, ohne
 * ihn zu suchen - etwa um in der Vorschlagsliste zu vermerken, aus welchem
 * Land der Zahlungsanbieter nicht annimmt. `laenderCode` je Eintrag
 * aufzurufen liefe über die ganze Liste, und das bei jedem Neuzeichnen.
 */
export function laenderListe(sprache: string): Array<{ code: string; name: string }> {
   const schluessel = sprache || "de";
   const fertig = paarSpeicher.get(schluessel);
   if (fertig) return fertig;

   let paare: Array<{ code: string; name: string }>;
   try {
      const anzeige = new Intl.DisplayNames([schluessel], { type: "region" });
      paare = CODES
         .map((code) => {
            try {
               return { code, name: anzeige.of(code) || "" };
            } catch {
               return { code, name: "" };
            }
         })
         .filter((p) => p.name && !/^[A-Z]{2}$/.test(p.name));
   } catch {
      paare = [];
   }
   paare.sort((a, b) => a.name.localeCompare(b.name, schluessel));
   paarSpeicher.set(schluessel, paare);
   return paare;
}

/**
 * Der vermutlich gemeinte Landesname - oder `null`, wenn die Eingabe passt
 * oder zu weit entfernt ist.
 *
 * Fängt den Fall, den die Vorschlagsliste nicht fängt: Sie filtert nach
 * Wortanfang, und „Deutshcland" beginnt richtig, endet aber falsch.
 */
export function landVorschlag(eingabe: string, sprache: string): string | null {
   const roh = (eingabe || "").trim();
   if (roh.length < 4) return null;

   const namen = laenderNamen(sprache);
   if (!namen.length) return null;

   const klein = roh.toLocaleLowerCase(sprache);
   if (namen.some((n) => n.toLocaleLowerCase(sprache) === klein)) return null;

   let beste: string | null = null;
   let bester = 99;
   for (const name of namen) {
      // Nur Kandidaten ähnlicher Länge vergleichen: Sonst steht „Chile" bei
      // jedem kurzen Vertipper vorn.
      if (Math.abs(name.length - roh.length) > 2) continue;
      const d = abstand(klein, name.toLocaleLowerCase(sprache));
      // Ein Zeichen bei kurzen Namen, zwei bei längeren. „Deutshcland" ist
      // eine Vertauschung, also Abstand zwei.
      const grenze = name.length >= 8 ? 2 : 1;
      if (d <= grenze && d < bester) {
         bester = d;
         beste = name;
      }
   }
   return beste;
}
