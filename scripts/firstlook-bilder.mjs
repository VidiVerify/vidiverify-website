/**
 * Baut die Bilder für den Abschnitt „First Look" aus den Handbuch-Screenshots.
 *
 *    pnpm bilder:firstlook [Quellordner]
 *
 * Der Quellordner enthält `handbuch_de/` und `handbuch_en/`; ohne Angabe gilt
 * der Ablageort der 1.5er-Screenshots. Die Quellen liegen nicht im Repo, die
 * erzeugten Bilder schon: Der Build auf GitHub kommt an Laufwerk O: nicht heran.
 *
 * Je Kapitel und Sprache entstehen zwei Dateien in `public/firstlook/<lang>/`:
 *
 * - `<kapitel>.webp`: das Original in seiner eigenen Grösse, verlustfrei.
 *   Hochskaliert wird nicht - jedes zusätzliche Pixel wäre geraten und macht
 *   Schrift weich.
 * - `<kapitel>-klein.webp`: die Vorschau. Kein verkleinertes Gesamtbild,
 *   sondern ein Ausschnitt der Stelle, die das Kapitel ausmacht (Prüfkacheln,
 *   Spektrum, Ampel). Ein ganzes Fenster auf 140 Pixel Breite zeigt nur noch
 *   dunkle Kästen. Verkleinert wird mit Lanczos, danach leicht nachgeschärft,
 *   weil jedes Verkleinern Kanten weicher macht.
 *
 * Die Masse der Grossbilder landen in `src/pages/firstlook/bilder.json`. Die
 * Seite reserviert damit den Platz, bevor das Bild geladen ist, und springt
 * nicht.
 */
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const QUELLE = process.argv[2]
   ?? "O:/03_VIDIVERIFY/05_DOKUMENTATION/BENUTZER/Screenshots/1.5";
const ZIEL = path.join(WURZEL, "public", "firstlook");
const MANIFEST = path.join(WURZEL, "src", "pages", "firstlook", "bilder.json");

// Vorschau in doppelter Anzeigegrösse, damit sie auf hochauflösenden
// Bildschirmen nicht unscharf wird. 16:9 wie die Kacheln auf der Seite.
const KLEIN_BREITE = 320;
const KLEIN_HOEHE = 180;

/* Reihenfolge = Reihenfolge auf der Seite: erst der Ablauf einer Prüfung,
 * dann die Werkzeuge, zuletzt das Aussehen.
 *
 * `ausschnitt` ist [links, oben, Breite, Höhe] als Anteil des Originals, damit
 * er für die deutsche und die englische Fassung gleichermassen trifft.
 *
 * `bonus`: Das Bild liegt in `Bonus_Website/`. Eine englische Fassung gleichen
 * Namens in `Bonus_Website/en/` hat für die englische Seite Vorrang; fehlt sie,
 * zeigt auch die englische Seite die deutsche. */
const KAPITEL = [
   { key: "pruefung", datei: "03_pruefkacheln.png",              ausschnitt: [0.52, 0.49, 0.48, 0.51] },
   { key: "analyse",  datei: "04_media_analyse.png",             ausschnitt: [0.0, 0.48, 0.52, 0.52] },
   { key: "video",    datei: "Videodetails.png", bonus: true,    ausschnitt: [0.02, 0.04, 0.7, 0.4] },
   { key: "audio",    datei: "08_detail_audio.png",              ausschnitt: [0.46, 0.34, 0.54, 0.32] },
   { key: "stapel",   datei: "09_stapel_laufend.png",            ausschnitt: [0.0, 0.49, 0.5, 0.51] },
   { key: "repair",   datei: "12_repair_empfehlung.png",         ausschnitt: [0.0, 0.49, 0.5, 0.51] },
   { key: "lab",      datei: "16a_media_lab_kompatibilitaet.png", ausschnitt: [0.28, 0.12, 0.5, 0.33] },
   { key: "codeclab", datei: "CodecLab.png", bonus: true,        ausschnitt: [0.45, 0.13, 0.52, 0.42] },
   { key: "bitratelab", datei: "Bitrat AquivalenzLab.png", bonus: true, ausschnitt: [0.03, 0.35, 0.72, 0.42] },
   { key: "sizelab",  datei: "Video SizeLab.png", bonus: true,   ausschnitt: [0.02, 0.47, 0.6, 0.36] },
   { key: "map",      datei: "17_map.png",                       ausschnitt: [0.04, 0.03, 0.92, 0.4] },
   { key: "quick",    datei: "07_quickcheck.png",                ausschnitt: [0, 0, 1, 1] },
   // Die Designs einzeln statt als Collage: Drei verkleinerte Fenster in
   // einem Bild zeigen von keinem etwas. Das Standard-Design fehlt, weil es
   // in allen anderen Kapiteln zu sehen ist. Der Ausschnitt nimmt die Knöpfe
   // oben rechts, weil dort die Akzentfarbe sitzt.
   { key: "windows",  datei: "21b_windows.png",                  ausschnitt: [0.45, 0, 0.55, 0.44] },
   { key: "plex",     datei: "21c_plex.png",                     ausschnitt: [0.45, 0, 0.55, 0.44] },
];

