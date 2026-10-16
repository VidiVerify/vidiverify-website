<p align="center">
  <img src="public/logo.png" alt="VidiVerify Logo" width="160" />
</p>

<h1 align="center">VidiVerify</h1>

<p align="center">
  <strong>Der 1-Klick-Check für deine Videos.</strong><br />
  Sekunden statt Stunden. Lokal statt Cloud. Beweisbar statt vermutet.
</p>

<p align="center">
  <a href="https://vidiverify.de"><img src="https://img.shields.io/badge/Live-vidiverify.de-6aaccc?style=for-the-badge" alt="Live" /></a>
  <a href="https://apps.microsoft.com/store/detail/XPDLZGLQP4LKZW"><img src="https://img.shields.io/badge/Microsoft%20Store-Verfügbar-0078d4?style=for-the-badge&logo=microsoft" alt="Microsoft Store" /></a>
  <a href="https://github.com/VidiVerify/vidiverify-releases/releases"><img src="https://img.shields.io/github/v/release/VidiVerify/vidiverify-releases?style=for-the-badge&label=Release&color=22c55e" alt="Latest Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Lizenz-GPL--3.0-22c55e?style=for-the-badge" alt="Lizenz GPL-3.0" /></a>
</p>

<p align="center">
  <strong>🇩🇪 Deutsch</strong> · <a href="#-english">🇬🇧 English</a>
</p>

---

## 🎬 Warum VidiVerify

Videodateien altern. Codecs werden obsolet. Container reissen — meistens, **ohne dass du es merkst**. Erst beim Wiederabspielen in fünf Jahren stehst du vor einem schwarzen Bildschirm und einer Erkenntnis, die niemand braucht.

**VidiVerify findet die Probleme, bevor sie zum Problem werden.**

Per Drag-&-Drop oder 1-Klick prüft die App Containerstruktur, Codec-Eigenschaften, Bitraten, Frame-Integrität und Metadaten — und dokumentiert das Ergebnis im proprietären **Media-Analyse-Protokoll (MAP)**: revisionssicher, ablagefähig, in DE · EN · ES · RU · 中文.

Entwickelt für **Archivare, Kuratoren und Postproduktions-Profis** — und genauso für alle, die ihre **Plex-, Jellyfin- oder Emby-Mediathek** nicht dem Zufall überlassen wollen.

## ✨ Was die Software kann

| | |
|---|---|
| 🔍 **Vorprüfung** | Drag & Drop · Magic-Bytes-Validierung · Magika-ML-Tiefenprüfung optional |
| ⚡ **Quick-Check** | Rechtsklick im Windows-Explorer · Sekunden-Vorabprüfung ohne App-Start · Status-Orb + Befund + Mediadaten |
| 🛡️ **Integritätsprüfung** | Plug-in-basierte Frame-Analyse via FFmpeg · Auto-Eskalation bei Auffälligkeiten |
| 🩺 **Diagnosemodus** | Streamcopy + ffprobe-Tiefenanalyse + Decode-Layer · Ursachen-Attribution für DVD-, DTS- und Container-Anomalien |
| 📊 **Media Analyse** | Container · Codec · Bitrate · Auflösung · Atmos- & DTS:X-Erkennung · Bittiefe · Channel-Layout |
| 📋 **Formatprüfung** | **70+ unterstützte Formate** · AVC, HEVC, AV1, MPEG-1/2/4, ProRes, DNxHD · AAC, AC3, EAC3, DTS, TrueHD, FLAC |
| 📑 **MAP-Protokoll** | Strukturierter, revisionssicherer Befundbericht · Diagnose-Tiefenanalyse-Sektion · Magika-Sub-Block |
| 🧪 **Media Lab** | CodecLab, Bitrate ÄquivalenzLab und Video SizeLab zum Anfassen · Kompatibilitätsbewertung gegen 6 Zielprofile mit Ampel-Urteil |
| 🛠️ **Media Repair** (PRO) | Reparatur aus dem Prüfbefund · 16 Methoden, verlustfreie zuerst · Pflicht-Verifizierung · RepairMAP |
| 📚 **Media Stapel** (PRO) | Ganze Ordner prüfen · Pause und Fortsetzen · Ergebnisfenster mit Filter · StapelMAP |
| 🎞️ **Media Test** | Bildgenaues Video-Detailfenster mit Hochleistungs-Vorschau, KPI-Kacheln und Bitratenverlauf · eigenes Audio-Detailfenster mit Wellenform, Dropout- und Cutoff-/Upcoding-Erkennung |
| 📡 **Live-Telemetrie** | CPU · RAM · Netzwerk · Leserate während der Prüfung sichtbar |
| 🌍 **Mehrsprachig** | App: DE · EN · ES · RU · 中文 · Website: DE · EN |
| 🔐 **Verifizierbar** | Signierte Builds · SHA-256-Prüfwert je Release · lokale Verarbeitung, **keine Cloud** |

