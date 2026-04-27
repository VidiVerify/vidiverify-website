import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import { Box, Film, Music, ChevronLeft, ChevronRight } from "lucide-react";
import { SiApple, SiGoogle, SiDolby, SiDts } from "react-icons/si";
import { getFormats } from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import { slideInLeft, rotateInUp, slideInRight } from "@utils/animations";

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

const TILE_WIDTH  = 108;
const TILE_GAP    = 12;
const SCROLL_STEP = (TILE_WIDTH + TILE_GAP) * 5;

const FormatTile = ({ entry, accentColor }: { entry: FormatEntry; accentColor: string }) => {
   const BrandIcon = BRAND_ICONS[entry.name];

   const inner = (
      <motion.div
         whileHover={{ scale: 1.07, y: -3, boxShadow: `0 0 18px ${accentColor}55, 0 0 6px ${accentColor}33` }}
         whileTap={{ scale: 0.97 }}
         transition={{ type: "spring", stiffness: 260, damping: 22 }}
         style={{
            width: TILE_WIDTH,
            minWidth: TILE_WIDTH,
            height: 100,
            padding: "12px 10px",
            borderRadius: 12,
            background: "rgba(10,10,26,0.65)",
            border: `1px solid ${accentColor}22`,
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 5,
            cursor: entry.url ? "pointer" : "default",
            flexShrink: 0,
            position: "relative",
         }}
      >
         {BrandIcon && (
            <BrandIcon size={18} style={{ color: accentColor, opacity: 0.85 }} />
         )}
         <span style={{
            fontSize: 14, fontWeight: 800, color: accentColor,
            letterSpacing: "0.05em", lineHeight: 1,
            fontFamily: "var(--font-mono)",
         }}>
            {entry.name}
         </span>
         <span style={{
            fontSize: 9, color: "#6e6e90", textAlign: "center",
            lineHeight: 1.3, width: "100%",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
         }}>
            {entry.full}
         </span>
         {entry.url && (
            <div style={{
               position: "absolute", top: 5, right: 6,
               width: 5, height: 5, borderRadius: "50%",
               background: accentColor, opacity: 0.5,
            }} />
         )}
      </motion.div>
   );

   return entry.url
      ? <a href={entry.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", flexShrink: 0 }}>{inner}</a>
      : inner;
};

const ScrollBtn = ({ dir, onClick, accentColor, visible }: { dir: "left" | "right"; onClick: () => void; accentColor: string; visible: boolean }) => (
   <motion.button
      onClick={onClick}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.7 }}
      transition={{ duration: 0.2 }}
      style={{
         flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
         background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
         color: accentColor, display: "flex", alignItems: "center",
         justifyContent: "center", cursor: visible ? "pointer" : "default",
         pointerEvents: visible ? "auto" : "none",
         transition: "background 0.2s, border-color 0.2s", alignSelf: "center",
      }}
      onMouseEnter={(e) => { if (visible) { (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}25`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}55`; } }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}12`; (e.currentTarget as HTMLButtonElement).style.borderColor = `${accentColor}30`; }}
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
   >
      {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
   </motion.button>
);

interface FormatGroupProps {
   title: string;
   icon: React.ReactNode;
   iconColor: string;
   formats: FormatEntry[];
   accentColor: string;
   anim: Variants;
}

const FormatGroup = ({ title, icon, iconColor, formats, accentColor, anim }: FormatGroupProps) => {
   const scrollRef = useRef<HTMLDivElement>(null);
   const [canLeft, setCanLeft] = useState(false);
   const [canRight, setCanRight] = useState(true);

   const updateBtns = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setCanLeft(el.scrollLeft > 4);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
   }, []);

   useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      updateBtns();
      el.addEventListener("scroll", updateBtns, { passive: true });
      return () => el.removeEventListener("scroll", updateBtns);
   }, [updateBtns]);

   const scroll = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });

   return (
      <motion.div
         variants={anim}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
               width: 40, height: 40, borderRadius: 12,
               background: `${iconColor}15`, border: `1px solid ${iconColor}30`,
               display: "flex", alignItems: "center", justifyContent: "center",
               color: iconColor, flexShrink: 0,
            }}>
               {icon}
            </div>
            <div>
               <h3 style={{ fontSize: 17, fontWeight: 700, color: "#eeeef5", lineHeight: 1.2 }}>{title}</h3>
               <span style={{ fontSize: 12, color: "#6e6e90" }}>{formats.length} Formate unterstützt</span>
            </div>
         </div>

         <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ScrollBtn dir="left" onClick={() => scroll(-1)} accentColor={accentColor} visible={canLeft} />
            <div style={{ flex: 1, overflow: "hidden", padding: "0 2px" }}>
               <div
                  ref={scrollRef}
                  className="format-scroll"
                  style={{
                     overflowX: "auto", display: "flex", gap: TILE_GAP,
                     paddingTop: 22, paddingBottom: 10,
                     paddingLeft: 8, paddingRight: 8,
                     scrollbarWidth: "none", msOverflowStyle: "none",
                  } as React.CSSProperties}
               >
                  {formats.map((entry) => (
                     <FormatTile key={entry.name} entry={entry} accentColor={accentColor} />
                  ))}
               </div>
            </div>
            <ScrollBtn dir="right" onClick={() => scroll(1)} accentColor={accentColor} visible={canRight} />
         </div>
      </motion.div>
   );
};

const Achievement = () => {
   const formats = useMemo(() => getFormats(), []);

   return (
      <PageSection id="achievements" title="Formate" subtitle="Unterstützte Formate">
         <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
            <FormatGroup title="Videocontainer"        icon={<Box size={20} />}  iconColor="#6aaccc" formats={formats.containers}  accentColor="#6aaccc" anim={slideInLeft} />
            <FormatGroup title="Videoformate & Codecs" icon={<Film size={20} />} iconColor="#22c55e" formats={formats.videoCodecs} accentColor="#9cc7e0" anim={rotateInUp} />
            <FormatGroup title="Audioformate & Codecs" icon={<Music size={20} />} iconColor="#f59e0b" formats={formats.audioCodecs} accentColor="#4a7da0" anim={slideInRight} />
         </div>
      </PageSection>
   );
};

export default Achievement;
