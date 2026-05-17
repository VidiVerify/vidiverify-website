import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaBookOpen, FaDownload } from "react-icons/fa";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, GLASS_BG, GLASS_BORDER } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";

type Lang = "de" | "en";

const MANUAL_VERSION = "v1.4.7";

interface ManualVariantStatic {
   code: Lang;
   label: string;
   flagCode: string;
   file: string;
   size: string;
   ariaKey: "manualAriaDe" | "manualAriaEn";
}

const VARIANTS: ManualVariantStatic[] = [
   {
      code: "de",
      label: "Deutsch",
      flagCode: "de",
      file: "/handbuch_de.pdf",
      size: "1,7 MB",
      ariaKey: "manualAriaDe",
   },
   {
      code: "en",
      label: "English",
      flagCode: "us",
      file: "/handbuch_en.pdf",
      size: "1,8 MB",
      ariaKey: "manualAriaEn",
   },
];

const ManualDownload = () => {
   const { t, i18n } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 768px)");

   // Primary-Sprache folgt der aktuellen App-Sprache — direkt aus i18n abgeleitet,
   // kein useState/useEffect noetig (useTranslation re-rendert bei Sprachwechsel).
   const currentLang = (i18n.resolvedLanguage ?? i18n.language ?? "en").toLowerCase();
   const primaryLang: Lang = currentLang.startsWith("de") ? "de" : "en";

   return (
      <div
         className="glass-card"
         style={{
            marginTop: 16,
            padding: isMobile ? "16px 18px" : "16px 24px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 14 : 20,
            borderLeft: `3px solid ${CYAN}`,
            borderRadius: "0 12px 12px 0",
         }}
      >
         {/* ── Header ── */}
         <div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 12,
               flexShrink: 0,
               minWidth: isMobile ? "auto" : 220,
            }}
         >
            <div
               style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: "rgba(106,172,204,0.08)",
                  border: "1px solid rgba(106,172,204,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <FaBookOpen size={16} color={CYAN} />
            </div>
            <div>
               <p
                  style={{
                     fontSize: 10,
                     color: TEXT_MUTED,
                     textTransform: "uppercase",
                     letterSpacing: "0.06em",
                     fontWeight: 600,
                  }}
               >
                  {t("download.manualSection")}
               </p>
               <p
                  style={{
                     fontSize: 14,
                     color: TEXT_PRIMARY,
                     fontWeight: 600,
                     marginTop: 2,
                  }}
               >
                  {t("download.manualKind", { version: MANUAL_VERSION })}
               </p>
            </div>
         </div>

         {/* ── Sprach-Buttons ── */}
         <div
            style={{
               display: "flex",
               gap: 10,
               flex: 1,
               width: "100%",
               flexDirection: isMobile ? "column" : "row",
            }}
         >
            {VARIANTS.map((v) => {
               const isPrimary = v.code === primaryLang;
               return (
                  <motion.a
                     key={v.code}
                     href={v.file}
                     download
                     aria-label={t(`download.${v.ariaKey}`)}
                     whileHover={{ scale: 1.02, y: -1 }}
                     whileTap={{ scale: 0.98 }}
                     style={{
                        flex: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        borderRadius: 12,
                        background: isPrimary
                           ? `linear-gradient(135deg, ${CYAN}, #4a7da0)`
                           : GLASS_BG,
                        border: isPrimary
                           ? "1px solid transparent"
                           : `1px solid ${GLASS_BORDER}`,
                        color: isPrimary ? "#fff" : TEXT_SECONDARY,
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                        boxShadow: isPrimary
                           ? "0 4px 18px rgba(106,172,204,0.30)"
                           : "none",
                        cursor: "pointer",
                        justifyContent: "space-between",
                     }}
                  >
                     <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                        <img
                           src={`https://flagcdn.com/${v.flagCode}.svg`}
                           alt=""
                           aria-hidden
                           style={{
                              width: 22,
                              height: 16,
                              borderRadius: 3,
                              objectFit: "cover",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
                              flexShrink: 0,
                           }}
                        />
                        <span>{v.label}</span>
                     </span>
                     <span
                        style={{
                           display: "inline-flex",
                           alignItems: "center",
                           gap: 8,
                           fontSize: 11,
                           fontWeight: 500,
                           opacity: isPrimary ? 0.9 : 0.7,
                        }}
                     >
                        {v.size}
                        <FaDownload size={11} />
                     </span>
                  </motion.a>
               );
            })}
         </div>
      </div>
   );
};

export default ManualDownload;
