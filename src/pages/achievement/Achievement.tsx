import { useMemo, useState } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import { Box, Film, Music, ChevronLeft, ChevronRight } from "lucide-react";
import { SiApple, SiGoogle, SiDolby, SiDts } from "react-icons/si";
import { getFormats } from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import { slideInLeft, rotateInUp, slideInRight } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";

const SHORT_DESKTOP_QUERY = "(max-height: 820px) and (min-width: 1024px)";

interface FormatEntry {
   name: string;
   full: string;
   url: string | null;
}

type BrandIcon = React.ComponentType<{ size?: number; style?: React.CSSProperties }>;

const BRAND_ICONS: Record<string, BrandIcon> = {
   "MOV":    SiApple,  "M4V":    SiApple,
   "ProRes": SiApple,  "ALAC":   SiApple,
   "VP8":    SiGoogle, "VP9":    SiGoogle, "WebM":   SiGoogle,
   "AC-3":   SiDolby,  "E-AC-3": SiDolby,
   "TrueHD": SiDolby,  "ATMOS":  SiDolby,
   "DTS":    SiDts,    "DTS-HD": SiDts,
};

const TILE_WIDTH = 100;
const TILE_GAP   = 10;
const TILE_HEIGHT = 76;

// Marquee-Tempo: konstante Pixel/Sekunde, abhängig von Anzahl Tiles
// 18 px/s ist gemütlich; pro Tile + Gap = 110 px → eine Tile alle ~6 s
const PX_PER_SECOND = 18;

const FormatTile = ({ entry, accentColor }: { entry: FormatEntry; accentColor: string }) => {
   const BrandIcon = BRAND_ICONS[entry.name];

   const inner = (
      <motion.div
         whileHover={{
            scale: 1.12,
            y: -4,
            rotate: -1.5,
            boxShadow: `0 0 28px ${accentColor}77, 0 0 8px ${accentColor}55`,
            zIndex: 5,
         }}
         whileTap={{ scale: 0.95 }}
         transition={{ type: "spring", stiffness: 320, damping: 20 }}
         style={{
            width: TILE_WIDTH,
            minWidth: TILE_WIDTH,
            height: TILE_HEIGHT,
            padding: "8px 8px",
            borderRadius: 10,
            background: "rgba(10,10,26,0.65)",
            border: `1px solid ${accentColor}28`,
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 3,
            cursor: entry.url ? "pointer" : "default",
            flexShrink: 0,
            position: "relative",
         }}
      >
         {BrandIcon && (
            <BrandIcon size={15} style={{ color: accentColor, opacity: 0.85 }} />
         )}
         <span style={{
            fontSize: 13, fontWeight: 800, color: accentColor,
            letterSpacing: "0.04em", lineHeight: 1,
            fontFamily: "var(--font-mono)",
         }}>
            {entry.name}
         </span>
         <span style={{
            fontSize: 9, color: "#6e6e90", textAlign: "center",
            lineHeight: 1.25, width: "100%",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
         }}>
            {entry.full}
         </span>
         {entry.url && (
            <div style={{
               position: "absolute", top: 4, right: 5,
               width: 4, height: 4, borderRadius: "50%",
               background: accentColor, opacity: 0.55,
            }} />
         )}
      </motion.div>
   );

   return entry.url
      ? <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flexShrink: 0 }}>{inner}</a>
      : inner;
};

interface FormatGroupProps {
   title: string;
   icon: React.ReactNode;
   iconColor: string;
   formats: FormatEntry[];
   accentColor: string;
   anim: Variants;
   direction: "left" | "right";
}

