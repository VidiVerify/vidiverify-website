/* Häufige Fragen als Fenster über der Seite, gebaut wie die Rechtstexte
 * (Datenschutz, AGB): Inhaltsverzeichnis, Sprünge im Scrollbereich,
 * gemeinsamer Fensterstapel. Dazu ein Suchfeld, das beim Tippen Fragen und
 * Antworten filtert und die Treffer hervorhebt.
 *
 * Die Texte liegen in `data/faq.json` und `data/faq.en.json`. Preise stehen
 * dort als {PRO} und {LIFETIME} und kommen live aus dem Worker, damit die FAQ
 * nie einen anderen Preis nennt als die Preistafel.
 *
 * Eine einzelne Frage ist über `#faq-<slug>` direkt verlinkbar, etwa aus
 * einer Support-Email: Das Fenster geht auf, die Frage ist aufgeklappt. */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { X, HelpCircle, Search, ChevronDown } from "lucide-react";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import { useFensterStapel } from "@utils/useFensterStapel";
import { preisText, usePreise } from "@utils/usePreise";
import { Inhaltsverzeichnis, ZumInhalt } from "./RechtstextNavigation";
import { abschnittId, springe } from "@utils/rechtstextSprung";
import datenDe from "../../../data/faq.json";
import datenEn from "../../../data/faq.en.json";

type Antwort = string | { ul: string[] };

interface Frage {
   slug: string;
   q: string;
   a: Antwort[];
}

interface Faq {
   title: string;
   subtitle: string;
   date: string;
   searchPlaceholder: string;
   searchAria: string;
   hits: string;
   noResults: string;
   tocTitle: string;
   sections: { id: number; title: string; items: Frage[] }[];
}

const SUPPORT_EMAIL = "support@vidiverify.de";

const frageId = (slug: string) => `faq-${slug}`;

/** Für den Vergleich: klein, ohne Akzente (Suche „prufung" findet „Prüfung"). */
const normal = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const reinerText = (a: Antwort[]) =>
   a.map((teil) => (typeof teil === "string" ? teil : teil.ul.join(" "))).join(" ").replace(/\*\*/g, "");

/** Hebt alle Suchbegriffe im Text hervor. Verglichen wird normalisiert, die
 * Länge bleibt dabei gleich, weil NFD-Zeichen ohne Akzent je ein Zeichen sind
 * - deshalb erst die Positionen im normalisierten Text suchen und dann aus
 * dem Original schneiden. Für Buchstaben, die beim Zerlegen länger werden,
 * fällt die Markierung einfach weg, der Text bleibt richtig. */
function markiere(text: string, begriffe: string[], schluessel: string): ReactNode[] {
   if (!begriffe.length) return [text];
   const flach = normal(text);
   if (flach.length !== text.length) return [text];
   const treffer: [number, number][] = [];
   for (const b of begriffe) {
      let pos = flach.indexOf(b);
      while (pos >= 0) {
         treffer.push([pos, pos + b.length]);
         pos = flach.indexOf(b, pos + b.length);
      }
   }
   if (!treffer.length) return [text];
   treffer.sort((x, y) => x[0] - y[0]);
   const teile: ReactNode[] = [];
   let ab = 0;
   treffer.forEach(([von, bis], i) => {
      if (von < ab) return;
      if (von > ab) teile.push(text.slice(ab, von));
      teile.push(
         <mark key={`${schluessel}-m${i}`} style={{
            background: "rgba(106,172,204,0.28)", color: TEXT_PRIMARY,
            borderRadius: 3, padding: "0 1px",
         }}>
            {text.slice(von, bis)}
         </mark>,
      );
      ab = bis;
   });
   if (ab < text.length) teile.push(text.slice(ab));
   return teile;
}

