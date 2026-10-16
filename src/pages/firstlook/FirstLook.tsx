/**
 * „First Look": die App in Bildern, als geführte Tour.
 *
 * Bewusst kein Laufband wie bei den Formaten. Ein Screenshot lebt von seinen
 * Details (Ampel, Kacheln, Spektrum), und die gehen bei Kachelgrösse unter.
 * Deshalb eine Bühne mit einem grossen Bild, darunter die Kapitel als
 * Filmstreifen aus kleinen, geschärften Ausschnitten. Ein Klick aufs grosse
 * Bild öffnet die Vollansicht.
 *
 * Die Fenster stehen in ihrer eigenen Grösse da, ohne nachgebauten Rahmen:
 * Ein Qt-Dialog von 460 Pixeln bleibt ein Qt-Dialog von 460 Pixeln. Was die
 * Bühne füllt, ist das Ambilight - eine stark weichgezeichnete Kopie des
 * Bildes dahinter, die in dessen eigenen Farben strahlt.
 *
 * Die Bilder erzeugt `scripts/firstlook-bilder.mjs` aus den Handbuch-
 * Screenshots, je Sprache eigene: Die englische Seite zeigt die englische App.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useInView } from "react-intersection-observer";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import PageSection from "@components/layout/PageSection";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import { useFensterStapel } from "@utils/useFensterStapel";
import bilder from "./bilder.json";

type Sprache = "de" | "en";
type Masse = { w: number; h: number };

const KAPITEL = bilder.reihenfolge;

// Weiterblättern, solange niemand eingreift. Wer selbst klickt, hat die Tour
// übernommen - ab dann blättert nichts mehr von allein.
const TAKT_MS = 6500;

// Die Bühne hat das Format der meisten Hauptfenster-Screenshots (1252×683),
// damit die Seite beim Blättern nicht springt. Hochformate (Protokollseite)
// und kleine Dialoge (QuickCheck) stehen mittig darin.
//
// Die Höhe richtet sich nach dem Bildschirm: Überschrift, Bild, Erklärung und
// Filmstreifen sollen zusammen sichtbar sein. Was dabei an Grösse fehlt,
// liefert die Vollansicht. BUEHNE_RAND ist alles ausser der Bühne -
// Menüleiste, Abschnittskopf, Erklärung, Filmstreifen - und steht als
// --fl-rand in index.css, weil die Seite auf niedrigen Bildschirmen enger wird.
const BUEHNE_FORMAT = 683 / 1252;
const BUEHNE_MAX_HOEHE = 440;
const BUEHNE_MIN_HOEHE = 160;
const BUEHNE_HOEHE = `max(${BUEHNE_MIN_HOEHE}px, min(${BUEHNE_MAX_HOEHE}px, calc(100svh - var(--fl-rand)), calc(min(100vw - 32px, 1100px) * ${BUEHNE_FORMAT})))`;

/* Die Farbe je Kapitel, abgelesen von dem, was im Bild leuchtet: grüne
 * Ampeln bei der Prüfung, der gelbe Ring im Media Lab. Sie trägt Nummer,
 * Titelverlauf, Chips und den Lichtrand im Filmstreifen. */
const FARBE: Record<string, string> = {
   pruefung: "#22c55e",
   analyse:  "#6aaccc",
   video:    "#38bdf8",
   audio:    "#4f9cf0",
   stapel:   "#f59e0b",
   repair:   "#f97316",
   lab:      "#eab308",
   codeclab: "#10b981",
   bitratelab: "#e6b54a",
   sizelab:  "#60a5fa",
   map:      "#e2e8f0",
   quick:    "#fbbf24",
   windows:  "#7dd3fc",
   plex:     "#f08a24",
};

const bildPfad = (lang: Sprache, key: string, klein = false) =>
   `${import.meta.env.BASE_URL}firstlook/${lang}/${key}${klein ? "-klein" : ""}.webp`;

/** Grösse eines Elements, live. */
function useGroesse<T extends HTMLElement>() {
   const ref = useRef<T>(null);
   const [groesse, setGroesse] = useState({ w: 0, h: 0 });
   useEffect(() => {
      const el = ref.current;
      if (!el) return;
      const ro = new ResizeObserver(([e]) => {
         setGroesse({ w: e.contentRect.width, h: e.contentRect.height });
      });
      ro.observe(el);
      return () => ro.disconnect();
   }, []);
   return [ref, groesse] as const;
}

