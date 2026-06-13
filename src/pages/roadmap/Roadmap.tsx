import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { scaleRotateIn } from "@utils/animations";
import {
   FaDesktop, FaSearch, FaFileAlt, FaFilePdf, FaCopy,
   FaBug, FaWrench, FaCheckCircle, FaChartBar, FaEye,
   FaYoutube, FaApple, FaGlobe, FaKey, FaBolt, FaExpand, FaCheck,
   FaShieldAlt, FaStream,
} from "react-icons/fa";
import PageSection from "@components/layout/PageSection";
import useMediaQuery from "@utils/useMediaQuery";
import { CYAN, GREEN, TEXT_SECONDARY, TEXT_MUTED, MONO_FONT } from "@/constants/theme";
import type { ReactNode } from "react";

const PRO_COLOR = "#f5c542";
const NEXT_COLOR = "#a78bfa"; // sanftes Violett für "als Nächstes"

const ProBadge = ({ label }: { label: string }) => (
   <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.1em",
      padding: "2px 7px", borderRadius: 5,
      background: PRO_COLOR, color: "#111",
      textTransform: "uppercase" as const, lineHeight: 1.6,
      display: "inline-block", verticalAlign: "middle", marginLeft: 8,
   }}>{label}</span>
);

const DeliveredBadge = ({ label, version }: { label: string; version: string }) => (
   <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
      padding: "2px 7px", borderRadius: 5,
      background: GREEN, color: "#062014",
      textTransform: "uppercase" as const, lineHeight: 1.6,
      display: "inline-flex", alignItems: "center", gap: 4,
      verticalAlign: "middle", marginLeft: 8,
   }}>
      <FaCheck size={8} /> {label} · {version}
   </span>
);

