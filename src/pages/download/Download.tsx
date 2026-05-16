import { useState } from "react";
import { motion } from "motion/react";
import { FaWindows, FaDownload, FaGithub, FaScroll, FaShieldAlt, FaTag, FaHeart, FaFileContract, FaLock, FaIdCard } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { BsCalendar3, BsFileZip } from "react-icons/bs";
import { useLatestRelease } from "@/hooks/useLatestRelease";
import PageSection from "@components/layout/PageSection";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, MONO_FONT, GLASS_BG, GLASS_BORDER } from "@/constants/theme";
import downloadConfig from "../../../data/download.json";
import useMediaQuery from "@utils/useMediaQuery";
import useIsMobileNonWindows from "@utils/useIsMobileNonWindows";
import MobileNoticeModal from "./MobileNoticeModal";

const SHARE_URL = "https://vidiverify.de/download";

const FLAGS = [
   { code: "de", label: "Deutsch" },
   { code: "us", label: "English" },
   { code: "cn", label: "中文" },
];

const formatBytes = (bytes: number): string => {
   if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
   if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
   return `${bytes} B`;
};

const formatDate = (iso: string): string => {
   if (!iso) return "—";
   return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit", month: "long", year: "numeric",
   });
};

const Skeleton = ({ width, height = 14 }: { width: number; height?: number }) => (
   <span className="skeleton" style={{ display: "inline-block", width, height, borderRadius: 6, verticalAlign: "middle" }} />
);

