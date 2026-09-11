/**
 * Ein Fenster für die nummerierten Rechtstexte: EULA, AGB, Widerrufsbelehrung.
 *
 * Die drei sind gleich aufgebaut (Kopf, nummerierte Abschnitte, Fusszeile) und
 * unterscheiden sich nur in Daten und Symbol. Als drei Dateien nebeneinander
 * wären sie drei Fassungen desselben Bauteils, die auseinanderlaufen, sobald
 * jemand eine davon anfasst - und auffallen würde es nicht, weil man sie nie
 * nebeneinander sieht.
 *
 * Der Inhalt kommt aus `data/*.json`, das seinerseits aus den Quellen in
 * `00_ORGANISATION/RECHT/` gebaut wird.
 *
 * Die Ebene liegt ÜBER der der anderen Fenster (1100 statt 1000): Diese
 * Texte werden aus dem Anfrageformular heraus geöffnet, und bei gleicher
 * Ebene entschiede die Reihenfolge im DOM - das Formular steht dort weiter
 * unten und läge damit obenauf.
 */
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import { useFensterStapel } from "@utils/useFensterStapel";

export interface Rechtstext {
   title: string;
   subtitle: string;
   date: string;
   version?: string;
   sections: {
      id: number;
      title: string;
      paragraphs: string[];
      /**
       * Auszufüllende Felder, etwa im Muster-Widerrufsformular. Sie standen
       * bis zum 11.09.2026 als Fliesstext mit Unterstrichen in einem Absatz
       * und sahen nach nichts aus, das man ausfüllt (Anwenderbefund). Jetzt
       * ein Block: je Feld eine Zeile mit Beschriftung und Schreiblinie.
       */
      formular?: string[];
   }[];
}

interface Props {
   open: boolean;
   onClose: () => void;
   daten: Rechtstext;
   Icon: LucideIcon;
   /** Eindeutig je Text, damit die Ein- und Ausblendung nicht springt. */
   kennung: string;
}

