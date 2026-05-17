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

Per Drag-&-Drop oder 1-Klick prüft die App Containerstruktur, Codec-Eigenschaften, Bitraten, Frame-Integrität und Metadaten — und dokumentiert das Ergebnis im proprietären **Media-Analyse-Protokoll (MAP)**: revisionssicher, ablagefähig, in DE · EN · 中文.

Entwickelt für **Archivare, Kuratoren und Postproduktions-Profis** — und genauso für alle, die ihre **Plex-, Jellyfin- oder Emby-Mediathek** nicht dem Zufall überlassen wollen.

## ✨ Was die Software kann

| | |
|---|---|
| 🔍 **Vorprüfung** | Drag & Drop · Magic-Bytes-Validierung · Magika-ML-Tiefenprüfung optional |
| 🛡️ **Integritätsprüfung** | Plug-in-basierte Frame-Analyse via FFmpeg · Auto-Eskalation bei Auffälligkeiten |
| 🩺 **Diagnosemodus** | Streamcopy + ffprobe-Tiefenanalyse + Decode-Layer · Ursachen-Attribution für DVD-, DTS- und Container-Anomalien |
| 📊 **Media Analyse** | Container · Codec · Bitrate · Auflösung · Atmos- & DTS:X-Erkennung · Bittiefe · Channel-Layout |
| 📋 **Formatprüfung** | **70+ unterstützte Formate** · AVC, HEVC, AV1, MPEG-1/2/4, ProRes, DNxHD · AAC, AC3, EAC3, DTS, TrueHD, FLAC |
| 📑 **MAP-Protokoll** | Strukturierter, revisionssicherer Befundbericht · Diagnose-Tiefenanalyse-Sektion · Magika-Sub-Block |
| 📡 **Live-Telemetrie** | CPU · RAM · Netzwerk · Leserate während der Prüfung sichtbar |
| 🌍 **Mehrsprachig** | App: DE · EN · 中文 · Website: DE · EN |
| 🔐 **Verifizierbar** | Signierte Builds · SHA-256-Prüfwert je Release · lokale Verarbeitung, **keine Cloud** |

## 🆕 Neu in v1.4.7

- **Diagnosemodus als regulärer Prüfmodus** mit dreistufiger Tiefenanalyse (Streamcopy → ffprobe → Decode). Erkennt MPEG-1/2, H.264, HEVC- und AAC/MP3-spezifische Defekte. Automatische Eskalation bei 🟡/🔴-Befunden.
- **Magika-Tiefenprüfung** (Google, Apache 2.0) als zweite Meinung zur Magic-Bytes-Prüfung — erkennt umbenannte, maskierte oder defekte Dateien zuverlässig.
- **MAP-Protokoll** mit neuer Sektion „Diagnose-Tiefenanalyse" und Magika-Sub-Block bei aktivem Plug-in.
- **5-fach-Telemetrie** in der Statusleiste: CPU System, CPU-Prüfprozess, RAM, Netzwerk, Leserate — live während der Analyse.
- **Auto-Sprache** beim Erststart folgt der System-Locale. Theme- und Sprachwechsel im laufenden Betrieb ohne Neustart.
- **Microsoft Store** seit v1.4.6 live — Installation in 2 Klicks ohne Defender-Rückfragen.

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

Drag & drop or 1-click verifies container structure, codec attributes, bitrates, frame integrity and metadata — and documents the result in the proprietary **Media Analysis Protocol (MAP)**: audit-ready, archive-grade, available in DE · EN · 中文.

Built for **archivists, curators, post-production professionals** — and equally for anyone who refuses to leave their **Plex, Jellyfin or Emby library** to chance.

### ✨ What the software does

| | |
|---|---|
| 🔍 **Pre-check** | Drag & drop · Magic-bytes validation · Magika ML deep check (optional) |
| 🛡️ **Integrity check** | Plug-in-based frame analysis via FFmpeg · Auto-escalation on anomalies |
| 🩺 **Diagnostic mode** | Streamcopy + ffprobe deep analysis + decode layer · Cause attribution for DVD, DTS and container anomalies |
| 📊 **Media analysis** | Container · Codec · Bitrate · Resolution · Atmos & DTS:X detection · Bit depth · Channel layout |
| 📋 **Format verification** | **70+ supported formats** · AVC, HEVC, AV1, MPEG-1/2/4, ProRes, DNxHD · AAC, AC3, EAC3, DTS, TrueHD, FLAC |
| 📑 **MAP protocol** | Structured, audit-ready finding report · Diagnostic deep analysis section · Magika sub-block |
| 📡 **Live telemetry** | CPU · RAM · Network · Read rate visible during the check |
| 🌍 **Multilingual** | App: DE · EN · 中文 · Website: DE · EN |
| 🔐 **Verifiable** | Signed builds · SHA-256 hash per release · Local processing, **no cloud** |

### 🆕 New in v1.4.7

- **Diagnostic mode as a regular check mode** with three-stage deep analysis (Streamcopy → ffprobe → Decode). Detects MPEG-1/2, H.264, HEVC and AAC/MP3-specific defects. Automatic escalation on 🟡/🔴 findings.
- **Magika deep check** (Google, Apache 2.0) as a second opinion to magic-bytes verification — reliably detects renamed, masked or corrupted files.
- **MAP protocol** with new section "Diagnostic deep analysis" and Magika sub-block when the plug-in is active.
- **5-stat telemetry** in the status bar: CPU System, CPU check process, RAM, Network, Read rate — live during analysis.
- **Auto-language** on first launch follows the system locale. Theme and language switching on the fly without restart.
- **Microsoft Store** live since v1.4.6 — 2-click install, no Defender prompts.

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
