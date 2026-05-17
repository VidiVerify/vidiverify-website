import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaPaypal, FaHandHoldingHeart, FaHeart, FaCode, FaShieldAlt, FaLeaf } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import { getDonate } from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, GLASS_BG, GLASS_BORDER } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
   FaPaypal,
   FaHandHoldingHeart,
};

const WAY_COLORS = {
   paypal:  { accent: "#009cde", glow: "rgba(0,156,222,0.25)",  gradient: "linear-gradient(135deg, #009cde, #005ea6)" },
   "4fund": { accent: CYAN,      glow: "rgba(106,172,204,0.25)", gradient: `linear-gradient(135deg, ${CYAN}, #4a7da0)` },
};

const REASON_ICONS = [
   <FaCode key="code" size={20} color={CYAN} />,
   <FaShieldAlt key="shield" size={20} color={CYAN} />,
   <FaLeaf key="leaf" size={20} color={CYAN} />,
];

const Donate = () => {
   const { t } = useTranslation();
   const donate = getDonate();
   const isMobile = useMediaQuery("(max-width: 768px)");

   const wayLabels: Record<string, string> = {
      paypal: t("donate.waysPaypal"),
      "4fund": t("donate.ways4fund"),
   };

   const supportReasons = (t("donate.reasons", { returnObjects: true }) as { title: string; text: string }[])
      .map((r, i) => ({ ...r, icon: REASON_ICONS[i] }));

   return (
      <PageSection id="spenden" title={t("donate.title")} subtitle={t("donate.subtitle")}>
         <motion.div
            style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 120 }}
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         >
            {/* ── Hero row: heart + description + CTAs ── */}
            <motion.div
               variants={staggerContainerSlow}
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "72px 1fr 220px",
                  gap: 14,
                  alignItems: "stretch",
               }}
            >
               {/* Heart tile */}
               {!isMobile && (
                  <motion.div
                     className="glass-card"
                     variants={staggerItemSlow}
                     whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.18)", transition: { duration: 0.3 } }}
                     style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderTop: `3px solid rgba(106,172,204,0.4)`,
                     }}
                  >
                     <FaHeart size={32} color={CYAN} />
                  </motion.div>
               )}

               {/* Description card */}
               <motion.div
                  className="glass-card"
                  variants={staggerItemSlow}
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.12)", transition: { duration: 0.3 } }}
                  style={{
                     padding: isMobile ? "24px 20px" : "28px 32px",
                     borderTop: `3px solid rgba(106,172,204,0.4)`,
                     display: "flex", flexDirection: "column", gap: 14,
                  }}
               >
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>
                     {t("donate.headline")}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.85, color: TEXT_SECONDARY, margin: 0 }}>
                     {t("donate.description")}
                  </p>
               </motion.div>

               {/* CTA buttons */}
               <div style={{ display: "flex", flexDirection: "column", gap: 12, width: isMobile ? "100%" : "100%" }}>
                  {donate.ways.map((way) => {
                     const Icon = ICON_MAP[way.icon];
                     const colors = WAY_COLORS[way.id as keyof typeof WAY_COLORS] ?? WAY_COLORS["4fund"];
                     return (
                        <motion.a
                           key={way.id}
                           href={way.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           whileHover={{ scale: 1.03, y: -2 }}
                           whileTap={{ scale: 0.97 }}
                           style={{
                              flex: 1,
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
                              padding: "0 28px",
                              borderRadius: 14,
                              background: colors.gradient,
                              color: "#fff", fontSize: 15, fontWeight: 700,
                              textDecoration: "none",
                              boxShadow: `0 4px 28px ${colors.glow}`,
                              cursor: "pointer", minHeight: 64,
                           }}
                        >
                           {Icon && <Icon size={20} color="#fff" />}
                           {wayLabels[way.id] ?? way.label.replace("Spenden via ", "")}
                           <ArrowUpRight size={16} style={{ opacity: 0.8 }} />
                        </motion.a>
                     );
                  })}
               </div>
            </motion.div>

            {/* ── Support reasons ── */}
            <motion.div
               variants={staggerContainerSlow}
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: 12,
               }}
            >
               {supportReasons.map((reason, i) => (
                  <motion.div
                     key={i}
                     variants={staggerItemSlow}
                     whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.12)", transition: { duration: 0.3 } }}
                     className="glass-card"
                     style={{
                        padding: "22px 22px",
                        display: "flex", flexDirection: "column", gap: 12,
                        borderLeft: `3px solid rgba(106,172,204,0.3)`,
                        borderRadius: "0 14px 14px 0",
                     }}
                  >
                     <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        {reason.icon}
                     </div>
                     <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, margin: 0 }}>
                        {reason.title}
                     </p>
                     <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0 }}>
                        {reason.text}
                     </p>
                  </motion.div>
               ))}
            </motion.div>

            {/* ── Note ── */}
            <motion.div variants={staggerItemSlow} style={{ display: "flex", justifyContent: "center" }}>
               <span style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "8px 18px", borderRadius: 16,
                  background: GLASS_BG, border: `1px solid ${GLASS_BORDER}`,
                  fontSize: 12, color: "rgba(165,165,192,0.6)", letterSpacing: "0.02em", lineHeight: 1.6,
               }}>
                  <span style={{ fontSize: 13, opacity: 0.7 }}>ℹ</span>
                  {t("donate.note")}
               </span>
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Donate;