const Download = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");
   const isMobileNonWindows = useIsMobileNonWindows();
   const [noticeOpen, setNoticeOpen] = useState(false);

   const { data, loading, error } = useLatestRelease(
      downloadConfig.repo_owner,
      downloadConfig.repo_name,
      downloadConfig.asset_name,
   );

   const downloadUrl = data?.downloadUrl ??
      `https://github.com/${downloadConfig.repo_owner}/${downloadConfig.repo_name}/releases/latest/download/${downloadConfig.asset_name}`;

   const infoCards = [
      {
         id: "version",
         icon: <MdVerified size={18} color={CYAN} />,
         label: "Version",
         value: loading ? <Skeleton width={64} /> : error ? "—" : data?.version ?? "—",
         mono: true,
      },
      {
         id: "datum",
         icon: <BsCalendar3 size={16} color={CYAN} />,
         label: "Veröffentlicht",
         value: loading ? <Skeleton width={100} /> : formatDate(data?.publishedAt ?? ""),
         mono: false,
      },
      {
         id: "groesse",
         icon: <BsFileZip size={18} color={CYAN} />,
         label: "Dateigrösse",
         value: loading ? <Skeleton width={56} /> : data?.fileSize ? formatBytes(data.fileSize) : "—",
         mono: false,
      },
   ];

   return (
      <PageSection id="download" title="Download" subtitle="VidiVerify kostenfrei herunterladen">
         <motion.div
            style={{ maxWidth: 1152, margin: "0 auto" }}
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         >
            <motion.div
               variants={staggerItemSlow}
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "15fr 43fr 40fr",
                  gap: 12,
                  alignItems: "stretch",
               }}
            >
               {/* ── Info cards stacked ── */}
               <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {infoCards.map(({ id, icon, label, value, mono }) => (
                     <div
                        key={id}
                        className="glass-card"
                        style={{
                           flex: 1,
                           padding: "5px 16px",
                           display: "flex",
                           alignItems: "center",
                           gap: 12,
                           borderLeft: `3px solid ${CYAN}`,
                           borderRadius: "0 12px 12px 0",
                        }}
                     >
                        <div style={{
                           width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                           background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.18)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           {icon}
                        </div>
                        <div>
                           <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                              {label}
                           </p>
                           <p style={{ fontSize: 13, color: TEXT_PRIMARY, fontWeight: 600, marginTop: 2, fontFamily: mono ? MONO_FONT : undefined }}>
                              {value}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* ── CTA card ── */}
               <div
                  className="glass-card"
                  style={{
                     padding: isMobile ? "12px 20px" : "14px 28px",
                     display: "flex", flexDirection: "column", alignItems: "center",
                     justifyContent: "flex-start", gap: 12, textAlign: "center",
                  }}
               >
                  {/* Platform + flags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                     <span style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "5px 14px", borderRadius: 999,
                        background: GLASS_BG, border: `1px solid ${GLASS_BORDER}`,
                        fontSize: 12, color: TEXT_SECONDARY,
                     }}>
                        <FaWindows size={12} color={CYAN} />
                        {downloadConfig.platform}
                     </span>
                     <span style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "5px 14px", borderRadius: 999,
                        background: GLASS_BG, border: `1px solid ${GLASS_BORDER}`,
                     }}>
                        {FLAGS.map(({ code, label }) => (
                           <img key={code} src={`https://flagcdn.com/${code}.svg`} alt={label} title={label}
                              style={{ width: 22, height: 16, borderRadius: 3, objectFit: "cover", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
                           />
                        ))}
                     </span>
                  </div>

                  {/* Download button */}
                  <motion.a
                     href={downloadUrl}
                     download
                     onClick={(e) => {
                        if (isMobileNonWindows) {
                           e.preventDefault();
                           setNoticeOpen(true);
                        }
                     }}
                     whileHover={{ scale: 1.04, y: -2 }}
                     whileTap={{ scale: 0.97 }}
                     style={{
                        display: "inline-flex", alignItems: "center", gap: 12,
                        padding: "14px 32px", borderRadius: 14,
                        background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                        color: "#fff", fontSize: 15, fontWeight: 700,
                        textDecoration: "none",
                        boxShadow: `0 4px 32px rgba(106,172,204,0.35)`,
                        cursor: "pointer", width: "100%", justifyContent: "center",
                     }}
                  >
                     <FaDownload size={16} />
                     Jetzt herunterladen
                  </motion.a>

                  {/* Divider */}
                  <div style={{ width: "100%", height: 1, background: GLASS_BORDER }} />

                  {/* Dateiname + SHA-256 */}
                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                     {/* Dateiname */}
                     <div style={{ textAlign: "left" }}>
                        <span style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                           Dateiname
                        </span>
                        <div style={{ marginTop: 4 }}>
                           <span style={{
                              display: "inline-block", padding: "2px 10px", borderRadius: 999,
                              background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                              fontSize: 11, fontWeight: 600, color: CYAN, fontFamily: MONO_FONT,
                           }}>
                              {downloadConfig.asset_name}
                           </span>
                        </div>
                     </div>
                     {/* SHA-256 */}
                     <div style={{ textAlign: "left" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                           SHA-256 <FaLock size={9} color="#f5c542" />
                        </span>
                        <div style={{ marginTop: 4 }}>
                           {loading ? (
                              <Skeleton width={160} height={22} />
                           ) : data?.sha256 ? (
                              <span style={{
                                 display: "inline-block", padding: "3px 10px", borderRadius: 8,
                                 background: "rgba(106,172,204,0.06)", border: "1px solid rgba(106,172,204,0.18)",
                                 fontSize: 10, fontWeight: 500, color: CYAN, fontFamily: MONO_FONT,
                                 wordBreak: "break-all", lineHeight: 1.6,
                              }}>
                                 {data.sha256}
                              </span>
                           ) : (
                              <span style={{
                                 display: "inline-block", padding: "2px 10px", borderRadius: 999,
                                 background: "rgba(106,172,204,0.06)", border: "1px solid rgba(106,172,204,0.15)",
                                 fontSize: 11, color: TEXT_MUTED, fontFamily: MONO_FONT,
                              }}>
                                 Verfügbar nach erstem Release
                              </span>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Links */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "flex-start", width: "100%", marginTop: "auto", paddingTop: 8 }}>
                     <motion.a href={downloadConfig.links.all_releases} target="_blank" rel="noopener noreferrer"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaGithub size={13} /> Alle Releases
                     </motion.a>
                     <motion.a href={downloadConfig.links.changelog} target="_blank" rel="noopener noreferrer"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaScroll size={12} /> Release Notes
                     </motion.a>
                     <motion.a href="https://vidiverify.de/pad/vidiverify.xml" target="_blank" rel="noopener noreferrer"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaIdCard size={12} /> Digitaler Steckbrief (PAD)
                     </motion.a>
                  </div>
               </div>

               {/* ── License card ── */}
               <div
                  className="glass-card"
                  style={{
                     padding: "12px 26px",
                     display: "flex",
                     flexDirection: "column",
                     gap: 10,
                     borderTop: `3px solid rgba(106,172,204,0.35)`,
                  }}
               >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                     <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <FaShieldAlt size={15} color={CYAN} />
                     </div>
                     <span style={{ fontSize: 11, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Lizenz & Bezug
                     </span>
                  </div>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.8, margin: 0 }}>
                     Diese Seite ist die offizielle Quelle für VidiVerify. Der hier bereitgestellte Build ist signiert und verifizierbar – der SHA-256-Prüfwert entspricht exakt dem veröffentlichten Installer. Die private Nutzung ist kostenfrei. Für nicht ausschliesslich private Nutzung ist eine offizielle Lizenzierung vorgesehen.
                  </p>
                  <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.8, margin: 0 }}>
                     VidiVerify ist ausserdem über weitere Downloadportale erhältlich. Unabhängig vom Bezugsweg lässt sich die Echtheit jedes Builds anhand des SHA-256-Prüfwerts nachvollziehen.
                  </p>
                  <div style={{ display: "flex", flexWrap: "nowrap", gap: 16, marginTop: "auto" }}>
                     <motion.a href="https://github.com/VidiVerify" target="_blank" rel="noopener noreferrer"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaGithub size={13} /> Projektquelle
                     </motion.a>
                     <motion.a href="#preise"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaTag size={12} /> Preise
                     </motion.a>
                     <motion.a href="#spenden"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaHeart size={12} /> Spenden
                     </motion.a>
                     <motion.a href="#eula"
                        whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: CYAN, textDecoration: "none" }}>
                        <FaFileContract size={12} /> EULA
                     </motion.a>
                  </div>
               </div>
            </motion.div>

            {/* ── Bekannt von / Trust-Strip ── */}
            <motion.div
               variants={staggerItemSlow}
               style={{
                  marginTop: 16,
                  position: "relative",
                  padding: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  isolation: "isolate",
               }}
            >
               {/* Rotierender Conic-Gradient-Glow als Border */}
               <motion.div
                  aria-hidden
                  style={{
                     position: "absolute",
                     top: "-50%",
                     left: "-50%",
                     width: "200%",
                     height: "200%",
                     background: `conic-gradient(from 0deg, transparent 0deg, ${CYAN} 90deg, transparent 180deg, ${CYAN} 270deg, transparent 360deg)`,
                     opacity: 0.55,
                     zIndex: -1,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
               />

               {/* Inner content (deckt Gradient ab, nur 1px Rand sichtbar) */}
               <div
                  style={{
                     position: "relative",
                     background: "rgba(6,6,16,0.94)",
                     backdropFilter: "blur(8px)",
                     borderRadius: 15,
                     padding: isMobile ? "20px 16px" : "22px 32px",
                     display: "flex",
                     flexDirection: "column",
                     alignItems: "center",
                     gap: 14,
                  }}
               >
                  <span
                     style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: TEXT_MUTED,
                        textTransform: "uppercase",
                        letterSpacing: "0.22em",
                     }}
                  >
                     Bekannt von
                  </span>
                  <div
                     style={{
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: "center",
                        gap: isMobile ? 16 : 40,
                        flexWrap: "wrap",
                        justifyContent: "center",
                     }}
                  >
                     {/* Microsoft Store */}
                     <motion.a
                        href="https://apps.microsoft.com/store/detail/XPDLZGLQP4LKZW"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, filter: "brightness(1.25)" }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        style={{
                           display: "inline-flex",
                           alignItems: "center",
                           gap: 10,
                           textDecoration: "none",
                           color: "#ffffff",
                           opacity: 0.88,
                        }}
                        aria-label="VidiVerify im Microsoft Store oeffnen"
                     >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                           <path d="M2 3h9.5v9.5H2zM12.5 3H22v9.5h-9.5zM2 13.5h9.5V23H2zM12.5 13.5H22V23h-9.5z" />
                        </svg>
                        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.01em" }}>
                           Microsoft Store
                        </span>
                     </motion.a>

                     {/* Divider (nur Desktop) */}
                     {!isMobile && (
                        <span
                           aria-hidden
                           style={{
                              width: 1,
                              height: 22,
                              background: "rgba(255,255,255,0.18)",
                           }}
                        />
                     )}

                     {/* heise Download */}
                     <motion.a
                        href="https://www.heise.de/download/product/vidiverify1"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05, filter: "brightness(1.25)" }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                        style={{
                           display: "inline-flex",
                           alignItems: "baseline",
                           gap: 8,
                           textDecoration: "none",
                           color: "#ffffff",
                           opacity: 0.88,
                        }}
                        aria-label="VidiVerify bei heise Download oeffnen"
                     >
                        <span
                           style={{
                              fontSize: 16,
                              fontWeight: 700,
                              letterSpacing: "-0.02em",
                              fontFamily: '"Helvetica Neue", Arial, sans-serif',
                           }}
                        >
                           heise
                        </span>
                        <span
                           style={{
                              fontSize: 13,
                              fontWeight: 400,
                              opacity: 0.7,
                              letterSpacing: "0.02em",
                           }}
                        >
                           Download
                        </span>
                     </motion.a>
                  </div>
               </div>
            </motion.div>
         </motion.div>
         <MobileNoticeModal open={noticeOpen} onClose={() => setNoticeOpen(false)} shareUrl={SHARE_URL} />
      </PageSection>
   );
};

export default Download;
