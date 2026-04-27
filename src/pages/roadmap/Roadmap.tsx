import { motion } from "motion/react";
import { scaleRotateIn } from "@utils/animations";
import {
   FaDesktop, FaSearch, FaFileAlt, FaFilePdf, FaCopy,
   FaBug, FaWrench, FaCheckCircle, FaChartBar, FaEye,
   FaYoutube, FaApple, FaGlobe, FaKey,
} from "react-icons/fa";
import PageSection from "@components/layout/PageSection";
import useMediaQuery from "@utils/useMediaQuery";
import { CYAN, TEXT_SECONDARY, TEXT_MUTED, MONO_FONT } from "@/constants/theme";
import type { ReactNode } from "react";

const PRO_COLOR = "#f5c542";

const ProBadge = () => (
   <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
      padding: "2px 7px", borderRadius: 5,
      background: PRO_COLOR, color: "#111",
      textTransform: "uppercase" as const, lineHeight: 1.6,
      display: "inline-block", verticalAlign: "middle", marginLeft: 8,
   }}>PRO</span>
);

interface Item {
   id: string;
   label: string;
   title: string;
   tabName?: string;
   description: string;
   tags: string[];
   pro: boolean;
   icon: ReactNode;
}

const ITEMS: Item[] = [
   {
      id: "media-test",
      label: "Media Test",
      title: "Reiter",
      tabName: "Media Test",
      description: "Eingebettete Videovorschau über das VLC-Plug-in mit Wiedergabe-Controls sowie einem Statistikfenster für Frame, Zeit, Restzeit und einer Audiostream-Wellenform.",
      tags: ["Vorschau", "VLC", "Statistik"],
      pro: false,
      icon: <FaDesktop size={15} />,
   },
   {
      id: "deepcheck",
      label: "DeepCheck",
      title: "DeepCheck",
      description: "Inhaltsbasierte Tiefenprüfung der Typintegrität mit dem Magika-Plug-in. Erkennt Abweichungen zwischen Dateiendung, Kopfsignatur und Containerstruktur.",
      tags: ["Magika", "Typprüfung", "Integrität"],
      pro: false,
      icon: <FaSearch size={14} />,
   },
   {
      id: "nfo-export",
      label: "NFO-Export",
      title: "NFO-Export für Medienverwaltung",
      description: "Erzeugt standardkonforme .nfo-Dateien für Videoverwaltungssysteme wie Kodi, Jellyfin und Emby direkt aus den vorhandenen Analyseergebnissen.",
      tags: ["Kodi", "Jellyfin", "Emby"],
      pro: false,
      icon: <FaFileAlt size={15} />,
   },
   {
      id: "map-plus",
      label: "MAP+",
      title: "MAP+ Archivierungs-PDF",
      description: "Hochwertige PDF-Variante des MAP als professionelles Archivierungsdokument mit erweiterter Darstellung für Archive, Kunden und langfristige Dokumentation.",
      tags: ["PDF", "Archiv", "Bericht"],
      pro: true,
      icon: <FaFilePdf size={15} />,
   },
   {
      id: "media-stapel",
      label: "Media Stapel",
      title: "Reiter",
      tabName: "Media Stapel",
      description: "Stapelverarbeitung ganzer Verzeichnisse oder Dateilisten in einem Durchlauf mit laufender Ergebnisanalyse und automatisch gespeicherten MAP-Berichten pro Datei.",
      tags: ["Batch", "Verzeichnisse", "Automatisierung"],
      pro: true,
      icon: <FaCopy size={14} />,
   },
   {
      id: "diagnosemodus",
      label: "Diagnosemodus",
      title: "Diagnosemodus",
      description: "Vertiefte FFprobe-Analyse mit Paket- und Frame-Informationen sowie einem Streamcopy-Test. Ideal für Problemdateien mit auffälligen Zeitstempeln oder Paketfolgen.",
      tags: ["FFprobe", "Tiefenanalyse", "Diagnose"],
      pro: true,
      icon: <FaBug size={15} />,
   },
   {
      id: "media-repair",
      label: "Media Repair",
      title: "Reiter",
      tabName: "Media Repair",
      description: "Regelbasierte Reparaturvorschläge bei erkannten Fehlern mit Wahrscheinlichkeitsangabe und konkretem Verfahren. Arbeitet stets auf einer Kopie, nie an der Originaldatei.",
      tags: ["Reparatur", "FFmpeg", "regelbasiert"],
      pro: true,
      icon: <FaWrench size={14} />,
   },
   {
      id: "kompatibilitaet",
      label: "Kompatibilität",
      title: "Kompatibilitätsbewertung",
      description: "Regelbasierte Einschätzung der Abspielbarkeit auf typischen Plattformen anhand von FFprobe- und MediaInfo-Daten. Klare Kennzeichnung kritischer Merkmale wie Codec-Profile oder Farbräume.",
      tags: ["Plattform", "MediaInfo", "FFprobe"],
      pro: false,
      icon: <FaCheckCircle size={14} />,
   },
   {
      id: "statistik",
      label: "Statistik",
      title: "Statistik-Modul",
      description: "Lernendes Statistiksystem, das reale Prüfungsdaten erfasst und individuelle Laufzeitprognosen pro System erstellt, differenziert nach CPU-Modus und Speicherquelle.",
      tags: ["Laufzeitprognose", "lernend", "Statistik"],
      pro: true,
      icon: <FaChartBar size={15} />,
   },
   {
      id: "vqa",
      label: "VQA",
      title: "Perzeptuelle Qualitätsanalyse (VQA)",
      description: "Bewertet die visuelle Qualität eines Videos aus menschlicher Sicht mit OpenCV, ergänzend zu technischen Kennzahlen und unabhängig von Plattformbewertungen.",
      tags: ["OpenCV", "Bildanalyse", "visuell"],
      pro: true,
      icon: <FaEye size={15} />,
   },
   {
      id: "ytup",
      label: "Ytup",
      title: "Ytup: YouTube-Upload-Prognose",
      description: "Proprietäres Analysemodul zur technischen und qualitativen Bewertung vor einem YouTube-Upload inklusive Qualitätsprognose nach der Neukodierung und Optimierungsempfehlungen.",
      tags: ["YouTube", "Upload", "Prognose"],
      pro: true,
      icon: <FaYoutube size={15} />,
   },
   {
      id: "macos",
      label: "macOS",
      title: "Portierung für macOS",
      description: "Refactoring und Portierung der Anwendung für macOS mit einheitlicher Bedienoberfläche und vergleichbarem Funktionsumfang über alle unterstützten Betriebssysteme hinweg.",
      tags: ["macOS", "Portierung", "Refactoring"],
      pro: false,
      icon: <FaApple size={15} />,
   },
   {
      id: "sprachen",
      label: "Sprachen",
      title: "Weitere Sprachen",
      description: "Erweiterung der mehrsprachigen Benutzeroberfläche um Spanisch, Hindi, Russisch, Portugiesisch und weitere Sprachen.",
      tags: ["Spanisch", "Hindi", "Russisch"],
      pro: false,
      icon: <FaGlobe size={14} />,
   },
   {
      id: "lizenz",
      label: "Lizenzierung",
      title: "Lizenzierungsmodul",
      description: "Verwaltung der PRO-Aktivierung, Lizenzprüfung und Funktionsfreischaltung, vollständig lokal ohne dauerhafte Internetverbindung.",
      tags: ["Lizenz", "Aktivierung", "lokal"],
      pro: false,
      icon: <FaKey size={14} />,
   },
];

