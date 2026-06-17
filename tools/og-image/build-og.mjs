// Erzeugt public/og-image.png (1200x630) aus og_card.template.html.
//
// Das Logo (public/logo.png) wird als base64 in die HTML eingebettet, danach
// rendert ein lokal installierter Chrome/Edge die Karte headless zu PNG.
// Keine npm-Abhaengigkeit noetig.
//
// Nutzung (aus dem Repo-Root):
//   node tools/og-image/build-og.mjs
//
// Vor dem Release: in og_card.template.html die mit "RELEASE:" markierten
// Textstellen (Versions-Pille, Headline, Subline) anpassen, dann dieses
// Skript laufen lassen. Ergebnis pruefen, committen, pushen.

import { readFileSync, writeFileSync, existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

const tplPath = join(here, "og_card.template.html");
const logoPath = join(repoRoot, "public", "logo.png");
const outPath = join(repoRoot, "public", "og-image.png");

const browsers = [
   "C:/Program Files/Google/Chrome/Application/chrome.exe",
   "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
   "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
   "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const browser = browsers.find(existsSync);
if (!browser) {
   console.error("Kein Chrome/Edge gefunden — bitte Pfad in build-og.mjs ergaenzen.");
   process.exit(1);
}

const tpl = readFileSync(tplPath, "utf8");
const logoUri = "data:image/png;base64," + readFileSync(logoPath).toString("base64");
const html = tpl.split("__LOGO_B64__").join(logoUri);

const work = mkdtempSync(join(tmpdir(), "vv-og-"));
const htmlPath = join(work, "og_card.html");
writeFileSync(htmlPath, html);

const result = spawnSync(
   browser,
   [
      "--headless",
      "--disable-gpu",
      "--force-device-scale-factor=1",
      "--hide-scrollbars",
      "--window-size=1200,630",
      "--virtual-time-budget=3000",
      "--screenshot=" + outPath,
      "file:///" + htmlPath.replace(/\\/g, "/"),
   ],
   { encoding: "utf8" }
);

if (!existsSync(outPath)) {
   console.error("Render fehlgeschlagen:", result.stderr || result.stdout);
   process.exit(1);
}

const buf = readFileSync(outPath);
const w = buf.readUInt32BE(16);
const h = buf.readUInt32BE(20);
console.log(`og-image.png erzeugt: ${w}x${h}, ${buf.length} Bytes`);
if (w !== 1200 || h !== 630) {
   console.warn("WARNUNG: Masse weichen von 1200x630 ab — og:image-Meta-Tags pruefen.");
}
