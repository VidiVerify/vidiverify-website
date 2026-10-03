/**
 * Die Musikseite: vidiverify.de/music.
 *
 * **Wozu.** Das Album „Feel The Sound - VOL. 001" ist Werbung mit
 * Augenzwinkern. Ein nackter ZIP-Link auf Facebook startet am Handy einen
 * Download von 57 MB, den kaum jemand anklickt. Hier kann man erst
 * reinhören, dann laden - und landet nebenbei auf unserer Website.
 *
 * **Wie es ankommt.** `public/music/index.html` trägt die Vorschau für
 * Facebook (Cover, Titel) und leitet auf `/#music` um; `App.tsx` zeigt dann
 * diese Seite für sich, wie die Zahlungsseite. Die Adresse wird gleich danach
 * wieder auf `/music` gesetzt, damit ein weitergeteilter Link die
 * Album-Vorschau trägt und nicht die der Startseite.
 *
 * **Die Dateien.** Zum Hören liegen 192-kbit-Fassungen ohne eingebettetes
 * Cover unter `public/music/vol-001/` - auf derselben Domain, damit die
 * Spektralanzeige (Web Audio) ohne CORS-Freigabe arbeitet. Das Album in
 * voller Qualität liegt als ZIP im Release des Repos `vidiverify-music`.
 * Die Wellenformen sind beim Aufbereiten vorberechnet (`vol001.json`), die
 * Seite muss keine MP3 laden, um sie zu zeichnen.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
   Check, Disc3, Download, Pause, Play, Share2, SkipBack, SkipForward,
   Volume2, VolumeX,
} from "lucide-react";
import { TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import { spracheAus } from "@components/ui/proKaufTexte";
import TRACKS from "./vol001.json";

interface Track {
   nr: string;
   titel: string;
   dauer: number;
   genre: string;
   datei: string;
   wellen: number[];
}

const LISTE = TRACKS as Track[];
const ZIP_URL =
   "https://github.com/VidiVerify/vidiverify-music/releases/download/vol-001/"
   + "VidiVerify-Feel-The-Sound-VOL-001.zip";
const COVER = "/music/vol-001/cover.jpg";
const COVER_WEBP = "/music/vol-001/cover.webp";
const SEITE = "https://vidiverify.de/music";

/* Die Farben des Covers: Magenta über Violett nach Blau. Sie kommen nur auf
 * dieser Seite vor und tragen den Disco-Ton; Hintergrund, Glas und Schrift
 * bleiben die der Website. */
const PINK = "#ff3ea5";
const VIOLETT = "#9b5cff";
const BLAU = "#3fb6ff";
const VERLAUF = `linear-gradient(90deg, ${PINK}, ${VIOLETT} 55%, ${BLAU})`;

const GESAMT = LISTE.reduce((s, t) => s + t.dauer, 0);

const TEXTE = {
   de: {
      praesentiert: "VidiVerify Signal Records präsentiert",
      untertitel: "Die Features. Der Soundtrack.",
      art: "Digitales Album",
      tracks: "Tracks",
      sprachen: "Deutsch & Englisch",
      erschienen: "Erschienen 02.10.2026",
      abspielen: "Album abspielen",
      pause: "Pause",
      laden: "Album herunterladen",
      ladenHinweis: "ZIP · 57 MB · 10 MP3s, Cover und Titelliste",
      teilen: "Teilen",
      kopiert: "Link kopiert",
      titelliste: "Titelliste",
      spalteTitel: "Titel",
      spalteGenre: "Genre",
      spalteDauer: "Länge",
      trackLaden: "Diesen Track als MP3 laden",
      spielen: "Abspielen",
      zurueck: "Vorheriger Track",
      weiter: "Nächster Track",
      ton: "Ton an/aus",
      lautstaerke: "Lautstärke",
      wellen: "Wellenform - klicken zum Springen",
      frage: "Welcher Track bleibt bei dir hängen?",
      frageText:
         "Schreib es uns auf Facebook oder per Email. Und wenn dir nach dem "
         + "Hören nach Ordnung in der Mediathek ist: Dafür haben wir die "
         + "Software gebaut.",
      software: "Zu VidiVerify",
      credits: "Credits",
      komposition: "Komposition",
      produktion: "Produktion",
      label: "Label",
      format: "Format",
      formatWert: "Digitales Album · 10 Tracks · MP3",
      leer: "Wähle einen Track",
      teilenText: "FEEL THE SOUND - VOL. 001: der Soundtrack zu VidiVerify.",
   },
   en: {
      praesentiert: "VidiVerify Signal Records presents",
      untertitel: "The features. The soundtrack.",
      art: "Digital album",
      tracks: "tracks",
      sprachen: "German & English",
      erschienen: "Released 2 Oct 2026",
      abspielen: "Play album",
      pause: "Pause",
      laden: "Download album",
      ladenHinweis: "ZIP · 57 MB · 10 MP3s, cover and track list",
      teilen: "Share",
      kopiert: "Link copied",
      titelliste: "Track list",
      spalteTitel: "Title",
      spalteGenre: "Genre",
      spalteDauer: "Time",
      trackLaden: "Download this track as MP3",
      spielen: "Play",
      zurueck: "Previous track",
      weiter: "Next track",
      ton: "Mute/unmute",
      lautstaerke: "Volume",
      wellen: "Waveform - click to seek",
      frage: "Which track sticks with you?",
      frageText:
         "Tell us on Facebook or by email. And if listening makes you want a "
         + "tidy media library: that is what we built the software for.",
      software: "Discover VidiVerify",
      credits: "Credits",
      komposition: "Composition",
      produktion: "Production",
      label: "Label",
      format: "Format",
      formatWert: "Digital album · 10 tracks · MP3",
      leer: "Pick a track",
      teilenText: "FEEL THE SOUND - VOL. 001: the soundtrack to VidiVerify.",
   },
};