## 🆕 Neu in v1.5.0

- **Media Repair (PRO): defekte Videos reparieren statt neu beschaffen.** Aus dem Prüfbefund heraus empfiehlt VidiVerify die passende von 16 Reparaturmethoden, verlustfreie zuerst, und verifiziert das Ergebnis danach selbst. Das Revisionsblatt RepairMAP dokumentiert jede Reparatur lückenlos, bis zur Prüfsumme.
- **Media Stapel (PRO): ganze Ordner in einem Lauf.** Beliebig viele Dateien nacheinander prüfen, pausieren und fortsetzen, sogar nach einem Neustart. Am Ende stehen ein filterbares Ergebnisfenster und die StapelMAP als Bericht.
- **PRO und LIFETIME direkt aus der App.** Bezahlt wird über Paddle, die signierte Lizenz kommt danach von selbst in die App. Wer PRO hat, bekommt es beim Upgrade auf LIFETIME voll angerechnet.
- **Bewertung zum Nachlesen.** Jede Ampel folgt einem versionierten Regelwerk, einsehbar im Fenster „Bewertungsdetails & Symbole", und jeder Bericht nennt den Stand, nach dem geprüft wurde.
- **Russisch als fünfte Sprache.** Dazu ein Setup, das alle Sprachen der App spricht.

## 🚀 Bezugsquellen

