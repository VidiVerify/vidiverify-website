import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaGithub, FaFacebook, FaInstagram } from "react-icons/fa";
import { SiX, SiTiktok } from "react-icons/si";
import { Mail, ArrowUpRight, PackageSearch } from "lucide-react";
import { getGitHubUsername } from "@data/dataLoader";
import PageSection from "@components/layout/PageSection";
import GlassCard from "@components/ui/GlassCard";
import NeuralNetAnim from "@pages/services/animations/NeuralNetAnim";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, GLASS_BORDER } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";
import FaqKarte from "./FaqKarte";
import contactData from "../../../data/contact.json";

const SUPPORT_GREEN = "#22c55e";


const Contact = () => {
   const { t } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 768px)");
   const isShortDesktop = useMediaQuery("(max-height: 820px) and (min-width: 1024px)");
   const githubUsername = getGitHubUsername();
   const SOCIAL = [
      { href: `https://github.com/${githubUsername}`, Icon: FaGithub, farbe: "#a5a5c0", name: t("contact.github"), handle: githubUsername },
      { href: "https://www.facebook.com/VidiVerify", Icon: FaFacebook, farbe: "#1877f2", name: t("contact.facebook"), handle: "VidiVerify" },
      { href: "https://instagram.com/vidiverify", Icon: FaInstagram, farbe: "#E1306C", name: t("contact.instagram"), handle: "vidiverify" },
      { href: "https://x.com/VidiVerif", Icon: SiX, farbe: "#e7e7ea", name: t("contact.x"), handle: "VidiVerif" },
      { href: "https://www.tiktok.com/@vidiverify", Icon: SiTiktok, farbe: "#25F4EE", name: t("contact.tiktok"), handle: "vidiverify" },
   ];
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
            {/* ── FAQ zuerst: Wer Kontakt sucht, hat meist eine Frage ── */}
            <FaqKarte isMobile={isMobile} />

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
               {/* Support card - ServiceCard style */}
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
            {/* ── Folgen: gedämpft auf eine Zeile ── */}
            <motion.div variants={staggerItemSlow} style={{ paddingTop: 2 }}>
               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: GLASS_BORDER }} />
                  <span style={{ fontSize: 11, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>{t("contact.followDivider")}</span>
                  <div style={{ flex: 1, height: 1, background: GLASS_BORDER }} />
               </div>
            </motion.div>
            <motion.div variants={staggerContainerSlow} style={{
               display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)", gap: 10,
            }}>
               {SOCIAL.map(({ href, Icon, farbe, name, handle }) => (
                  <motion.a
                     key={name}
                     href={href}
                     target="_blank" rel="noopener noreferrer"
                     className="glass-card" variants={staggerItemSlow}
                     whileHover={{ y: -3, borderColor: `${farbe}55` }}
                     aria-label={`${name}: ${handle}`}
                     style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", textDecoration: "none", cursor: "pointer",
                     }}
                  >
                     <Icon size={17} color={farbe} style={{ flexShrink: 0 }} />
                     <span style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: farbe, textTransform: "uppercase", letterSpacing: "0.05em" }}>{name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: TEXT_SECONDARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{handle}</span>
                     </span>
                  </motion.a>
               ))}
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Contact;
