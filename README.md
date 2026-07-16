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

Per Drag-&-Drop oder 1-Klick prüft die App Containerstruktur, Codec-Eigenschaften, Bitraten, Frame-Integrität und Metadaten — und dokumentiert das Ergebnis im proprietären **Media-Analyse-Protokoll (MAP)**: revisionssicher, ablagefähig, in DE · EN · ES · 中文.

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
| 🎞️ **Media Test** | Bildgenaues Video-Detailfenster mit Hochleistungs-Vorschau, KPI-Kacheln und Bitratenverlauf · eigenes Audio-Detailfenster mit Wellenform, Dropout- und Cutoff-/Upcoding-Erkennung |
| 📡 **Live-Telemetrie** | CPU · RAM · Netzwerk · Leserate während der Prüfung sichtbar |
| 🌍 **Mehrsprachig** | App: DE · EN · ES · 中文 · Website: DE · EN |
| 🔐 **Verifizierbar** | Signierte Builds · SHA-256-Prüfwert je Release · lokale Verarbeitung, **keine Cloud** |

## 🆕 Neu in v1.4.9

- **Kompatibilitätsbewertung — wird deine Datei wirklich überall abgespielt?** Neuer Tab „Media Lab": VidiVerify bewertet die Wiedergabe-Wahrscheinlichkeit gegen sechs Zielprofile (Universal, Streaming, Smart-TV, Mobil, Archiv, Broadcast) mit klarer Ampel — Fallstricke wie problematische Codec-Profile oder Farbräume werden benannt, bevor sie beim Zuschauer zum schwarzen Bild werden.
- **Drei Video-Laboratorien zum Anfassen.** CodecLab empfiehlt live den passenden Codec für Ziel und Gerät, das Bitrate ÄquivalenzLab rechnet Bitraten fair zwischen Codecs um, das Video SizeLab schätzt die Dateigrösse bei jeder Auflösung — inklusive Up- und Downscaling.
- **Neues Video-Detailfenster für echte Videoprofis.** KPI-Kacheln für Bild, Farbe und Bitrate, Hochleistungs-Vorschau mit bildgenauer Wiedergabe, perzeptuelle Analyse als Zebra-Tabelle und ein DAW-artiger Bitratenverlauf — alles direkt in der App, kein Zweit-Player nötig.
- **Erstmals: eigenes Audio-Detailfenster mit Cutoff- und Upcoding-Erkennung.** Frequenzspektrum, Pegel, Wellenform und Dropout-Erkennung — plus das Flaggschiff-Feature: erkennt anhand des Frequenz-Cutoffs, ob eine Datei tatsächlich in der angegebenen Bitrate codiert wurde oder nur hochgerechnet ist („Upcoding"/Fake-Bitrate).
- **Spanisch als vierte Sprache.** VidiVerify spricht jetzt auch Español — App und alle Detailfenster.

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

VidiVerify wird von einem unabhängigen Team mit hohem Anspruch entwickelt. **Die private Nutzung ist und bleibt kostenfrei.** Wer die Weiterentwicklung mittragen möchte, kann das [freiwillig per Spende](https://vidiverify.de/#spenden) tun — keine Verpflichtung, kein Abo.

---

<h2 id="-english">🇬🇧 English</h2>

<p>
  <strong>The 1-click check for your videos.</strong><br />
  Seconds, not hours. Local, not cloud. Provable, not assumed.
</p>

### 🎬 Why VidiVerify

Video files age. Codecs go obsolete. Containers break — usually **before you notice**. Five years later, when you actually try to play the file, you stand in front of a black screen and a realisation nobody needs.

**VidiVerify catches the problems before they become problems.**

Drag & drop or 1-click verifies container structure, codec attributes, bitrates, frame integrity and metadata — and documents the result in the proprietary **Media Analysis Protocol (MAP)**: audit-ready, archive-grade, available in DE · EN · ES · 中文.

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
| 🎞️ **Media Test** | Frame-accurate video detail window with high-performance preview, KPI tiles and bitrate timeline · dedicated audio detail window with waveform, dropout and cutoff/upcoding detection |
| 📡 **Live telemetry** | CPU · RAM · Network · Read rate visible during the check |
| 🌍 **Multilingual** | App: DE · EN · ES · 中文 · Website: DE · EN |
| 🔐 **Verifiable** | Signed builds · SHA-256 hash per release · Local processing, **no cloud** |

### 🆕 New in v1.4.9

- **Compatibility scoring — will your file actually play everywhere?** New "Media Lab" tab: VidiVerify scores playback likelihood against six target profiles (Universal, Streaming, Smart TV, Mobile, Archive, Broadcast) with a clear traffic-light verdict — naming pitfalls like problematic codec profiles or color spaces before they turn into a black screen for your viewer.
- **Three hands-on video labs.** CodecLab recommends the right codec live for your target and device, the Bitrate Equivalence Lab converts bitrates fairly between codecs, and Video SizeLab estimates file size at any resolution — including upscaling and downscaling.
- **A new video detail window built for video professionals.** KPI tiles for image, color and bitrate, a high-performance preview with frame-accurate playback, perceptual analysis as a zebra table, and a DAW-style bitrate timeline — all directly in the app, no second player needed.
- **First time ever: a dedicated audio detail window with cutoff and upcoding detection.** Frequency spectrum, levels, waveform and dropout detection — plus the flagship feature: detects from the frequency cutoff whether a file was genuinely encoded at its stated bitrate or merely upsampled ("upcoding"/fake bitrate).
- **Spanish as a fourth language.** VidiVerify now speaks Español too — the app and every detail window.

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

VidiVerify is developed by an independent team with high standards. **Personal use is and remains free.** If you'd like to help the project move forward, you can [donate voluntarily](https://vidiverify.de/#spenden) — no obligation, no subscription.

---

<p align="center">
  <strong>Made with 🎞️ by VidiVerify-Team · Gera, Thüringen · Deutschland</strong>
</p>