- 🌐 **Website:** [vidiverify.de](https://vidiverify.de) (DE) · [vidiverify.com](https://vidiverify.com) (EN)
- 🛒 **Microsoft Store:** [apps.microsoft.com](https://apps.microsoft.com/store/detail/XPDLZGLQP4LKZW)
- 📦 **Direkt-Download:** [GitHub Releases](https://github.com/VidiVerify/vidiverify-releases/releases) · signiert · SHA-256-Sidecar
- 📖 **Handbuch:** [Deutsch (PDF)](https://vidiverify.de/handbuch_de.pdf) · [English (PDF)](https://vidiverify.de/handbuch_en.pdf)
- 💬 **Support:** [support@vidiverify.de](mailto:support@vidiverify.de)

## 🌐 Über dieses Repository

Hier liegt der Quellcode der **offiziellen Produktwebsite** unter [vidiverify.de](https://vidiverify.de). Die Website präsentiert VidiVerify, stellt Downloads bereit und enthält Lizenz-, Datenschutz- und Impressum-Informationen.

### 🛠️ Tech-Stack

<p>
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white" alt="Vite 7" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind v4" />
  <img src="https://img.shields.io/badge/Three.js-3D-000000?logo=threedotjs&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Motion-12-ff0080" alt="Motion" />
  <img src="https://img.shields.io/badge/i18next-DE%2FEN-26a69a?logo=i18next&logoColor=white" alt="i18next" />
</p>

Modernes Glassmorphism-Design mit Aurora-Akzenten, 3D-Hero-Szene via React Three Fiber, flüssigen Übergängen via Motion, smoothem Scrollen via Lenis und vollständiger **DE/EN-Internationalisierung** über react-i18next. Responsiv, tastaturbedienbar, `prefers-reduced-motion`-respektierend.

## 📜 Rechtliches

- **Lizenz:** [GPL-3.0](LICENSE)
- 📄 [Endbenutzerlizenzvereinbarung (EULA)](https://vidiverify.de/#eula)
- 🔐 [Datenschutzerklärung](https://vidiverify.de/#datenschutz)
- 🏛️ [Impressum](https://vidiverify.de/#impressum)
- 🛡️ [Security Policy](SECURITY.md)

## 💛 Unterstützung

VidiVerify wird von einem unabhängigen Team mit hohem Anspruch entwickelt. **Die Prüfung mit VidiVerify FREE ist und bleibt kostenlos.** Wer mehr braucht und die Weiterentwicklung mittragen möchte, findet Media Repair und Media Stapel in [PRO und LIFETIME](https://vidiverify.de/pro/): einmal zahlen, kein Abo.

---

<h2 id="-english">🇬🇧 English</h2>

<p>
  <strong>The 1-click check for your videos.</strong><br />
  Seconds, not hours. Local, not cloud. Provable, not assumed.
</p>

### 🎬 Why VidiVerify

Video files age. Codecs go obsolete. Containers break — usually **before you notice**. Five years later, when you actually try to play the file, you stand in front of a black screen and a realisation nobody needs.

**VidiVerify catches the problems before they become problems.**

Drag & drop or 1-click verifies container structure, codec attributes, bitrates, frame integrity and metadata — and documents the result in the proprietary **Media Analysis Protocol (MAP)**: audit-ready, archive-grade, available in DE · EN · ES · RU · 中文.

Built for **archivists, curators, post-production professionals** — and equally for anyone who refuses to leave their **Plex, Jellyfin or Emby library** to chance.

### ✨ What the software does

| | |
|---|---|
| 🔍 **Pre-check** | Drag & drop · Magic-bytes validation · Magika ML deep check (optional) |
| ⚡ **Quick-Check** | Right-click in Windows Explorer · seconds-fast pre-inspection without launching the app · status orb + finding + media data |
| 🛡️ **Integrity check** | Plug-in-based frame analysis via FFmpeg · Auto-escalation on anomalies |
| 🩺 **Diagnostic mode** | Streamcopy + ffprobe deep analysis + decode layer · Cause attribution for DVD, DTS and container anomalies |
| 📊 **Media analysis** | Container · Codec · Bitrate · Resolution · Atmos & DTS:X detection · Bit depth · Channel layout |
| 📋 **Format verification** | **70+ supported formats** · AVC, HEVC, AV1, MPEG-1/2/4, ProRes, DNxHD · AAC, AC3, EAC3, DTS, TrueHD, FLAC |
| 📑 **MAP protocol** | Structured, audit-ready finding report · Diagnostic deep analysis section · Magika sub-block |
| 🧪 **Media Lab** | Hands-on CodecLab, Bitrate Equivalence Lab and Video SizeLab · compatibility scoring against 6 target profiles with a clear traffic-light verdict |
| 🛠️ **Media Repair** (PRO) | Repair from the check result · 16 methods, lossless first · mandatory verification · RepairMAP |
| 📚 **Media Batch** (PRO) | Check whole folders · pause and resume · filterable results window · StapelMAP |
| 🎞️ **Media Test** | Frame-accurate video detail window with high-performance preview, KPI tiles and bitrate timeline · dedicated audio detail window with waveform, dropout and cutoff/upcoding detection |
| 📡 **Live telemetry** | CPU · RAM · Network · Read rate visible during the check |
| 🌍 **Multilingual** | App: DE · EN · ES · RU · 中文 · Website: DE · EN |
| 🔐 **Verifiable** | Signed builds · SHA-256 hash per release · Local processing, **no cloud** |

### 🆕 New in v1.5.0

- **Media Repair (PRO): repair damaged videos instead of replacing them.** Based on the check result, VidiVerify recommends the right one of 16 repair methods, lossless ones first, and then verifies the result itself. The RepairMAP audit sheet documents every repair in full, down to the checksum.
- **Media Batch (PRO): whole folders in one run.** Check any number of files in a row, pause and resume, even after a restart. At the end you get a filterable results window and the StapelMAP report.
- **PRO and LIFETIME straight from the app.** Payment is handled by Paddle, and the signed license arrives in the app on its own. If you already own PRO, its full price is credited when you upgrade to LIFETIME.
- **Ratings you can look up.** Every traffic light follows a versioned rule set, viewable in the "Rating details & symbols" window, and every report names the rule set it was checked against.
- **Russian as a fifth language.** Plus a setup that speaks every language of the app.

### 🚀 Where to get it

- 🌐 **Website:** [vidiverify.com](https://vidiverify.com) (EN) · [vidiverify.de](https://vidiverify.de) (DE)
- 🛒 **Microsoft Store:** [apps.microsoft.com](https://apps.microsoft.com/store/detail/XPDLZGLQP4LKZW)
- 📦 **Direct download:** [GitHub Releases](https://github.com/VidiVerify/vidiverify-releases/releases) · signed · SHA-256 sidecar
- 📖 **User manual:** [English (PDF)](https://vidiverify.de/handbuch_en.pdf) · [Deutsch (PDF)](https://vidiverify.de/handbuch_de.pdf)
- 💬 **Support:** [support@vidiverify.de](mailto:support@vidiverify.de)

### 📜 Legal

- **License:** [GPL-3.0](LICENSE)
- 📄 [End User License Agreement (EULA)](https://vidiverify.de/#eula)
- 🔐 [Privacy policy](https://vidiverify.de/#datenschutz)
- 🏛️ [Legal notice (Impressum)](https://vidiverify.de/#impressum)
- 🛡️ [Security policy](SECURITY.md)

### 💛 Support us

VidiVerify is developed by an independent team with high standards. **Checking with VidiVerify FREE is and remains free of charge.** If you need more and want to support further development, [PRO and LIFETIME](https://vidiverify.com/pro/) add Media Repair and Media Batch: pay once, no subscription.

---

<p align="center">
  <strong>Made with 🎞️ by VidiVerify-Team · Gera, Thüringen · Deutschland</strong>
</p>