const FormatGroup = ({ title, icon, iconColor, formats, accentColor, anim, direction }: FormatGroupProps) => {
   const { t } = useTranslation();
   const [manualOffset, setManualOffset] = useState(0);
   const isShortDesktop = useMediaQuery(SHORT_DESKTOP_QUERY);

   // Marquee-Dauer berechnen: Breite EINER Kopie / Geschwindigkeit
   // (Track ist 3× kopiert — Animation läuft genau über eine Kopien-Breite = 33.33%)
   const copyWidth = formats.length * (TILE_WIDTH + TILE_GAP);
   const durationSec = Math.round(copyWidth / PX_PER_SECOND);

   // Track ist 3× gerendert; um die Mitte (Copy 2) als Ruheposition zu nutzen,
   // verschieben wir den Start um -copyWidth/2 und klemmen den Manual-Offset
   // auf ±copyWidth/2 — damit zeigt der Viewport NIE leere Stellen,
   // egal wo in der Marquee-Animation man ist.
   const HOME_SHIFT = -copyWidth / 2;
   const MAX_OFFSET = copyWidth / 2;
   const NUDGE_STEP = (TILE_WIDTH + TILE_GAP) * 5;
   const handleNudge = (dir: 1 | -1) => {
      setManualOffset((prev) => {
         const next = prev + dir * NUDGE_STEP;
         return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, next));
      });
   };

   return (
      <motion.div
         variants={anim}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         style={{ display: "flex", flexDirection: "column", gap: isShortDesktop ? 6 : 8 }}
      >
         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
               width: 32, height: 32, borderRadius: 10,
               background: `${iconColor}15`, border: `1px solid ${iconColor}30`,
               display: "flex", alignItems: "center", justifyContent: "center",
               color: iconColor, flexShrink: 0,
            }}>
               {icon}
            </div>
            <div>
               <h3 style={{ fontSize: 14, fontWeight: 700, color: "#eeeef5", lineHeight: 1.2 }}>{title}</h3>
               <span style={{ fontSize: 11, color: "#6e6e90" }}>{t("formats.supported", { count: formats.length })}</span>
            </div>
         </div>

         <div className="marquee-container">
            <button
               className="marquee-arrow marquee-arrow-left"
               style={{
                  background: `${accentColor}22`,
                  border: `1px solid ${accentColor}55`,
                  color: accentColor,
               }}
               onClick={() => handleNudge(1)}
               aria-label="Nach links blättern"
            >
               <ChevronLeft size={16} />
            </button>

            <div className="marquee-wrap">
               <div
                  className="marquee-shift"
                  style={{ transform: `translate3d(${manualOffset + HOME_SHIFT}px, 0, 0)` }}
               >
                  <div
                     className={`marquee-track marquee-${direction}`}
                     style={{
                        gap: TILE_GAP,
                        paddingTop: isShortDesktop ? 6 : 14,
                        paddingBottom: isShortDesktop ? 4 : 8,
                        animationDuration: `${durationSec}s`,
                     }}
                  >
                     {[...formats, ...formats, ...formats].map((entry, idx) => (
                        <FormatTile key={`${entry.name}-${idx}`} entry={entry} accentColor={accentColor} />
                     ))}
                  </div>
               </div>
            </div>

            <button
               className="marquee-arrow marquee-arrow-right"
               style={{
                  background: `${accentColor}22`,
                  border: `1px solid ${accentColor}55`,
                  color: accentColor,
               }}
               onClick={() => handleNudge(-1)}
               aria-label="Nach rechts blättern"
            >
               <ChevronRight size={16} />
            </button>
         </div>
      </motion.div>
   );
};

const Achievement = () => {
   const { t } = useTranslation();
   const formats = useMemo(() => getFormats(), []);
   const isShortDesktop = useMediaQuery(SHORT_DESKTOP_QUERY);

   return (
      <PageSection id="achievements" title={t("formats.title")} subtitle={t("formats.subtitle")}>
         <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: isShortDesktop ? 12 : 18 }}>
            <FormatGroup title={t("formats.videoContainer")} icon={<Box size={18} />}   iconColor="#6aaccc" formats={formats.containers}  accentColor="#6aaccc" anim={slideInLeft}  direction="left"  />
            <FormatGroup title={t("formats.videoCodecs")}    icon={<Film size={18} />}  iconColor="#22c55e" formats={formats.videoCodecs} accentColor="#9cc7e0" anim={rotateInUp}   direction="right" />
            <FormatGroup title={t("formats.audioCodecs")}    icon={<Music size={18} />} iconColor="#f59e0b" formats={formats.audioCodecs} accentColor="#4a7da0" anim={slideInRight} direction="left"  />
         </div>
      </PageSection>
   );
};

export default Achievement;