const NextBadge = ({ label }: { label: string }) => (
   <motion.span
      animate={{ boxShadow: [`0 0 0 0 ${NEXT_COLOR}66`, `0 0 0 6px ${NEXT_COLOR}00`] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
      style={{
         fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
         padding: "2px 7px", borderRadius: 5,
         background: NEXT_COLOR, color: "#1a0f3a",
         textTransform: "uppercase" as const, lineHeight: 1.6,
         display: "inline-block", verticalAlign: "middle", marginLeft: 8,
      }}
   >
      {label}
   </motion.span>
);

interface Item {
   id: string;
   pro: boolean;
   delivered?: { version: string };
   next?: boolean;
   isTab?: boolean;
   icon: ReactNode;
}

// Items tragen nur Metadaten (id, Icon, Flags); alle Texte (label, title,
// description, tags) kommen aus den i18n-Übersetzungen, gelookt-uppt via id.
const ITEMS: Item[] = [
   { id: "ki-forensik",    pro: true,  isTab: true,                             icon: <FaShieldAlt size={14} /> },
   { id: "quick-check",    pro: false, next: true,                              icon: <FaBolt size={14} /> },
   { id: "media-test",     pro: false, isTab: true,                             icon: <FaDesktop size={15} /> },
   { id: "deepcheck",      pro: false, delivered: { version: "v1.4.7" },        icon: <FaSearch size={14} /> },
   { id: "media-repair",   pro: true,  isTab: true,                             icon: <FaWrench size={14} /> },
   { id: "map-plus",       pro: true,                                           icon: <FaFilePdf size={15} /> },
   { id: "media-stapel",   pro: true,  isTab: true,                             icon: <FaCopy size={14} /> },
   { id: "diagnosemodus",  pro: false, delivered: { version: "v1.4.7" },        icon: <FaBug size={15} /> },
   { id: "vvprogressiv",   pro: true,                                           icon: <FaStream size={14} /> },
   { id: "vollanalyse",    pro: true,                                           icon: <FaExpand size={14} /> },
   { id: "kompatibilitaet", pro: false,                                         icon: <FaCheckCircle size={14} /> },
   { id: "statistik",      pro: true,                                           icon: <FaChartBar size={15} /> },
   { id: "vqa",            pro: true,                                           icon: <FaEye size={15} /> },
   { id: "ytup",           pro: true,                                           icon: <FaYoutube size={15} /> },
   { id: "macos",          pro: false,                                          icon: <FaApple size={15} /> },
   { id: "sprachen",       pro: false,                                          icon: <FaGlobe size={14} /> },
   { id: "lizenz",         pro: false,                                          icon: <FaKey size={14} /> },
   { id: "nfo-export",     pro: false,                                          icon: <FaFileAlt size={15} /> },
];

const scrollTo = (id: string) => {
   document.getElementById(`roadmap-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
};

// Akzent-Auflösung — Priorität: delivered > next > pro > default
const accentFor = (item: Item): { color: string; alpha: string } => {
   if (item.delivered) return { color: GREEN, alpha: "rgba(34,197,94," };
   if (item.next) return { color: NEXT_COLOR, alpha: "rgba(167,139,250," };
   if (item.pro) return { color: PRO_COLOR, alpha: "rgba(245,197,66," };
   return { color: CYAN, alpha: "rgba(106,172,204," };
};

const topBarFor = (item: Item): string => {
   if (item.delivered) return `linear-gradient(to right, ${GREEN}, #15803d)`;
   if (item.next) return `linear-gradient(to right, ${NEXT_COLOR}, #7c3aed)`;
   if (item.pro) return "linear-gradient(to right, #f5c542, #d97706)";
   return `linear-gradient(to right, ${CYAN}, #4a7da0)`;
};

const Roadmap = () => {
   const { t } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 768px)");

   const bottomLabelFor = (item: Item): string => {
      if (item.delivered) return t("roadmap.labelDelivered");
      if (item.next) return t("roadmap.labelNext");
      if (item.pro) return t("roadmap.labelPro");
      return t("roadmap.labelBase");
   };

   return (
      <PageSection id="roadmap" title={t("roadmap.title")} subtitle={t("roadmap.subtitle")}>
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>

            {/* Quick-nav chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 56 }}>
               {ITEMS.map((item) => {
                  const { color, alpha } = accentFor(item);
                  return (
                     <motion.button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                           display: "inline-flex", alignItems: "center", gap: 6,
                           padding: "5px 14px", borderRadius: 999, cursor: "pointer",
                           background: `${alpha}0.07)`,
                           border: `1px solid ${alpha}0.22)`,
                           color,
                           fontSize: 11, fontWeight: 600,
                           fontFamily: MONO_FONT,
                           letterSpacing: "0.03em",
                        }}
                     >
                        <span style={{ opacity: 0.8 }}>{item.icon}</span>
                        {t(`roadmap.items.${item.id}.label`)}
                        {item.delivered && <FaCheck size={9} style={{ opacity: 0.9 }} />}
                     </motion.button>
                  );
               })}
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
                  const { color: accent, alpha: accentAlpha } = accentFor(item);

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
                              background: topBarFor(item),
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
                                    {item.isTab ? (
                                       <>
                                          <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                             {t("roadmap.tabPrefix")}{" "}
                                          </span>
                                          <span style={{ fontSize: 13, fontWeight: 700, color: "#eeeef5", fontFamily: MONO_FONT }}>
                                             {t(`roadmap.items.${item.id}.label`)}
                                          </span>
                                       </>
                                    ) : (
                                       <span style={{ fontSize: 13, fontWeight: 700, color: "#eeeef5" }}>
                                          {t(`roadmap.items.${item.id}.title`)}
                                       </span>
                                    )}
                                    {item.delivered ? (
                                       <DeliveredBadge label={t("roadmap.badgeDelivered")} version={item.delivered.version} />
                                    ) : item.next ? (
                                       <NextBadge label={t("roadmap.badgeNext")} />
                                    ) : item.pro ? (
                                       <ProBadge label={t("roadmap.badgePro")} />
                                    ) : null}
                                 </h3>
                              </div>

                              {/* Description */}
                              <p style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.75, margin: "0 0 12px" }}>
                                 {t(`roadmap.items.${item.id}.description`)}
                              </p>

                              {/* Tags */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                 {(t(`roadmap.items.${item.id}.tags`, { returnObjects: true }) as string[]).map((tag) => (
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
                                    {bottomLabelFor(item)}
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