interface VollansichtProps {
   lang: Sprache;
   index: number | null;
   onClose: () => void;
   onBlaettern: (richtung: 1 | -1) => void;
   onSpringen: (index: number) => void;
}

const Vollansicht = ({ lang, index, onClose, onBlaettern, onSpringen }: VollansichtProps) => {
   const { t } = useTranslation();
   const offen = index !== null;
   const wischStart = useRef<number | null>(null);

   // Escape und die Scrollsperre über den gemeinsamen Fensterstapel.
   useFensterStapel(offen, onClose);

   useEffect(() => {
      if (!offen) return;
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "ArrowRight") { e.preventDefault(); onBlaettern(1); }
         if (e.key === "ArrowLeft") { e.preventDefault(); onBlaettern(-1); }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
   }, [offen, onBlaettern]);

   const key = offen ? KAPITEL[index] : null;
   const masse = key ? (bilder[lang] as Record<string, Masse>)[key] : null;

   const pfeil = (richtung: 1 | -1): React.CSSProperties => ({
      position: "absolute", top: "50%", transform: "translateY(-50%)",
      [richtung === 1 ? "right" : "left"]: 12,
      width: 44, height: 44, borderRadius: 12,
      background: "rgba(10,14,32,0.7)", border: "1px solid rgba(106,172,204,0.3)",
      color: CYAN, display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer", zIndex: 2,
   });

   return createPortal(
      <AnimatePresence>
         {offen && key && masse && (
            <motion.div
               key="firstlook-vollansicht"
               role="dialog"
               aria-modal="true"
               aria-label={t(`firstLook.kapitel.${key}.titel`)}
               data-lenis-prevent
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.22 }}
               // Schliesst nur der Klick ins Leere, nicht der aufs Bild.
               onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
               onTouchStart={(e) => { wischStart.current = e.touches[0].clientX; }}
               onTouchEnd={(e) => {
                  if (wischStart.current === null) return;
                  const weg = e.changedTouches[0].clientX - wischStart.current;
                  wischStart.current = null;
                  if (Math.abs(weg) > 50) onBlaettern(weg < 0 ? 1 : -1);
               }}
               style={{
                  position: "fixed", inset: 0, zIndex: 1100,
                  background: "rgba(6,7,18,0.92)",
                  backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "56px 16px 24px", gap: 14,
               }}
            >
               <button
                  onClick={onClose}
                  aria-label={t("firstLook.schliessen")}
                  style={{
                     position: "absolute", top: 12, right: 12,
                     width: 40, height: 40, borderRadius: 10,
                     background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                     color: TEXT_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center",
                     cursor: "pointer",
                  }}
               >
                  <X size={18} />
               </button>

               <div style={{ position: "relative", maxWidth: "100%", display: "flex", justifyContent: "center" }}>
                  <AnimatePresence mode="wait" initial={false}>
                     <motion.img
                        key={key}
                        src={bildPfad(lang, key)}
                        width={masse.w}
                        height={masse.h}
                        alt={t(`firstLook.kapitel.${key}.titel`)}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        style={{
                           display: "block",
                           width: "auto", height: "auto",
                           maxWidth: "min(100%, 94vw)",
                           maxHeight: "calc(100dvh - 160px)",
                           borderRadius: 10,
                           border: "1px solid rgba(106,172,204,0.25)",
                           boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
                        }}
                     />
                  </AnimatePresence>
               </div>

               <button
                  onClick={(e) => { e.stopPropagation(); onBlaettern(-1); }}
                  aria-label={t("firstLook.zurueck")}
                  style={pfeil(-1)}
               >
                  <ChevronLeft size={22} />
               </button>
               <button
                  onClick={(e) => { e.stopPropagation(); onBlaettern(1); }}
                  aria-label={t("firstLook.weiter")}
                  style={pfeil(1)}
               >
                  <ChevronRight size={22} />
               </button>

               {/* Bildunterschrift: dieselbe Sprache wie die Kapitel auf der Seite,
                 * nur kompakt. Die Segmentleiste ersetzt den Zähler "4/14" und
                 * springt per Klick. */}
               <div className="firstlook-voll-text" style={{ "--fl-farbe": FARBE[key] } as React.CSSProperties}>
                  <AnimatePresence mode="wait" initial={false}>
                     <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                     >
                        <div className="firstlook-voll-kopf">
                           <span className="firstlook-voll-nr">{String(index + 1).padStart(2, "0")}</span>
                           <span className="firstlook-voll-titel">{t(`firstLook.kapitel.${key}.titel`)}</span>
                        </div>
                        <p className="firstlook-voll-erklaerung">{t(`firstLook.kapitel.${key}.text`)}</p>
                     </motion.div>
                  </AnimatePresence>
                  <div className="firstlook-voll-segmente">
                     {KAPITEL.map((k, i) => (
                        <button
                           key={k}
                           onClick={() => onSpringen(i)}
                           aria-label={t(`firstLook.kapitel.${k}.titel`)}
                           aria-current={i === index}
                           className={i === index ? "ist-aktiv" : undefined}
                        />
                     ))}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

const FirstLook = () => {
   const { t, i18n } = useTranslation();
   const lang: Sprache = (i18n.resolvedLanguage ?? i18n.language ?? "de").startsWith("en") ? "en" : "de";
   const ruhig = useReducedMotion();
   const { ref: sichtRef, inView } = useInView({ threshold: 0.35 });
   const [buehneRef, buehne] = useGroesse<HTMLDivElement>();
   const streifenRef = useRef<HTMLDivElement>(null);

   const [aktiv, setAktiv] = useState(0);
   const [vollansicht, setVollansicht] = useState<number | null>(null);
   const [uebernommen, setUebernommen] = useState(false);
   const [schwebt, setSchwebt] = useState(false);

   const laeuft = !ruhig && !uebernommen && !schwebt && inView && vollansicht === null;

   useEffect(() => {
      if (!laeuft) return;
      const id = setTimeout(() => setAktiv((i) => (i + 1) % KAPITEL.length), TAKT_MS);
      return () => clearTimeout(id);
   }, [laeuft, aktiv]);

   // Das aktive Bild im Filmstreifen in die Mitte holen. Nur der Streifen
   // rollt, nicht die Seite - scrollIntoView würde beides bewegen.
   useEffect(() => {
      const streifen = streifenRef.current;
      const bild = streifen?.children[aktiv] as HTMLElement | undefined;
      if (!streifen || !bild) return;
      streifen.scrollTo({
         left: bild.offsetLeft - (streifen.clientWidth - bild.clientWidth) / 2,
         behavior: ruhig ? "auto" : "smooth",
      });
   }, [aktiv, ruhig]);

   const waehlen = (i: number) => {
      setUebernommen(true);
      setAktiv(i);
   };

   // Wer in der Vollansicht blättert, findet nach dem Schliessen dasselbe
   // Bild auf der Bühne vor - deshalb wandert `aktiv` mit.
   const blaettern = useCallback((richtung: 1 | -1) => {
      if (vollansicht === null) return;
      const neu = (vollansicht + richtung + KAPITEL.length) % KAPITEL.length;
      setVollansicht(neu);
      setAktiv(neu);
   }, [vollansicht]);

   const schliessen = useCallback(() => setVollansicht(null), []);

   const springen = useCallback((i: number) => {
      setVollansicht(i);
      setAktiv(i);
   }, []);

   const key = KAPITEL[aktiv];
   const farbe = FARBE[key];
   const masse = (bilder[lang] as Record<string, Masse>)[key];
   const tags = t(`firstLook.kapitel.${key}.tags`, { returnObjects: true }) as string[];
   const nummer = String(aktiv + 1).padStart(2, "0");
   const titel = t(`firstLook.kapitel.${key}.titel`);

   // Das Bild in seiner eigenen Grösse - verkleinert nur, wenn die Bühne
   // es verlangt, vergrössert nie.
   const faktor = buehne.w > 0 ? Math.min(1, buehne.w / masse.w, buehne.h / masse.h) : 0;
   const anzeige = { w: Math.round(masse.w * faktor), h: Math.round(masse.h * faktor) };

   return (
      <PageSection id="screens" title={t("firstLook.title")} subtitle={t("firstLook.subtitle")}>
         <div ref={sichtRef} style={{ maxWidth: 1100, margin: "0 auto" }}>
            {/* Die Bühne */}
            <div
               ref={buehneRef}
               onMouseEnter={() => setSchwebt(true)}
               onMouseLeave={() => setSchwebt(false)}
               className="firstlook-buehne-raum"
               style={{
                  "--fl-spot": farbe,
                  position: "relative",
                  height: BUEHNE_HOEHE,
                  display: "flex", alignItems: "center", justifyContent: "center",
               } as React.CSSProperties}
            >
               <AnimatePresence initial={false}>
                  {faktor > 0 && (
                     <motion.div
                        key={`${lang}-${key}`}
                        initial={{ opacity: 0, scale: 0.965, filter: "blur(6px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.02, filter: "blur(4px)" }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        style={{ position: "absolute", width: anzeige.w, height: anzeige.h }}
                     >
                        {/* Ambilight: das Bild selbst, weichgezeichnet, als Licht dahinter */}
                        <img
                           src={bildPfad(lang, key)}
                           alt=""
                           aria-hidden="true"
                           className="firstlook-ambilight"
                        />
                        <button
                           onClick={() => { setUebernommen(true); setVollansicht(aktiv); }}
                           aria-label={`${titel}: ${t("firstLook.vergroessern")}`}
                           className="firstlook-buehne"
                           style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px ${farbe}22` }}
                        >
                           <img
                              src={bildPfad(lang, key)}
                              width={masse.w}
                              height={masse.h}
                              alt={titel}
                              style={{ display: "block", width: "100%", height: "100%" }}
                           />
                           {/* Ein Lichtreflex, der einmal über das Glas zieht */}
                           {!ruhig && (
                              <motion.span
                                 aria-hidden="true"
                                 initial={{ x: "-120%" }}
                                 animate={{ x: "120%" }}
                                 transition={{ duration: 1.3, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                 className="firstlook-reflex"
                              />
                           )}
                           <span className="firstlook-lupe" style={{ border: `1px solid ${farbe}55`, color: farbe }}>
                              <Maximize2 size={13} /> {t("firstLook.vergroessern")}
                           </span>
                        </button>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Das Kapitel */}
            <div aria-live="polite" style={{ margin: "22px auto 16px", maxWidth: 820, minHeight: 104 }}>
               <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                     key={key}
                     initial={{ opacity: 0, y: 14 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                     className="firstlook-kapitel"
                     style={{ "--fl-farbe": farbe } as React.CSSProperties}
                  >
                     <div className="firstlook-nummer" aria-hidden="true">{nummer}</div>
                     <div style={{ minWidth: 0 }}>
                        <div className="firstlook-zeile">
                           {t("firstLook.kapitelLabel")} {nummer}/{String(KAPITEL.length).padStart(2, "0")}
                        </div>
                        <h3 className="firstlook-titel">{titel}</h3>
                        <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: "4px 0 0", lineHeight: 1.55 }}>
                           {t(`firstLook.kapitel.${key}.text`)}
                        </p>
                        <div className="firstlook-chips">
                           {tags.map((tag, i) => (
                              <motion.span
                                 key={tag}
                                 initial={{ opacity: 0, y: 6 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: 0.12 + i * 0.07, duration: 0.3 }}
                                 className="firstlook-chip"
                              >
                                 {tag}
                              </motion.span>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               </AnimatePresence>
            </div>

            {/* Der Filmstreifen */}
            <div className="firstlook-film">
               <div
                  ref={streifenRef}
                  className="firstlook-streifen"
                  role="tablist"
                  aria-label={t("firstLook.title")}
                  data-lenis-prevent-wheel
               >
                  {KAPITEL.map((k, i) => {
                     const istAktiv = i === aktiv;
                     return (
                        <button
                           key={k}
                           role="tab"
                           aria-selected={istAktiv}
                           onClick={() => waehlen(i)}
                           className={`firstlook-bild${istAktiv ? " ist-aktiv" : ""}`}
                           style={{ "--fl-farbe": FARBE[k] } as React.CSSProperties}
                        >
                           <span className="firstlook-bild-rahmen">
                              <img
                                 src={bildPfad(lang, k, true)}
                                 alt=""
                                 width={320}
                                 height={180}
                                 loading="lazy"
                              />
                              {istAktiv && laeuft && (
                                 <motion.span
                                    key={`takt-${aktiv}`}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: TAKT_MS / 1000, ease: "linear" }}
                                    className="firstlook-takt"
                                 />
                              )}
                           </span>
                           <span className="firstlook-kante">
                              <span style={{ opacity: 0.55 }}>{String(i + 1).padStart(2, "0")}</span>
                              {" ▸ "}
                              {t(`firstLook.kapitel.${k}.titel`)}
                           </span>
                        </button>
                     );
                  })}
               </div>
            </div>
         </div>

         <Vollansicht
            lang={lang}
            index={vollansicht}
            onClose={schliessen}
            onBlaettern={blaettern}
            onSpringen={springen}
         />
      </PageSection>
   );
};

export default FirstLook;
