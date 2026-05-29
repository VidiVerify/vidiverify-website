import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { MdVerified } from "react-icons/md";
import { FaGithub, FaFacebook, FaInstagram } from "react-icons/fa";
import { Mail, ArrowUpRight, PackageSearch } from "lucide-react";
import { getGitHubUsername } from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import GlassCard from "@components/ui/GlassCard";
import NeuralNetAnim from "@pages/services/animations/NeuralNetAnim";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, GLASS_BORDER } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";
import contactData from "../../../data/contact.json";

const SUPPORT_GREEN = "#22c55e";

// Compact inline network animation for support card

const Contact = () => {
   const { t } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 768px)");
   const isShortDesktop = useMediaQuery("(max-height: 820px) and (min-width: 1024px)");
   const githubUsername = getGitHubUsername();
   const email = `${contactData.email.user}@${contactData.email.domain}`;

   const tileStyle = {
      padding: isShortDesktop ? "10px 14px" : "14px 14px",
      textAlign: "center" as const,
      textDecoration: "none",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: 6,
   };
   const tileMinHeight = isShortDesktop ? 100 : 120;
   const trustPadding = isMobile ? "16px 16px" : isShortDesktop ? "10px 28px" : "18px 28px";
   const supportContentPadding = isShortDesktop ? "10px 18px" : "14px 18px";

   return (
      <PageSection id="contact" title={t("contact.title")} subtitle={t("contact.subtitle")}>
         <motion.div
            style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: isShortDesktop ? 8 : 10 }}
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         >
            {/* ── Trust card + GitHub + Facebook ── */}
            <motion.div variants={staggerContainerSlow} style={{ display: "flex", flexDirection: "column", gap: isShortDesktop ? 10 : 15 }}>
               {/* Trust card — full width on mobile */}
               <motion.div
                  variants={staggerItemSlow}
                  className="glass-card"
                  style={{
                     padding: trustPadding,
                     display: "flex", gap: 16, alignItems: "flex-start",
                     borderLeft: `3px solid ${CYAN}`, borderRadius: "0 16px 16px 0",
                  }}
               >
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                     <MdVerified size={20} color={CYAN} />
                  </div>
                  <div>
                     <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>
                        {t("contact.trustHeading")}
                     </p>
                     <p style={{ fontSize: 13, lineHeight: 1.6, color: TEXT_SECONDARY }}>{t("contact.trustText")}</p>
                  </div>
               </motion.div>

               {/* GitHub + Facebook + Instagram — 3-column grid (1 on mobile) */}
               <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 14 }}>
                  <motion.a
                     href={`https://github.com/${githubUsername}`}
                     target="_blank" rel="noopener noreferrer"
                     className="glass-card" variants={staggerItemSlow}
                     whileHover={{ y: -4, borderColor: "rgba(165,165,192,0.3)" }}
                     style={{ ...tileStyle, justifyContent: "center", minHeight: tileMinHeight }}
                  >
                     <FaGithub size={22} color="#a5a5c0" />
                     <span style={{ fontSize: 11, fontWeight: 600, color: "#a5a5c0", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("contact.github")}</span>
                     <span style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>{githubUsername}</span>
                     <span style={{ fontSize: 11, color: TEXT_MUTED }}>{t("contact.githubSub")}</span>
                     <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#a5a5c0", marginTop: 4 }}>
                        {t("contact.githubAction")} <ArrowUpRight size={12} />
                     </span>
                  </motion.a>

                  <motion.a
                     href="https://www.facebook.com/VidiVerify"
                     target="_blank" rel="noopener noreferrer"
                     className="glass-card" variants={staggerItemSlow}
                     whileHover={{ y: -4, borderColor: "rgba(24,119,242,0.3)" }}
                     style={{ ...tileStyle, justifyContent: "center", minHeight: tileMinHeight }}
                  >
                     <FaFacebook size={22} color="#1877f2" />
                     <span style={{ fontSize: 11, fontWeight: 600, color: "#1877f2", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("contact.facebook")}</span>
                     <span style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>VidiVerify</span>
                     <span style={{ fontSize: 11, color: TEXT_MUTED }}>{t("contact.facebookSub")}</span>
                     <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#1877f2", marginTop: 4 }}>
                        {t("contact.facebookAction")} <ArrowUpRight size={12} />
                     </span>
                  </motion.a>

                  <motion.a
                     href="https://instagram.com/vidiverify"
                     target="_blank" rel="noopener noreferrer"
                     className="glass-card" variants={staggerItemSlow}
                     whileHover={{ y: -4, borderColor: "rgba(225,48,108,0.3)" }}
                     style={{ ...tileStyle, justifyContent: "center", minHeight: tileMinHeight }}
                  >
                     <FaInstagram size={22} color="#E1306C" />
                     <span style={{ fontSize: 11, fontWeight: 600, color: "#E1306C", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("contact.instagram")}</span>
                     <span style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY }}>vidiverify</span>
                     <span style={{ fontSize: 11, color: TEXT_MUTED }}>{t("contact.instagramSub")}</span>
                     <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#E1306C", marginTop: 4 }}>
                        {t("contact.instagramAction")} <ArrowUpRight size={12} />
                     </span>
                  </motion.a>
               </div>
            </motion.div>

            {/* ── Support divider ── */}
            <motion.div variants={staggerItemSlow} style={{ paddingTop: 4 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: GLASS_BORDER }} />
                  <span style={{ fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{t("contact.supportDivider")}</span>
                  <div style={{ flex: 1, height: 1, background: GLASS_BORDER }} />
               </div>
            </motion.div>

            {/* ── Support card (2/3) + Email tile (1/3) ── */}
            <motion.div
               variants={staggerContainerSlow}
               style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap: 14 }}
            >
               {/* Support card — ServiceCard style */}
               <GlassCard
                  style={{ padding: 0, overflow: "hidden" }}
                  variants={staggerItemSlow}
                  whileHover={{ y: -6, boxShadow: `0 12px 40px rgba(106,172,204,0.12)`, transition: { duration: 0.3 } }}
               >
                  <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row" }}>
                     {/* Left: network animation */}
                     <div style={{
                        width: isMobile ? "100%" : 150, minHeight: isMobile ? 100 : "auto",
                        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${SUPPORT_GREEN}06`,
                        borderRight: isMobile ? "none" : `1px solid ${SUPPORT_GREEN}18`,
                        borderBottom: isMobile ? `1px solid ${SUPPORT_GREEN}18` : "none",
                        position: "relative", overflow: "hidden",
                     }}>
                        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, ${SUPPORT_GREEN}18, transparent 70%)`, pointerEvents: "none" }} />
                        <div style={{ transform: "scale(1.7)", transformOrigin: "center center" }}>
                           <NeuralNetAnim color={SUPPORT_GREEN} />
                        </div>
                     </div>
                     {/* Right: content */}
                     <div style={{ flex: 1, padding: supportContentPadding }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                           <PackageSearch style={{ width: 15, height: 15, color: CYAN, flexShrink: 0 }} />
                           {t("contact.supportHeading")}
                        </h3>
                        <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                           {(t("contact.supportItems", { returnObjects: true }) as string[]).map((item, i) => (
                              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, color: TEXT_SECONDARY, fontSize: 12, lineHeight: 1.5 }}>
                                 <span style={{ width: 4, height: 4, borderRadius: "50%", marginTop: 6, flexShrink: 0, backgroundColor: CYAN }} />
                                 {item}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </GlassCard>

               {/* Email tile */}
               <motion.a
                  href={`mailto:${email}`}
                  className="glass-card" variants={staggerItemSlow}
                  whileHover={{ y: -4, borderColor: `rgba(106,172,204,0.3)` }}
                  style={{ ...tileStyle, justifyContent: "center" }}
               >
                  <Mail size={22} color={CYAN} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: CYAN, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("contact.emailLabel")}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, wordBreak: "break-all" }}>{email}</span>
                  <span style={{ fontSize: 11, color: TEXT_MUTED }}>{t("contact.emailSub")}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: CYAN, marginTop: 4 }}>
                     {t("contact.emailAction")} <ArrowUpRight size={12} />
                  </span>
               </motion.a>
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Contact;