const scrollTo = (id: string) => {
   document.getElementById(`roadmap-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const Roadmap = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <PageSection id="roadmap" title="Roadmap" subtitle="Geplante Erweiterungen und Ausblick">
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>

            {/* Quick-nav chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 56 }}>
               {ITEMS.map((item) => (
                  <motion.button
                     key={item.id}
                     onClick={() => scrollTo(item.id)}
                     whileHover={{ scale: 1.06, y: -2 }}
                     whileTap={{ scale: 0.96 }}
                     style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "5px 14px", borderRadius: 999, cursor: "pointer",
                        background: item.pro ? "rgba(245,197,66,0.07)" : "rgba(106,172,204,0.07)",
                        border: `1px solid ${item.pro ? "rgba(245,197,66,0.22)" : "rgba(106,172,204,0.22)"}`,
                        color: item.pro ? PRO_COLOR : CYAN,
                        fontSize: 11, fontWeight: 600,
                        fontFamily: MONO_FONT,
                        letterSpacing: "0.03em",
                     }}
                  >
                     <span style={{ opacity: 0.8 }}>{item.icon}</span>
                     {item.label}
                  </motion.button>
               ))}
            </div>

            {/* Timeline */}
            <div style={{ position: "relative", paddingLeft: isMobile ? 24 : 0 }}>

               {/* Vertical center line */}
               <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                     position: "absolute",
                     left: isMobile ? 6 : "50%",
                     top: 0, bottom: 0, width: 2, borderRadius: 1,
                     transformOrigin: "top",
                     background: "linear-gradient(to bottom, rgba(106,172,204,0.35), rgba(245,197,66,0.2) 50%, rgba(106,172,204,0.1) 85%, transparent)",
                  }}
               />

               {ITEMS.map((item, idx) => {
                  const isLeft = !isMobile && idx % 2 === 0;
                  const accent = item.pro ? PRO_COLOR : CYAN;
                  const accentAlpha = item.pro ? "rgba(245,197,66," : "rgba(106,172,204,";

                  return (
                     <motion.div
                        key={item.id}
                        id={`roadmap-${item.id}`}
                        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                        transition={{
                           type: "spring", stiffness: 80, damping: 18,
                           delay: Math.min(idx * 0.06, 0.6),
                        }}
                        style={{
                           display: "flex",
                           justifyContent: isMobile || !isLeft ? "flex-start" : "flex-end",
                           paddingLeft: isMobile ? 24 : isLeft ? 0 : "calc(50% + 20px)",
                           paddingRight: isMobile || !isLeft ? 0 : "calc(50% + 20px)",
                           marginTop: idx === 0 || isMobile ? 0 : -60,
                           position: "relative",
                           zIndex: ITEMS.length - idx,
                        }}
                     >
                        {/* Node dot with float animation */}
                        <motion.div
                           initial={{ scale: 0 }}
                           whileInView={{ scale: 1 }}
                           viewport={{ once: true }}
                           transition={{ type: "spring", delay: 0.2 + idx * 0.06 }}
                           style={{
                              position: "absolute",
                              left: isMobile ? 2 : "calc(50% - 5px)",
                              top: 20,
                              width: 10, height: 10, borderRadius: "50%",
                              background: accent,
                              boxShadow: `0 0 10px ${accent}80, 0 0 20px ${accent}30`,
                              zIndex: 3,
                              animation: `float ${3 + (idx % 4) * 0.5}s ease-in-out ${(idx % 6) * 0.4}s infinite`,
                           }}
                        />

                        {/* Horizontal connector */}
                        {!isMobile && (
                           <motion.div
                              initial={{ scaleX: 0 }}
                              whileInView={{ scaleX: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.35, delay: 0.2 + idx * 0.05 }}
                              style={{
                                 position: "absolute",
                                 top: 24,
                                 left: isLeft ? "auto" : "calc(50% + 5px)",
                                 right: isLeft ? "calc(50% + 5px)" : "auto",
                                 width: 15, height: 1,
                                 background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${accent}50, transparent)`,
                                 transformOrigin: isLeft ? "right" : "left",
                              }}
                           />
                        )}

                        {/* Card */}
                        <motion.div
                           className="glass-card"
                           variants={scaleRotateIn}
                           initial="hidden"
                           whileInView="visible"
                           viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                           transition={{
                              type: "spring", stiffness: 80, damping: 16,
                              delay: Math.min(idx * 0.1, 0.8),
                           }}
                           whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] } }}
                           style={{ width: "100%", maxWidth: 480, overflow: "hidden", display: "flex", flexDirection: "column" }}
                        >
                           {/* Accent top bar */}
                           <div style={{
                              height: 3,
                              background: item.pro
                                 ? "linear-gradient(to right, #f5c542, #d97706)"
                                 : `linear-gradient(to right, ${CYAN}, #4a7da0)`,
                              borderRadius: "12px 12px 0 0",
                           }} />

                           <div style={{ padding: "18px 20px 16px" }}>
                              {/* Header */}
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                 <div style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                    background: `${accentAlpha}0.1)`,
                                    border: `1px solid ${accentAlpha}0.2)`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: accent,
                                 }}>
                                    {item.icon}
                                 </div>
                                 <h3 style={{ margin: 0, lineHeight: 1.4 }}>
                                    {item.tabName ? (
                                       <>
                                          <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                             Reiter{" "}
                                          </span>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: "#eeeef5", fontFamily: MONO_FONT }}>
                                             {item.tabName}
                                          </span>
                                       </>
                                    ) : (
                                       <span style={{ fontSize: 13, fontWeight: 700, color: "#eeeef5" }}>
                                          {item.title}
                                       </span>
                                    )}
                                    {item.pro && <ProBadge />}
                                 </h3>
                              </div>

                              {/* Description */}
                              <p style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.75, margin: "0 0 12px" }}>
                                 {item.description}
                              </p>

                              {/* Tags */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                 {item.tags.map((tag) => (
                                    <span key={tag} style={{
                                       fontFamily: MONO_FONT, fontSize: 10,
                                       padding: "2px 8px", borderRadius: 5,
                                       background: `${accentAlpha}0.07)`,
                                       color: accent,
                                       border: `1px solid ${accentAlpha}0.15)`,
                                    }}>
                                       {tag}
                                    </span>
                                 ))}
                                 <span style={{
                                    fontFamily: MONO_FONT, fontSize: 10,
                                    padding: "2px 8px", borderRadius: 5,
                                    background: "rgba(255,255,255,0.03)",
                                    color: TEXT_MUTED,
                                    border: "1px solid rgba(255,255,255,0.06)",
                                 }}>
                                    {item.pro ? "PRO-Feature" : "Basisversion"}
                                 </span>
                              </div>
                           </div>
                        </motion.div>
                     </motion.div>
                  );
               })}
            </div>
         </div>
      </PageSection>
   );
};

export default Roadmap;