const RechtstextModal = ({ open, onClose, daten, Icon, kennung }: Props) => {
   const { t } = useTranslation();
   const scrollRef = useRef<HTMLDivElement>(null);

   // Escape und das Sperren des Seitenscrollens laufen über den gemeinsamen
   // Fensterstapel: Sonst schliesst ein Fenster das darunter liegende mit.
   useFensterStapel(open, onClose);

   useEffect(() => {
      if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
   }, [open]);

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  key={`${kennung}-backdrop`}
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
                  key={`${kennung}-modal`}
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
                  <div
                     style={{
                        width: "100%", maxWidth: 700,
                        maxHeight: "88vh",
                        display: "flex", flexDirection: "column",
                        background: "rgba(14,16,36,0.97)",
                        border: "1px solid rgba(106,172,204,0.18)",
                        borderRadius: 20,
                        boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,172,204,0.06)",
                        pointerEvents: "auto",
                        overflow: "hidden",
                     }}
                  >
                     {/* Kopf */}
                     <div style={{
                        padding: "22px 28px 20px",
                        borderBottom: "1px solid rgba(106,172,204,0.12)",
                        display: "flex", alignItems: "flex-start", gap: 14,
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.03)",
                     }}>
                        <div style={{
                           width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                           background: "rgba(106,172,204,0.08)",
                           border: "1px solid rgba(106,172,204,0.2)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           <Icon size={18} color={CYAN} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <p style={{
                              fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
                              letterSpacing: "0.08em", fontWeight: 600, margin: 0,
                           }}>
                              {daten.subtitle}
                           </p>
                           <h2 style={{
                              fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY,
                              margin: "4px 0 0",
                           }}>
                              {daten.title}
                           </h2>
                           <p style={{ fontSize: 11, color: TEXT_MUTED, margin: "4px 0 0" }}>
                              {daten.date}
                              {daten.version ? ` · ${daten.version}` : ""}
                           </p>
                        </div>
                        <button
                           onClick={onClose}
                           style={{
                              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: TEXT_MUTED, transition: "all 0.15s",
                           }}
                           onMouseEnter={(e) => {
                              const el = e.currentTarget as HTMLButtonElement;
                              el.style.background = "rgba(255,255,255,0.09)";
                              el.style.color = TEXT_PRIMARY;
                           }}
                           onMouseLeave={(e) => {
                              const el = e.currentTarget as HTMLButtonElement;
                              el.style.background = "rgba(255,255,255,0.04)";
                              el.style.color = TEXT_MUTED;
                           }}
                        >
                           <X size={15} />
                        </button>
                     </div>

                     {/* Inhalt */}
                     <div
                        ref={scrollRef}
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        style={{
                           overflowY: "auto", flex: 1,
                           padding: "24px 28px 32px",
                           scrollbarWidth: "thin",
                           scrollbarColor: "rgba(106,172,204,0.2) transparent",
                        }}
                     >
                        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                           {daten.sections.map((section) => (
                              <div key={section.id} style={{ display: "flex", gap: 18 }}>
                                 <div style={{
                                    flexShrink: 0, width: 28, height: 28, borderRadius: 8,
                                    background: "rgba(106,172,204,0.07)",
                                    border: "1px solid rgba(106,172,204,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    marginTop: 1,
                                 }}>
                                    <span style={{
                                       fontSize: 10, fontWeight: 800, color: CYAN,
                                       letterSpacing: "0.02em",
                                    }}>
                                       {section.id}
                                    </span>
                                 </div>
                                 <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                       fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY,
                                       margin: "0 0 10px", lineHeight: 1.4,
                                    }}>
                                       {section.title}
                                    </h3>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                       {section.paragraphs.map((para, i) => (
                                          <p key={i} style={{
                                             fontSize: 12.5, color: TEXT_SECONDARY,
                                             lineHeight: 1.75, margin: 0,
                                          }}>
                                             {para}
                                          </p>
                                       ))}
                                       {section.formular && (
                                          <div style={{
                                             marginTop: 6, padding: "14px 16px 10px",
                                             border: "1px solid rgba(106,172,204,0.18)",
                                             borderRadius: 8,
                                             background: "rgba(106,172,204,0.04)",
                                             display: "flex", flexDirection: "column", gap: 14,
                                          }}>
                                             {section.formular.map((feld, i) => (
                                                <div key={i} style={{
                                                   display: "flex", alignItems: "baseline",
                                                   gap: 10, flexWrap: "wrap",
                                                }}>
                                                   <span style={{
                                                      fontSize: 12, color: TEXT_SECONDARY,
                                                      whiteSpace: "nowrap",
                                                   }}>
                                                      {feld}:
                                                   </span>
                                                   <span aria-hidden="true" style={{
                                                      flex: 1, minWidth: 160, height: 1,
                                                      borderBottom: "1px solid rgba(238,238,245,0.45)",
                                                      transform: "translateY(4px)",
                                                   }} />
                                                </div>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Fusszeile */}
                     <div style={{
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(106,172,204,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.02)",
                     }}>
                        <span style={{
                           display: "inline-flex", alignItems: "center", gap: 6,
                           padding: "4px 10px 4px 6px", borderRadius: 999,
                           background: "rgba(106,172,204,0.07)",
                           border: "1px solid rgba(106,172,204,0.16)",
                        }}>
                           <span style={{
                              width: 18, height: 18, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, fontWeight: 900, color: "#fff",
                              letterSpacing: "-0.02em", flexShrink: 0,
                           }}>V</span>
                           <span style={{
                              fontSize: 11, fontWeight: 600, color: CYAN,
                              letterSpacing: "0.01em",
                           }}>VidiVerify-Team</span>
                           <span style={{ width: 1, height: 10, background: "rgba(106,172,204,0.25)" }} />
                           <span style={{ fontSize: 11, color: TEXT_MUTED }}>Gera</span>
                        </span>
                        <motion.button
                           onClick={onClose}
                           whileHover={{ scale: 1.04 }}
                           whileTap={{ scale: 0.97 }}
                           style={{
                              padding: "7px 18px", borderRadius: 10,
                              background: "rgba(106,172,204,0.08)",
                              border: "1px solid rgba(106,172,204,0.2)",
                              fontSize: 12, fontWeight: 600, color: CYAN, cursor: "pointer",
                              fontFamily: "inherit",
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

export default RechtstextModal;