/** **fett**, die Supportadresse als Link, Suchtreffer markiert. */
function satz(text: string, begriffe: string[], schluessel: string): ReactNode[] {
   return text.split("**").flatMap<ReactNode>((stueck, i) => {
      const k = `${schluessel}-${i}`;
      const mitLink = stueck.split(SUPPORT_EMAIL).flatMap<ReactNode>((teil, j, alle) => {
         const knoten: ReactNode[] = markiere(teil, begriffe, `${k}-${j}`);
         if (j < alle.length - 1) {
            knoten.push(
               <a key={`${k}-mail${j}`} href={`mailto:${SUPPORT_EMAIL}`}
                  style={{ color: CYAN, textDecoration: "none", fontWeight: 600 }}>
                  {SUPPORT_EMAIL}
               </a>,
            );
         }
         return knoten;
      });
      return i % 2 === 1
         ? [<strong key={k} style={{ color: TEXT_PRIMARY, fontWeight: 700 }}>{mitLink}</strong>]
         : mitLink;
   });
}

interface Props {
   open: boolean;
   onClose: () => void;
   /** Slug einer Frage, die beim Öffnen aufgeklappt und angesprungen wird. */
   ziel?: string;
}

const FaqModal = ({ open, onClose, ziel }: Props) => {
   const { t, i18n } = useTranslation();
   const sprache: "de" | "en" = (i18n.language || "de").toLowerCase().startsWith("de") ? "de" : "en";
   const roh = (sprache === "de" ? datenDe : datenEn) as Faq;
   const { preise } = usePreise(open);
   const scrollRef = useRef<HTMLDivElement>(null);
   const suchRef = useRef<HTMLInputElement>(null);
   const [suche, setSuche] = useState("");
   const [offen, setOffen] = useState<Set<string>>(new Set());

   useFensterStapel(open, onClose);

   // Preise einsetzen, einmal je Sprache und Preisstand.
   const daten = useMemo<Faq>(() => {
      const ersetze = (s: string) => s
         .replaceAll("{PRO}", preisText(preise.pro, sprache))
         .replaceAll("{LIFETIME}", preisText(preise.lifetime, sprache));
      return {
         ...roh,
         sections: roh.sections.map((sec) => ({
            ...sec,
            items: sec.items.map((f) => ({
               ...f,
               a: f.a.map((teil) => (typeof teil === "string" ? ersetze(teil) : { ul: teil.ul.map(ersetze) })),
            })),
         })),
      };
   }, [roh, preise.pro, preise.lifetime, sprache]);

   // Beim Öffnen: Suche leeren, ggf. die Zielfrage aufklappen. Im Rendern
   // statt im Effekt, damit kein zweiter Durchlauf mit dem alten Stand kommt.
   // Startwert „zu", damit auch ein Direktaufruf (`#faq-<slug>`, Fenster
   // offen ab dem ersten Bild) als Öffnen zählt.
   const [warOffen, setWarOffen] = useState(false);
   const [warZiel, setWarZiel] = useState<string | undefined>(undefined);
   if (open !== warOffen || ziel !== warZiel) {
      setWarOffen(open);
      setWarZiel(ziel);
      if (open) {
         setSuche("");
         setOffen(ziel ? new Set([ziel]) : new Set());
      }
   }

   // Danach nach oben bzw. zur Zielfrage.
   useEffect(() => {
      if (!open) return;
      const box = scrollRef.current;
      if (box) box.scrollTop = 0;
      if (ziel) {
         // Erst nach dem Aufklappen springen, sonst stimmt die Höhe nicht.
         const zeit = window.setTimeout(() => springe(scrollRef, frageId(ziel)), 350);
         return () => window.clearTimeout(zeit);
      }
   }, [open, ziel]);

   const begriffe = useMemo(
      () => normal(suche).split(/\s+/).filter((b) => b.length >= 2),
      [suche],
   );
   const sucht = begriffe.length > 0;

   const sichtbar = useMemo(() => {
      if (!sucht) return daten.sections;
      return daten.sections
         .map((sec) => ({
            ...sec,
            items: sec.items.filter((f) => {
               const heu = normal(`${f.q} ${reinerText(f.a)}`);
               return begriffe.every((b) => heu.includes(b));
            }),
         }))
         .filter((sec) => sec.items.length > 0);
   }, [daten, begriffe, sucht]);

   const trefferzahl = sichtbar.reduce((n, sec) => n + sec.items.length, 0);

   const umschalten = (slug: string) => setOffen((alt) => {
      const neu = new Set(alt);
      if (neu.has(slug)) neu.delete(slug); else neu.add(slug);
      return neu;
   });

   const renderAntwort = (f: Frage) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "2px 16px 16px 16px" }}>
         {f.a.map((teil, i) => (typeof teil === "string" ? (
            <p key={i} style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.75, margin: 0 }}>
               {satz(teil, begriffe, `${f.slug}-p${i}`)}
            </p>
         ) : (
            <ul key={i} style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 5 }}>
               {teil.ul.map((punkt, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none" }}>
                     <span style={{ width: 4, height: 4, borderRadius: "50%", background: CYAN, flexShrink: 0, marginTop: 8, opacity: 0.7 }} />
                     <span style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.75 }}>
                        {satz(punkt, begriffe, `${f.slug}-l${i}-${j}`)}
                     </span>
                  </li>
               ))}
            </ul>
         )))}
      </div>
   );

   const renderFrage = (f: Frage) => {
      const aufgeklappt = sucht || offen.has(f.slug);
      return (
         <div key={f.slug} id={frageId(f.slug)} style={{
            borderRadius: 12,
            background: aufgeklappt ? "rgba(106,172,204,0.05)" : "rgba(10,12,28,0.45)",
            border: `1px solid ${aufgeklappt ? "rgba(106,172,204,0.24)" : "rgba(106,172,204,0.1)"}`,
            transition: "background 0.15s, border-color 0.15s",
         }}>
            <button
               type="button"
               onClick={() => umschalten(f.slug)}
               aria-expanded={aufgeklappt}
               style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 16px", background: "none", border: "none",
                  cursor: "pointer", textAlign: "left", font: "inherit",
               }}
            >
               <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, lineHeight: 1.45 }}>
                  {markiere(f.q, begriffe, `${f.slug}-q`)}
               </span>
               <ChevronDown size={15} color={CYAN} style={{
                  flexShrink: 0, transition: "transform 0.2s",
                  transform: aufgeklappt ? "rotate(180deg)" : "none",
               }} />
            </button>
            {aufgeklappt && renderAntwort(f)}
         </div>
      );
   };

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  key="faq-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={onClose}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1100,
                     background: "rgba(6,7,18,0.82)",
                     backdropFilter: "blur(14px)",
                     WebkitBackdropFilter: "blur(14px)",
                  }}
               />

               <motion.div
                  key="faq-modal"
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1101,
                     display: "flex", alignItems: "center", justifyContent: "center",
                     padding: "24px 16px",
                     pointerEvents: "none",
                  }}
               >
                  <div style={{
                     width: "100%", maxWidth: 720,
                     height: "88vh",
                     display: "flex", flexDirection: "column",
                     background: "rgba(14,16,36,0.97)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     borderRadius: 20,
                     boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,172,204,0.06)",
                     pointerEvents: "auto",
                     overflow: "hidden",
                  }}>
                     {/* Kopf */}
                     <div style={{
                        padding: "22px 28px 16px",
                        borderBottom: "1px solid rgba(106,172,204,0.12)",
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.03)",
                     }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                           <div style={{
                              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                              background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                           }}>
                              <HelpCircle size={18} color={CYAN} />
                           </div>
                           <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                                 {daten.subtitle}
                              </p>
                              <h2 style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, margin: "4px 0 0" }}>
                                 {daten.title}
                              </h2>
                              <p style={{ fontSize: 11, color: TEXT_MUTED, margin: "4px 0 0" }}>{daten.date}</p>
                           </div>
                           <button
                              onClick={onClose}
                              aria-label={t("modal.closeAria")}
                              style={{
                                 flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                                 background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                 display: "flex", alignItems: "center", justifyContent: "center",
                                 cursor: "pointer", color: TEXT_MUTED, transition: "all 0.15s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = TEXT_PRIMARY; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = TEXT_MUTED; }}
                           >
                              <X size={15} />
                           </button>
                        </div>

                        {/* Suche */}
                        <div style={{
                           marginTop: 16, display: "flex", alignItems: "center", gap: 10,
                           padding: "0 12px", height: 40, borderRadius: 11,
                           background: "rgba(10,12,28,0.7)",
                           border: `1px solid ${sucht ? "rgba(106,172,204,0.45)" : "rgba(106,172,204,0.18)"}`,
                           transition: "border-color 0.15s",
                        }}>
                           <Search size={15} color={sucht ? CYAN : TEXT_MUTED} style={{ flexShrink: 0 }} />
                           <input
                              ref={suchRef}
                              type="text"
                              role="searchbox"
                              value={suche}
                              onChange={(e) => {
                                 setSuche(e.target.value);
                                 if (scrollRef.current) scrollRef.current.scrollTop = 0;
                              }}
                              placeholder={daten.searchPlaceholder}
                              aria-label={daten.searchAria}
                              style={{
                                 flex: 1, minWidth: 0, height: "100%",
                                 background: "none", border: "none", outline: "none",
                                 font: "inherit", fontSize: 13, color: TEXT_PRIMARY,
                              }}
                           />
                           {sucht && (
                              <span style={{ fontSize: 11, color: CYAN, fontWeight: 600, whiteSpace: "nowrap" }}>
                                 {daten.hits.replace("{n}", String(trefferzahl))}
                              </span>
                           )}
                           {suche && (
                              <button
                                 type="button"
                                 onClick={() => { setSuche(""); suchRef.current?.focus(); }}
                                 aria-label={t("modal.closeAria")}
                                 style={{
                                    flexShrink: 0, display: "flex", background: "none", border: "none",
                                    cursor: "pointer", color: TEXT_MUTED, padding: 2,
                                 }}
                              >
                                 <X size={14} />
                              </button>
                           )}
                        </div>
                     </div>

                     {/* Inhalt */}
                     <div
                        ref={scrollRef}
                        data-lenis-prevent
                        onWheel={e => e.stopPropagation()}
                        style={{
                           position: "relative",
                           overflowY: "auto", flex: 1,
                           padding: "22px 28px 32px",
                           scrollbarWidth: "thin",
                           scrollbarColor: "rgba(106,172,204,0.2) transparent",
                        }}
                     >
                        {!sucht && (
                           <Inhaltsverzeichnis box={scrollRef} sections={daten.sections} titel={daten.tocTitle} />
                        )}

                        {sucht && trefferzahl === 0 && (
                           <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "8px 0 0", textAlign: "center" }}>
                              {satz(daten.noResults, [], "leer")}
                           </p>
                        )}

                        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                           {sichtbar.map((sec) => (
                              <div key={sec.id} id={abschnittId(sec.id)} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
                                    <div style={{
                                       flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                                       background: "rgba(106,172,204,0.07)", border: "1px solid rgba(106,172,204,0.15)",
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                    }}>
                                       <span style={{ fontSize: 10, fontWeight: 800, color: CYAN }}>{sec.id}</span>
                                    </div>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, color: TEXT_PRIMARY, margin: 0 }}>
                                       {sec.title}
                                    </h3>
                                 </div>
                                 {sec.items.map(renderFrage)}
                                 {!sucht && <ZumInhalt box={scrollRef} />}
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Fuss */}
                     <div style={{
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(106,172,204,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.02)",
                     }}>
                        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ fontSize: 11.5, color: CYAN, textDecoration: "none", fontWeight: 600 }}>
                           {SUPPORT_EMAIL}
                        </a>
                        <motion.button
                           onClick={onClose}
                           whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                           style={{
                              padding: "7px 18px", borderRadius: 10,
                              background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                              fontSize: 12, fontWeight: 600, color: CYAN, cursor: "pointer",
                           }}
                        >
                           {t("modal.close")}
                        </motion.button>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

export default FaqModal;