function zeit(s: number): string {
   if (!Number.isFinite(s) || s < 0) s = 0;
   const m = Math.floor(s / 60);
   const r = Math.floor(s % 60);
   return `${m}:${r.toString().padStart(2, "0")}`;
}

/** Zählt einen Klick in GoatCounter, falls das Skript geladen ist. */
function zaehlen(pfad: string) {
   const gc = (window as unknown as {
      goatcounter?: { count?: (o: { path: string; event: boolean }) => void };
   }).goatcounter;
   try { gc?.count?.({ path: pfad, event: true }); } catch { /* egal */ }
}

/* ===== Wellenform ===== */

interface WelleProps {
   werte: number[];
   anteil: number;
   aktiv: boolean;
   hoehe: number;
   label: string;
   onSprung?: (anteil: number) => void;
   id: string;
}

/** Vorberechnete Wellenform; der gespielte Teil leuchtet im Coververlauf. */
function Welle({ werte, anteil, aktiv, hoehe, label, onSprung, id }: WelleProps) {
   const n = werte.length;
   const breite = n * 3;
   const klick = (e: React.MouseEvent<SVGSVGElement>) => {
      if (!onSprung) return;
      const r = e.currentTarget.getBoundingClientRect();
      onSprung(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
   };
   const taste = (e: React.KeyboardEvent<SVGSVGElement>) => {
      if (!onSprung) return;
      if (e.key === "ArrowRight") { e.preventDefault(); onSprung(Math.min(1, anteil + 0.05)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); onSprung(Math.max(0, anteil - 0.05)); }
   };
   const balken = werte.map((v, i) => {
      const h = Math.max(1.5, v * hoehe);
      return <rect key={i} x={i * 3} y={(hoehe - h) / 2} width={2} height={h} rx={1} />;
   });
   return (
      <svg
         viewBox={`0 0 ${breite} ${hoehe}`}
         preserveAspectRatio="none"
         width="100%"
         height={hoehe}
         onClick={klick}
         onKeyDown={taste}
         role="slider"
         aria-label={label}
         aria-valuemin={0}
         aria-valuemax={100}
         aria-valuenow={Math.round(anteil * 100)}
         tabIndex={onSprung ? 0 : -1}
         style={{ display: "block", cursor: onSprung ? "pointer" : "default" }}
      >
         <defs>
            <linearGradient id={`vvm-g-${id}`} x1="0" x2="1" y1="0" y2="0">
               <stop offset="0%" stopColor={PINK} />
               <stop offset="55%" stopColor={VIOLETT} />
               <stop offset="100%" stopColor={BLAU} />
            </linearGradient>
            <clipPath id={`vvm-c-${id}`}>
               <rect x={0} y={0} width={breite * anteil} height={hoehe} />
            </clipPath>
         </defs>
         <g fill={aktiv ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.13)"}>{balken}</g>
         {anteil > 0 && (
            <g fill={`url(#vvm-g-${id})`} clipPath={`url(#vvm-c-${id})`}>{balken}</g>
         )}
      </svg>
   );
}

/* ===== Spektralanzeige ===== */

/** Live-Balken aus dem laufenden Ton. Ruht, solange nichts spielt. */
function Spektrum({ analyser, laeuft }: { analyser: AnalyserNode | null; laeuft: boolean }) {
   const ref = useRef<HTMLCanvasElement>(null);
   useEffect(() => {
      const c = ref.current;
      if (!c || !analyser) return;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const daten = new Uint8Array(analyser.frequencyBinCount);
      const BALKEN = 28;
      let rahmen = 0;
      const malen = () => {
         const w = c.width, h = c.height;
         ctx.clearRect(0, 0, w, h);
         analyser.getByteFrequencyData(daten);
         const verlauf = ctx.createLinearGradient(0, h, 0, 0);
         verlauf.addColorStop(0, PINK);
         verlauf.addColorStop(0.6, VIOLETT);
         verlauf.addColorStop(1, BLAU);
         ctx.fillStyle = verlauf;
         const bw = w / BALKEN;
         for (let i = 0; i < BALKEN; i++) {
            // Logarithmisch verteilt: Bässe und Mitten bekommen mehr Balken.
            const a = Math.floor(Math.pow(i / BALKEN, 1.7) * daten.length * 0.7);
            const b = Math.max(a + 1, Math.floor(Math.pow((i + 1) / BALKEN, 1.7) * daten.length * 0.7));
            let s = 0;
            for (let k = a; k < b; k++) s += daten[k];
            const v = s / (b - a) / 255;
            const bh = Math.max(2, v * h);
            ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
         }
         if (laeuft) rahmen = requestAnimationFrame(malen);
      };
      malen();
      return () => cancelAnimationFrame(rahmen);
   }, [analyser, laeuft]);
   return <canvas ref={ref} width={140} height={36} aria-hidden="true"
                  style={{ width: 140, height: 36, opacity: laeuft ? 1 : 0.35 }} />;
}

/* ===== Seite ===== */

export default function MusicSeite() {
   const { i18n } = useTranslation();
   const t = TEXTE[spracheAus(i18n.language)];

   const audio = useRef<HTMLAudioElement>(null);
   const [aktuell, setAktuell] = useState<number | null>(null);
   const [laeuft, setLaeuft] = useState(false);
   const [pos, setPos] = useState(0);
   const [laenge, setLaenge] = useState(0);
   const [lautstaerke, setLautstaerke] = useState(0.85);
   const [stumm, setStumm] = useState(false);
   const [kopiert, setKopiert] = useState(false);
   const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
   const tonKette = useRef<AudioContext | null>(null);

   /* Die Adresse zurück auf `/music`. Die Weiterleitung aus
    * `public/music/index.html` kommt mit `/#music` an; wer DIESE Adresse
    * teilt, bekäme in Facebook die Vorschau der Startseite. */
   useEffect(() => {
      if (window.location.hash === "#music") {
         history.replaceState(null, "", "/music" + window.location.search);
      }
      const alt = document.title;
      document.title = "FEEL THE SOUND - VOL. 001 | VidiVerify";
      window.scrollTo(0, 0);
      return () => { document.title = alt; };
   }, []);

   /* Web Audio erst beim ersten Abspielen: Browser lassen einen
    * AudioContext ohne Nutzeraktion nicht anlaufen. Schlägt es fehl, spielt
    * die Musik trotzdem - nur ohne Spektrum. */
   const tonAnschliessen = useCallback(() => {
      const el = audio.current;
      if (!el) return;
      try {
         if (!tonKette.current) {
            const Ctor = window.AudioContext
               ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!Ctor) return;
            const ctx = new Ctor();
            const quelle = ctx.createMediaElementSource(el);
            const an = ctx.createAnalyser();
            an.fftSize = 512;
            an.smoothingTimeConstant = 0.78;
            quelle.connect(an);
            an.connect(ctx.destination);
            tonKette.current = ctx;
            setAnalyser(an);
         }
         if (tonKette.current.state === "suspended") void tonKette.current.resume();
      } catch {
         /* ohne Spektrum weiter */
      }
   }, []);

   const spiele = useCallback((i: number) => {
      const el = audio.current;
      if (!el) return;
      tonAnschliessen();
      if (aktuell === i) {
         if (el.paused) void el.play(); else el.pause();
         return;
      }
      setAktuell(i);
      setPos(0);
      setLaenge(LISTE[i].dauer);
      el.src = LISTE[i].datei;
      void el.play().catch(() => setLaeuft(false));
      zaehlen(`music/play/${LISTE[i].nr}`);
   }, [aktuell, tonAnschliessen]);

   const umschalten = useCallback(() => {
      if (aktuell === null) { spiele(0); return; }
      spiele(aktuell);
   }, [aktuell, spiele]);

   const naechster = useCallback(() => {
      if (aktuell === null) return;
      if (aktuell < LISTE.length - 1) spiele(aktuell + 1);
   }, [aktuell, spiele]);

   const voriger = useCallback(() => {
      const el = audio.current;
      if (aktuell === null || !el) return;
      // Wie jeder Player: erst an den Anfang, beim zweiten Druck zurück.
      if (el.currentTime > 3 || aktuell === 0) { el.currentTime = 0; return; }
      spiele(aktuell - 1);
   }, [aktuell, spiele]);

   const springe = useCallback((i: number, anteil: number) => {
      const el = audio.current;
      if (!el) return;
      if (aktuell !== i) {
         spiele(i);
         const ziel = anteil * LISTE[i].dauer;
         const nachLaden = () => { el.currentTime = ziel; el.removeEventListener("loadedmetadata", nachLaden); };
         el.addEventListener("loadedmetadata", nachLaden);
         return;
      }
      el.currentTime = anteil * (el.duration || LISTE[i].dauer);
      setPos(el.currentTime);
   }, [aktuell, spiele]);

   // Audio-Ereignisse
   useEffect(() => {
      const el = audio.current;
      if (!el) return;
      const an = () => setLaeuft(true);
      const aus = () => setLaeuft(false);
      const zeitLauf = () => setPos(el.currentTime);
      const meta = () => setLaenge(el.duration || 0);
      el.addEventListener("play", an);
      el.addEventListener("pause", aus);
      el.addEventListener("timeupdate", zeitLauf);
      el.addEventListener("loadedmetadata", meta);
      return () => {
         el.removeEventListener("play", an);
         el.removeEventListener("pause", aus);
         el.removeEventListener("timeupdate", zeitLauf);
         el.removeEventListener("loadedmetadata", meta);
      };
   }, []);

   // Am Ende eines Tracks geht es mit dem nächsten weiter - wie eine Platte.
   useEffect(() => {
      const el = audio.current;
      if (!el) return;
      const ende = () => {
         if (aktuell !== null && aktuell < LISTE.length - 1) spiele(aktuell + 1);
         else setLaeuft(false);
      };
      el.addEventListener("ended", ende);
      return () => el.removeEventListener("ended", ende);
   }, [aktuell, spiele]);

   useEffect(() => {
      if (audio.current) audio.current.volume = stumm ? 0 : lautstaerke;
   }, [lautstaerke, stumm]);

   /* Sperrbildschirm und Kopfhörertasten am Handy: Titel, Cover und
    * Vor/Zurück wie bei einer Musik-App. */
   useEffect(() => {
      if (!("mediaSession" in navigator) || aktuell === null) return;
      const tr = LISTE[aktuell];
      navigator.mediaSession.metadata = new MediaMetadata({
         title: tr.titel,
         artist: "VidiVerify",
         album: "Feel The Sound - Vol. 001",
         artwork: [{ src: COVER, sizes: "900x900", type: "image/jpeg" }],
      });
      navigator.mediaSession.setActionHandler("play", () => void audio.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audio.current?.pause());
      navigator.mediaSession.setActionHandler("nexttrack", naechster);
      navigator.mediaSession.setActionHandler("previoustrack", voriger);
   }, [aktuell, naechster, voriger]);

   // Leertaste spielt und pausiert, ausser in Eingabefeldern und auf Knöpfen.
   useEffect(() => {
      const taste = (e: KeyboardEvent) => {
         if (e.code !== "Space") return;
         const z = e.target as HTMLElement;
         if (z.closest("input, textarea, button, a, [role=slider], [contenteditable]")) return;
         e.preventDefault();
         umschalten();
      };
      window.addEventListener("keydown", taste);
      return () => window.removeEventListener("keydown", taste);
   }, [umschalten]);

   useEffect(() => () => { void tonKette.current?.close(); }, []);

   const teilen = async () => {
      zaehlen("music/share");
      const daten = { title: "FEEL THE SOUND - VOL. 001", text: t.teilenText, url: SEITE };
      try {
         if (navigator.share) { await navigator.share(daten); return; }
      } catch { return; /* abgebrochen */ }
      try {
         await navigator.clipboard.writeText(SEITE);
         setKopiert(true);
         setTimeout(() => setKopiert(false), 2200);
      } catch { /* kein Zugriff */ }
   };

   const track = aktuell !== null ? LISTE[aktuell] : null;
   const anteil = track && laenge ? Math.min(1, pos / laenge) : 0;
   const gesamtMin = useMemo(() => Math.round(GESAMT / 60), []);

   return (
      <main className="vvm">
         <style>{CSS}</style>
         {/* Musik ohne Sprechtext: Untertitel gibt es nicht. Die Titel
             stehen in der Liste und in der Player-Leiste. */}
         {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
         <audio ref={audio} preload="none" />

         {/* ===== Kopf ===== */}
         <section className="vvm-kopf">
            <div className="vvm-kopf-bild" aria-hidden="true" />
            <div className="vvm-kopf-schleier" aria-hidden="true" />
            <div className="vvm-rahmen vvm-kopf-inhalt">
               <div className={`vvm-platte ${laeuft ? "dreht" : ""}`}>
                  <div className="vvm-vinyl" aria-hidden="true">
                     <div className="vvm-vinyl-label" style={{ backgroundImage: `url(${COVER})` }} />
                  </div>
                  <picture>
                     <source srcSet={COVER_WEBP} type="image/webp" />
                     <img src={COVER} width={900} height={900} className="vvm-cover"
                          alt="Cover: FEEL THE SOUND - VOL. 001, VidiVerify" />
                  </picture>
               </div>

               <div className="vvm-info">
                  <p className="vvm-kicker">{t.praesentiert}</p>
                  <h1 className="vvm-titel">
                     <span>FEEL THE</span> <span className="vvm-verlauf">SOUND</span>
                  </h1>
                  <p className="vvm-vol">VOL. 001 <span>·</span> {t.untertitel}</p>
                  <ul className="vvm-chips">
                     <li><Disc3 size={13} /> {t.art}</li>
                     <li>10 {t.tracks} · {gesamtMin} Min</li>
                     <li>{t.sprachen}</li>
                     <li>Pop</li>
                     <li>{t.erschienen}</li>
                  </ul>
                  <div className="vvm-knoepfe">
                     <button type="button" className="vvm-knopf vvm-knopf-haupt" onClick={umschalten}>
                        {laeuft ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        {laeuft ? t.pause : t.abspielen}
                     </button>
                     <a className="vvm-knopf vvm-knopf-laden" href={ZIP_URL}
                        onClick={() => zaehlen("music/download/zip")}>
                        <Download size={18} />
                        <span>
                           {t.laden}
                           <small>{t.ladenHinweis}</small>
                        </span>
                     </a>
                     <button type="button" className="vvm-knopf vvm-knopf-rund" onClick={teilen}
                             aria-label={t.teilen} title={kopiert ? t.kopiert : t.teilen}>
                        {kopiert ? <Check size={18} /> : <Share2 size={18} />}
                     </button>
                  </div>
                  <p className="vvm-motto">
                     <span style={{ color: PINK }}>HEAR IT.</span> ANALYZE IT.{" "}
                     <span style={{ color: BLAU }}>TRUST IT.</span>
                  </p>
               </div>
            </div>
         </section>

         {/* ===== Titelliste ===== */}
         <section className="vvm-rahmen vvm-liste-bereich">
            <h2 className="vvm-h2">{t.titelliste}</h2>
            <div className="vvm-liste" role="list">
               <div className="vvm-zeile vvm-kopfzeile" aria-hidden="true">
                  <span>#</span><span>{t.spalteTitel}</span><span className="vvm-nur-breit" />
                  <span className="vvm-nur-mittel">{t.spalteGenre}</span>
                  <span style={{ textAlign: "right" }}>{t.spalteDauer}</span><span />
               </div>
               {LISTE.map((tr, i) => {
                  const istAktiv = aktuell === i;
                  const spielt = istAktiv && laeuft;
                  return (
                     <div key={tr.nr} role="listitem"
                          className={`vvm-zeile ${istAktiv ? "aktiv" : ""}`}
                          onDoubleClick={() => spiele(i)}>
                        <button type="button" className="vvm-nr" onClick={() => spiele(i)}
                                aria-label={`${spielt ? t.pause : t.spielen}: ${tr.titel}`}>
                           <span className="vvm-nr-zahl">{spielt ? <Equalizer /> : tr.nr}</span>
                           <span className="vvm-nr-icon">
                              {spielt ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                           </span>
                        </button>
                        <div className="vvm-name">
                           <strong>{tr.titel}</strong>
                           <span>VidiVerify</span>
                        </div>
                        <div className="vvm-nur-breit">
                           <Welle id={`z${tr.nr}`} werte={tr.wellen} hoehe={34} aktiv={istAktiv}
                                  anteil={istAktiv ? anteil : 0} label={`${t.wellen}: ${tr.titel}`}
                                  onSprung={(a) => springe(i, a)} />
                        </div>
                        <span className="vvm-nur-mittel vvm-genre">{tr.genre}</span>
                        <span className="vvm-dauer">{zeit(tr.dauer)}</span>
                        <a className="vvm-track-laden" href={tr.datei}
                           download={`VidiVerify - ${tr.nr} - ${tr.titel}.mp3`}
                           title={t.trackLaden} aria-label={`${t.trackLaden}: ${tr.titel}`}
                           onClick={() => zaehlen(`music/download/${tr.nr}`)}>
                           <Download size={15} />
                        </a>
                     </div>
                  );
               })}
            </div>
         </section>

         {/* ===== Credits und Rückweg zur Software ===== */}
         <section className="vvm-rahmen vvm-unten">
            <div className="vvm-karte">
               <h2 className="vvm-h2">{t.frage}</h2>
               <p>{t.frageText}</p>
               <a className="vvm-knopf vvm-knopf-zweit" href="/">{t.software}</a>
            </div>
            <div className="vvm-karte">
               <h2 className="vvm-h2">{t.credits}</h2>
               <dl className="vvm-credits">
                  <dt>{t.komposition}</dt><dd>VidiVerify-Team · Gera</dd>
                  <dt>{t.produktion}</dt><dd>VidiVerify Studios Gera</dd>
                  <dt>{t.label}</dt><dd>VidiVerify Signal Records</dd>
                  <dt>{t.format}</dt><dd>{t.formatWert}</dd>
               </dl>
            </div>
         </section>

         {/* ===== Player-Leiste ===== */}
         {/* `inert`, solange kein Track gewählt ist: Die Leiste steht dann
             unterhalb des Bildrands, ihre Knöpfe sollen nicht per Tab
             erreichbar sein. */}
         <div className={`vvm-player ${track ? "da" : ""}`} inert={!track}>
            <div className="vvm-player-innen">
               <div className="vvm-player-track">
                  <img src={COVER} alt="" width={48} height={48} />
                  <div>
                     <strong>{track?.titel ?? t.leer}</strong>
                     <span>VidiVerify · VOL. 001</span>
                  </div>
               </div>
               <div className="vvm-player-mitte">
                  <div className="vvm-steuer">
                     <button type="button" onClick={voriger} aria-label={t.zurueck}><SkipBack size={18} fill="currentColor" /></button>
                     <button type="button" className="vvm-play" onClick={umschalten}
                             aria-label={laeuft ? t.pause : t.spielen}>
                        {laeuft ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                     </button>
                     <button type="button" onClick={naechster} aria-label={t.weiter}
                             disabled={aktuell === LISTE.length - 1}><SkipForward size={18} fill="currentColor" /></button>
                  </div>
                  <div className="vvm-zeitleiste">
                     <span>{zeit(pos)}</span>
                     <div className="vvm-player-welle">
                        {track && (
                           <Welle id="player" werte={track.wellen} hoehe={28} aktiv anteil={anteil}
                                  label={t.wellen} onSprung={(a) => aktuell !== null && springe(aktuell, a)} />
                        )}
                     </div>
                     <span>{zeit(laenge || track?.dauer || 0)}</span>
                  </div>
               </div>
               <div className="vvm-player-rechts">
                  <Spektrum analyser={analyser} laeuft={laeuft} />
                  <button type="button" onClick={() => setStumm((s) => !s)} aria-label={t.ton}>
                     {stumm || lautstaerke === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <input type="range" min={0} max={1} step={0.01} value={stumm ? 0 : lautstaerke}
                         aria-label={t.lautstaerke}
                         onChange={(e) => { setLautstaerke(Number(e.target.value)); setStumm(false); }} />
               </div>
            </div>
         </div>
      </main>
   );
}

/** Drei hüpfende Balken für den laufenden Track in der Liste. */
function Equalizer() {
   return (
      <span className="vvm-eq" aria-hidden="true">
         <i /><i /><i />
      </span>
   );
}

const CSS = `
.vvm { color: ${TEXT_PRIMARY}; padding-bottom: 120px; }
.vvm-rahmen { max-width: 1152px; margin: 0 auto; padding: 0 24px; }

/* Kopf */
.vvm-kopf { position: relative; overflow: hidden; padding: 128px 0 72px; }
/* Bühnenlicht in den Coverfarben statt eines unscharfen Coverbilds: Ein
 * Weichzeichner über die ganze Fläche zeigte an den Rändern harte Kanten. */
.vvm-kopf-bild { position: absolute; inset: 0;
   background:
      radial-gradient(ellipse 45% 60% at 18% 35%, rgba(255,62,165,.22), transparent 70%),
      radial-gradient(ellipse 40% 55% at 85% 20%, rgba(63,182,255,.18), transparent 70%),
      radial-gradient(ellipse 50% 50% at 55% 70%, rgba(155,92,255,.12), transparent 70%); }
.vvm-kopf-schleier { position: absolute; inset: 0;
   background: linear-gradient(180deg, transparent 55%, #060610 100%); }
.vvm-kopf-inhalt { position: relative; display: grid; grid-template-columns: minmax(260px, 420px) 1fr;
   gap: 120px; align-items: center; }

.vvm-platte { position: relative; aspect-ratio: 1; }
.vvm-cover { position: relative; z-index: 2; width: 100%; height: auto; border-radius: 10px;
   box-shadow: 0 30px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.08), 0 0 70px rgba(155,92,255,.18); }
.vvm-vinyl { position: absolute; z-index: 1; top: 4%; left: 4%; width: 92%; height: 92%; border-radius: 50%;
   background: repeating-radial-gradient(circle, #14141c 0 2px, #262632 2px 3px);
   box-shadow: 0 20px 50px rgba(0,0,0,.6), 0 0 40px rgba(155,92,255,.18), inset 0 0 0 2px rgba(255,255,255,.12);
   transition: transform .9s cubic-bezier(.22,1,.36,1); display: grid; place-items: center; }
.vvm-vinyl::after { content: ""; position: absolute; inset: 0; border-radius: 50%;
   background: conic-gradient(from 30deg, transparent 0 20%, rgba(255,255,255,.07) 25%, transparent 32% 70%, rgba(255,255,255,.05) 75%, transparent 82%); }
.vvm-vinyl-label { width: 36%; height: 36%; border-radius: 50%; background-size: 280%; background-position: center 30%;
   box-shadow: 0 0 0 4px #0d0d12; position: relative; }
.vvm-vinyl-label::after { content: ""; position: absolute; left: 50%; top: 50%; width: 9%; height: 9%;
   transform: translate(-50%,-50%); border-radius: 50%; background: #060610; }
.vvm-platte:hover .vvm-vinyl, .vvm-platte.dreht .vvm-vinyl { transform: translateX(24%); }
.vvm-platte.dreht .vvm-vinyl { animation: vvm-dreh 1.8s linear infinite; }
@keyframes vvm-dreh { from { transform: translateX(24%) rotate(0); } to { transform: translateX(24%) rotate(360deg); } }

.vvm-kicker { font-family: "JetBrains Mono Variable", monospace; font-size: 12px; letter-spacing: .22em;
   text-transform: uppercase; color: ${TEXT_SECONDARY}; margin-bottom: 14px; }
.vvm-titel { font-size: clamp(48px, 8vw, 96px); line-height: .92; font-weight: 900; letter-spacing: -.03em;
   font-style: italic; margin-bottom: 14px; }
.vvm-verlauf { background: ${VERLAUF}; -webkit-background-clip: text; background-clip: text; color: transparent;
   padding-right: .08em; }
.vvm-vol { font-size: 18px; font-weight: 700; color: ${TEXT_PRIMARY}; margin-bottom: 20px; }
.vvm-vol span { color: ${PINK}; margin: 0 6px; }
.vvm-chips { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
.vvm-chips li { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; color: ${TEXT_SECONDARY};
   padding: 5px 11px; border-radius: 999px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); }
.vvm-knoepfe { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.vvm-knopf { display: inline-flex; align-items: center; gap: 10px; border: none; cursor: pointer; font-family: inherit;
   font-weight: 700; font-size: 15px; color: #fff; border-radius: 999px; padding: 14px 24px;
   transition: transform .2s, box-shadow .2s, background .2s; text-decoration: none; }
.vvm-knopf:hover { transform: translateY(-2px); }
.vvm-knopf-haupt { background: ${VERLAUF}; box-shadow: 0 10px 30px rgba(255,62,165,.28), inset 0 1px 0 rgba(255,255,255,.3); }
.vvm-knopf-haupt:hover { box-shadow: 0 14px 40px rgba(155,92,255,.4), inset 0 1px 0 rgba(255,255,255,.3); }
.vvm-knopf-laden { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); padding: 9px 22px 9px 18px;
   backdrop-filter: blur(12px); }
.vvm-knopf-laden span { display: flex; flex-direction: column; line-height: 1.25; }
.vvm-knopf-laden small { font-size: 11px; font-weight: 500; color: ${TEXT_SECONDARY}; }
.vvm-knopf-laden:hover { background: rgba(255,255,255,.1); border-color: rgba(63,182,255,.5); }
.vvm-knopf-rund { width: 48px; height: 48px; padding: 0; justify-content: center;
   background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14); }
.vvm-knopf-zweit { background: rgba(106,172,204,.12); border: 1px solid rgba(106,172,204,.35); font-size: 14px; padding: 11px 20px; }
.vvm-motto { margin-top: 26px; font-family: "JetBrains Mono Variable", monospace; font-size: 12px; letter-spacing: .2em;
   color: ${TEXT_PRIMARY}; font-weight: 700; }

/* Liste */
.vvm-liste-bereich { margin-top: 8px; }
.vvm-h2 { font-size: 22px; font-weight: 800; margin-bottom: 16px; letter-spacing: -.01em; }
.vvm-liste { border-radius: 14px; background: rgba(15,15,35,.5); border: 1px solid rgba(255,255,255,.06);
   backdrop-filter: blur(16px); overflow: hidden; }
.vvm-zeile { display: grid; grid-template-columns: 44px minmax(160px, 1.1fr) minmax(200px, 1.6fr) 70px 54px 36px;
   gap: 14px; align-items: center; padding: 10px 16px; border-top: 1px solid rgba(255,255,255,.045);
   transition: background .15s; }
.vvm-zeile:first-child { border-top: none; }
.vvm-zeile:not(.vvm-kopfzeile):hover { background: rgba(255,255,255,.035); }
.vvm-zeile.aktiv { background: linear-gradient(90deg, rgba(255,62,165,.09), rgba(63,182,255,.05)); }
.vvm-kopfzeile { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: ${TEXT_MUTED}; padding: 12px 16px; }
.vvm-nr { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: ${TEXT_SECONDARY};
   cursor: pointer; display: grid; place-items: center; font-family: "JetBrains Mono Variable", monospace; font-size: 13px; }
.vvm-nr-icon { display: none; color: #fff; }
.vvm-zeile:hover .vvm-nr-zahl, .vvm-nr:focus-visible .vvm-nr-zahl { display: none; }
.vvm-zeile:hover .vvm-nr-icon, .vvm-nr:focus-visible .vvm-nr-icon { display: grid; }
.vvm-zeile:hover .vvm-nr { background: ${VERLAUF}; }
.vvm-zeile.aktiv .vvm-nr-zahl { color: ${PINK}; }
.vvm-name { min-width: 0; display: flex; flex-direction: column; }
.vvm-name strong { font-size: 14.5px; font-weight: 650; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vvm-name span { font-size: 12px; color: ${TEXT_MUTED}; }
.vvm-zeile.aktiv .vvm-name strong { color: #fff; }
.vvm-genre { font-size: 12.5px; color: ${TEXT_SECONDARY}; }
.vvm-dauer { font-family: "JetBrains Mono Variable", monospace; font-size: 13px; color: ${TEXT_SECONDARY}; text-align: right; }
.vvm-track-laden { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; color: ${TEXT_MUTED};
   transition: color .15s, background .15s; }
.vvm-track-laden:hover { color: #fff; background: rgba(255,255,255,.08); }

.vvm-eq { display: inline-flex; gap: 2px; align-items: flex-end; height: 14px; }
.vvm-eq i { width: 3px; background: ${PINK}; border-radius: 1px; animation: vvm-eq .9s ease-in-out infinite; }
.vvm-eq i:nth-child(2) { animation-delay: -.3s; background: ${VIOLETT}; }
.vvm-eq i:nth-child(3) { animation-delay: -.6s; background: ${BLAU}; }
@keyframes vvm-eq { 0%,100% { height: 4px; } 50% { height: 14px; } }

/* Unten */
.vvm-unten { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: 48px; }
.vvm-karte { border-radius: 14px; padding: 26px; background: rgba(15,15,35,.5); border: 1px solid rgba(255,255,255,.06); }
.vvm-karte p { color: ${TEXT_SECONDARY}; font-size: 14.5px; line-height: 1.7; margin-bottom: 18px; }
.vvm-credits { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; font-size: 14px; }
.vvm-credits dt { color: ${TEXT_MUTED}; }
.vvm-credits dd { color: ${TEXT_PRIMARY}; }

/* Player */
.vvm-player { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; transform: translateY(110%);
   transition: transform .45s cubic-bezier(.22,1,.36,1); background: rgba(10,10,26,.86);
   backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-top: 1px solid rgba(255,255,255,.07);
   box-shadow: 0 -12px 40px rgba(0,0,0,.4); }
.vvm-player.da { transform: none; }
.vvm-player::before { content: ""; position: absolute; left: 0; right: 0; top: -1px; height: 1px; background: ${VERLAUF}; opacity: .7; }
.vvm-player-innen { max-width: 1280px; margin: 0 auto; padding: 10px 24px; display: grid;
   grid-template-columns: minmax(180px, 1fr) minmax(280px, 2fr) minmax(180px, 1fr); gap: 20px; align-items: center; }
.vvm-player button { background: none; border: none; color: ${TEXT_PRIMARY}; cursor: pointer; display: grid; place-items: center;
   width: 34px; height: 34px; border-radius: 50%; }
.vvm-player button:hover:not(:disabled) { color: #fff; background: rgba(255,255,255,.07); }
.vvm-player button:disabled { opacity: .35; cursor: default; }
.vvm-player-track { display: flex; gap: 12px; align-items: center; min-width: 0; }
.vvm-player-track img { width: 48px; height: 48px; border-radius: 6px; flex-shrink: 0; }
.vvm-player-track div { min-width: 0; display: flex; flex-direction: column; }
.vvm-player-track strong { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vvm-player-track span { font-size: 12px; color: ${TEXT_MUTED}; }
.vvm-player-mitte { display: flex; flex-direction: column; gap: 4px; }
.vvm-steuer { display: flex; justify-content: center; gap: 10px; align-items: center; }
.vvm-player .vvm-play { width: 40px; height: 40px; background: ${VERLAUF}; color: #fff; }
.vvm-player .vvm-play:hover { background: ${VERLAUF}; filter: brightness(1.15); }
.vvm-zeitleiste { display: grid; grid-template-columns: 40px 1fr 40px; gap: 10px; align-items: center;
   font-family: "JetBrains Mono Variable", monospace; font-size: 11.5px; color: ${TEXT_SECONDARY}; }
.vvm-zeitleiste span:last-child { text-align: right; }
.vvm-player-welle { min-height: 28px; }
.vvm-player-rechts { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.vvm-player-rechts input { width: 90px; accent-color: ${VIOLETT}; }

/* Schmaler */
@media (max-width: 1023px) {
   .vvm-nur-breit { display: none; }
   .vvm-zeile { grid-template-columns: 44px 1fr 70px 54px 36px; }
   .vvm-player-rechts canvas { display: none; }
}
@media (max-width: 760px) {
   .vvm-kopf { padding: 96px 0 40px; }
   .vvm-kopf-inhalt { grid-template-columns: 1fr; gap: 36px; }
   .vvm-platte { max-width: 300px; width: 78%; margin: 0 auto 0 0; }
   .vvm-rahmen { padding: 0 16px; }
   .vvm-nur-mittel { display: none; }
   .vvm-zeile { grid-template-columns: 40px 1fr 48px 32px; gap: 10px; padding: 10px 10px; }
   .vvm-unten { grid-template-columns: 1fr; }
   .vvm-knopf-laden { flex: 1 1 100%; justify-content: center; order: 3; }
   .vvm-player-innen { grid-template-columns: 1fr auto; gap: 8px 12px; padding: 8px 12px 10px; }
   .vvm-player-mitte { display: contents; }
   .vvm-steuer { grid-column: 2; grid-row: 1; }
   .vvm-zeitleiste { grid-column: 1 / -1; grid-row: 2; }
   .vvm-player-rechts { display: none; }
   .vvm-player-track img { width: 40px; height: 40px; }
}
@media (hover: none) {
   .vvm-nr-icon { display: none !important; }
   .vvm-nr-zahl { display: inline !important; }
   .vvm-zeile:hover .vvm-nr { background: transparent; }
}
@media (prefers-reduced-motion: reduce) {
   .vvm-platte.dreht .vvm-vinyl { animation: none; }
   .vvm-eq i { animation: none; height: 10px; }
}
`;
