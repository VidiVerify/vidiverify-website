# OG-Image-Generator

Erzeugt das Open-Graph-Vorschaubild `public/og-image.png` (1200×630) — das
Bild, das Facebook, X, LinkedIn, WhatsApp, Discord & Co. als Thumbnail
anzeigen, wenn jemand `vidiverify.de` / `vidiverify.com` als Link postet.

Die Meta-Tags in `index.html` (`og:image`, `twitter:image`) zeigen auf den
festen Pfad `https://vidiverify.de/og-image.png`. Wir tauschen also nur die
Datei aus — die Tags bleiben unveraendert.

## Bei jedem Release neu setzen

1. In `og_card.template.html` die drei mit `RELEASE:` markierten Stellen
   anpassen:
   - **Versions-Pille** (`NEU in vX.Y.Z`)
   - **Headline** (das Headline-Feature des Releases)
   - **Subline** (kurze Nutzen-Beschreibung)
2. Generator laufen lassen (aus dem Repo-Root):
   ```
   node tools/og-image/build-og.mjs
   ```
   Rendert per lokal installiertem Chrome/Edge (headless) nach
   `public/og-image.png`.
3. Ergebnis sichten, dann committen + pushen.
4. **Cache der Plattformen leeren**, sonst zeigen sie weiter das alte Bild:
   - Facebook/WhatsApp: <https://developers.facebook.com/tools/debug/> →
     URL eingeben → „Scrape Again"
   - X/Twitter: <https://cards-dev.twitter.com/validator>
   - LinkedIn: <https://www.linkedin.com/post-inspector/>

## Hinweise

- Schrift (Inter + JetBrains Mono) wird beim Rendern von Google Fonts
  geladen — die Maschine braucht kurz Internet. Fallback ist Segoe UI.
- `og:image:alt` / `twitter:image:alt` in `index.html` beschreiben den
  Bildinhalt fuer Screenreader/SEO — bei groesserem Motivwechsel mitziehen.
- Das Logo wird automatisch aus `public/logo.png` eingebettet; kein
  manuelles base64 noetig.
