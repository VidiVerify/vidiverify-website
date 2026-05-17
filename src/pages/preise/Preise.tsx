import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaKey, FaRocket, FaHeart, FaScroll } from "react-icons/fa";
import PageSection from "@components/layout/PageSection";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";
import ProBadge from "@components/ui/ProBadge";

const FREE_GREEN = "#22c55e";

const Preise = () => {
   const { t } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 768px)");

   const privateBullets = t("pricing.privateBullets", { returnObjects: true }) as string[];
   const commercialBullets = t("pricing.commercialBullets", { returnObjects: true }) as string[];
   const licensePoints: React.ReactNode[] = [
      ...commercialBullets,
      <><span>{t("pricing.commercialBulletProPart1")}</span><ProBadge />{t("pricing.commercialBulletProPart2")}</>,
   ];

   const scrollTo = (id: string) => {
      document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
   };

   return (
      <PageSection id="preise" title={t("pricing.title")} subtitle={t("pricing.subtitle")}>
         <motion.div
            style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         >
            {/* ── A + B: Privat & Lizenz ── */}
            <motion.div
               variants={staggerContainerSlow}
               style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}
            >
               {/* A – Kostenfreie Nutzung */}
               <motion.div variants={staggerItemSlow} className="glass-card"
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(34,197,94,0.1)", transition: { duration: 0.3 } }}
                  style={{
                  padding: isMobile ? "24px 20px" : "28px 32px",
                  display: "flex", flexDirection: "column", gap: 16,
                  borderTop: `3px solid ${FREE_GREEN}`,
               }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <FaCheckCircle size={18} color={FREE_GREEN} />
                     </div>
                     <div>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                           {t("pricing.privateLabel")}
                        </p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: FREE_GREEN, margin: 0 }}>{t("pricing.privateTitle")}</h3>
                     </div>
                     <span style={{
                        marginLeft: "auto", padding: "3px 10px", borderRadius: 999,
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                        fontSize: 11, fontWeight: 700, color: FREE_GREEN,
                     }}>
                        {t("pricing.privateBadge")}
                     </span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     {t("pricing.privateDescription")}
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}>
                     {privateBullets.map((point) => (
                        <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none" }}>
                           <span style={{ width: 5, height: 5, borderRadius: "50%", background: FREE_GREEN, flexShrink: 0, marginTop: 7 }} />
                           <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{point}</span>
                        </li>
                     ))}
                  </ul>
                  <motion.button
                     onClick={() => scrollTo("spenden")}
                     whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                     style={{
                        alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7,
                        padding: 0, background: "none", border: "none", cursor: "pointer",
                        fontSize: 12, fontWeight: 600, color: FREE_GREEN, marginTop: "auto",
                     }}
                  >
                     <FaHeart size={12} color={FREE_GREEN} /> {t("pricing.supportCta")}
                  </motion.button>
               </motion.div>

               {/* B – Lizenzierte Nutzung */}
               <motion.div variants={staggerItemSlow} className="glass-card"
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.12)", transition: { duration: 0.3 } }}
                  style={{
                  padding: isMobile ? "24px 20px" : "28px 32px",
                  display: "flex", flexDirection: "column", gap: 16,
                  borderTop: `3px solid ${CYAN}`,
               }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <FaKey size={17} color={CYAN} />
                     </div>
                     <div>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                           {t("pricing.commercialLabel")}
                        </p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: CYAN, margin: 0 }}>{t("pricing.commercialTitle")}</h3>
                     </div>
                     <span style={{
                        marginLeft: "auto", padding: "3px 10px", borderRadius: 999,
                        background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                        fontSize: 11, fontWeight: 700, color: CYAN,
                     }}>
                        {t("pricing.commercialBadge")}
                     </span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     {t("pricing.commercialDescriptionPart1")}<ProBadge />{t("pricing.commercialDescriptionPart2")}
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}>
                     {licensePoints.map((point, i) => (
                        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none" }}>
                           <span style={{ width: 5, height: 5, borderRadius: "50%", background: CYAN, flexShrink: 0, marginTop: 7 }} />
                           <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{point}</span>
                        </li>
                     ))}
                  </ul>
               </motion.div>
            </motion.div>

            {/* ── C: Pro-Perspektive ── */}
            <motion.div variants={staggerContainerSlow}>
               {/* C – Pro-Perspektive */}
               <motion.div variants={staggerItemSlow} className="glass-card"
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.12)", transition: { duration: 0.3 } }}
                  style={{
                  padding: isMobile ? "24px 20px" : "28px 32px",
                  display: "flex", flexDirection: "column", gap: 16,
                  borderLeft: `3px solid rgba(106,172,204,0.3)`, borderRadius: "0 14px 14px 0",
               }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                     <div style={{
                        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                        background: "rgba(106,172,204,0.06)", border: "1px solid rgba(106,172,204,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <FaRocket size={17} color={CYAN} />
                     </div>
                     <div>
                        <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                           {t("pricing.perspectiveLabel")}
                        </p>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                           {t("pricing.perspectiveTitle")} <ProBadge />
                        </h3>
                     </div>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     {t("pricing.perspectiveDescriptionPart1")}<ProBadge />{t("pricing.perspectiveDescriptionPart2")}
                  </p>
                  <motion.a
                     href="#eula"
                     whileHover={{ opacity: 0.7, scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
                     style={{
                        alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 7,
                        fontSize: 12.5, fontWeight: 600, color: CYAN, textDecoration: "none", cursor: "pointer",
                     }}
                  >
                     <FaScroll size={13} color={CYAN} />
                     {t("pricing.eulaLink")}
                  </motion.a>
               </motion.div>
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Preise;