const SPRACHEN = { de: "handbuch_de", en: "handbuch_en" };

async function bonusQuelle(lang, datei) {
   const eigene = path.join(QUELLE, "Bonus_Website", lang, datei);
   try {
      await access(eigene);
      return eigene;
   } catch {
      return path.join(QUELLE, "Bonus_Website", datei);
   }
}

/* Windows-Fensterrahmen erkennen und abschneiden.
 *
 * Manche Screenshots sind mit Titelleiste und Fensterrand aufgenommen (die
 * englischen Bonusbilder), andere ohne. Auf der Seite sollen alle gleich
 * aussehen: nur der Inhalt, die Ecken rundet die Seite selbst. Erkannt wird
 * die helle Titelleiste über dem dunklen Inhalt - ohne sie bleibt das Bild,
 * wie es ist. Dann fallen die Leiste und je 1 Pixel Rand links, rechts und
 * unten weg. */
async function fensterRahmen(quelle, pruefen) {
   if (!pruefen) {
      const { width: w, height: h } = await sharp(quelle).metadata();
      return { extract: { left: 0, top: 0, width: w, height: h }, width: w, height: h };
   }
   const { data, info } = await sharp(quelle).removeAlpha().raw().toBuffer({ resolveWithObject: true });
   const { width: w, height: h } = info;
   const helligkeit = (y) => {
      let summe = 0;
      for (let x = 0; x < w; x++) {
         const i = (y * w + x) * 3;
         summe += data[i] + data[i + 1] + data[i + 2];
      }
      return summe / (3 * w);
   };
   const ganz = { extract: { left: 0, top: 0, width: w, height: h }, width: w, height: h };
   if (helligkeit(2) < 200) return ganz;
   let oben = 2;
   while (oben < 80 && helligkeit(oben) > 100) oben++;
   if (oben >= 80) return ganz;
   const extract = { left: 1, top: oben, width: w - 2, height: h - oben - 1 };
   return { extract, width: extract.width, height: extract.height };
}

const manifest = {};

for (const [lang, ordner] of Object.entries(SPRACHEN)) {
   const zielOrdner = path.join(ZIEL, lang);
   await mkdir(zielOrdner, { recursive: true });
   manifest[lang] = {};

   for (const { key, datei, ausschnitt, bonus } of KAPITEL) {
      const quelle = bonus ? await bonusQuelle(lang, datei) : path.join(QUELLE, ordner, datei);
      // Nur Bonusbilder: Die Handbuch-Screenshots sind schon ohne Rahmen, und
      // die weisse Protokollseite sähe für die Erkennung wie eine Titelleiste aus.
      const rahmen = await fensterRahmen(quelle, bonus);
      const { width, height } = rahmen;

      await sharp(quelle)
         .extract(rahmen.extract)
         .webp({ lossless: true, effort: 6 })
         .toFile(path.join(zielOrdner, `${key}.webp`));

      const [l, o, b, h] = ausschnitt;
      // Ausschnitt relativ zum Inhalt, also hinter dem abgeschnittenen Rahmen
      await sharp(quelle)
         .extract({
            left: rahmen.extract.left + Math.round(l * width),
            top: rahmen.extract.top + Math.round(o * height),
            width: Math.round(b * width),
            height: Math.round(h * height),
         })
         .resize(KLEIN_BREITE, KLEIN_HOEHE, { fit: "cover", kernel: "lanczos3" })
         .sharpen({ sigma: 0.6, m1: 0.6, m2: 1.4 })
         .webp({ quality: 90, smartSubsample: true, effort: 6 })
         .toFile(path.join(zielOrdner, `${key}-klein.webp`));

      manifest[lang][key] = { w: width, h: height };
      console.log(`${lang}/${key}  ${width}×${height}`);
   }
}

const reihenfolge = KAPITEL.map((k) => k.key);
await writeFile(MANIFEST, `${JSON.stringify({ reihenfolge, ...manifest }, null, 3)}\n`);
console.log(`Manifest: ${path.relative(WURZEL, MANIFEST)}`);
