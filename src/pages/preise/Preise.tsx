import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaKey, FaHeart } from "react-icons/fa";
import PageSection from "@components/layout/PageSection";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";
import { preisText, usePreise } from "@utils/usePreise";
import ProBadge from "@components/ui/ProBadge";

const FREE_GREEN = "#22c55e";

const Preise = () => {
   const { t, i18n } = useTranslation();
   // Eine Preisquelle fuer die ganze Anwendung: der Worker. Faellt der Abruf
   // aus, steht der eingebaute Listenpreis da - nie ein zu niedriger.
   const { preise } = usePreise();
   const sprache = i18n.language?.toLowerCase().startsWith("de") ? "de" : "en";
   const isMobile = useMediaQuery("(max-width: 768px)");
   const isShortDesktop = useMediaQuery("(max-height: 820px) and (min-width: 1024px)");

   const cardPadding = isMobile ? "24px 20px" : isShortDesktop ? "14px 32px" : "28px 32px";
   const cardGap = isShortDesktop ? 12 : 16;
   const listGap = isShortDesktop ? 6 : 8;
   const outerGap = isShortDesktop ? 12 : 14;

   // Das Herz hängt am letzten Wort, damit es nie allein in eine neue Zeile fällt.
   const communityBullet = t("pricing.communityBullet");
   const communityTrennung = communityBullet.lastIndexOf(" ");
   const communityAnfang = communityTrennung === -1 ? "" : communityBullet.slice(0, communityTrennung + 1);
   const communityEnde = communityTrennung === -1 ? communityBullet : communityBullet.slice(communityTrennung + 1);

   const privateBullets = t("pricing.privateBullets", { returnObjects: true }) as string[];
   const commercialBullets = t("pricing.commercialBullets", { returnObjects: true }) as string[];

   return (
      <PageSection id="preise" title={t("pricing.title")} subtitle={t("pricing.subtitle")}>
         <motion.div
            style={{ maxWidth: 1152, margin: "0 auto", display: "flex", flexDirection: "column", gap: outerGap }}
            variants={staggerContainerSlow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "0px 0px -80px 0px" }}
         >
            {/* ── A + B: Privat & Lizenz ── */}
            <motion.div
               variants={staggerContainerSlow}
               style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr", gap: outerGap }}
            >
               {/* A - Kostenfreie Nutzung */}
               <motion.div variants={staggerItemSlow} className="glass-card"
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(34,197,94,0.1)", transition: { duration: 0.3 } }}
                  style={{
                  padding: cardPadding,
                  display: "flex", flexDirection: "column", gap: cardGap,
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
                  <ul style={{ display: "flex", flexDirection: "column", gap: listGap, margin: 0, padding: 0 }}>
                     {privateBullets.map((point) => (
                        <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none" }}>
                           <span style={{ width: 5, height: 5, borderRadius: "50%", background: FREE_GREEN, flexShrink: 0, marginTop: 7 }} />
                           <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{point}</span>
                        </li>
                     ))}
                     <li style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none", marginTop: listGap + 14 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: FREE_GREEN, flexShrink: 0, marginTop: 7 }} />
                        <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>
                           {communityAnfang}
                           <span style={{ whiteSpace: "nowrap" }}>
                              {communityEnde}
                              <FaHeart size={10} color={FREE_GREEN} style={{ display: "inline-block", marginLeft: 6, verticalAlign: "baseline" }} />
                           </span>
                        </span>
                     </li>
                  </ul>
               </motion.div>

               {/* B - Lizenzierte Nutzung */}
               <motion.div variants={staggerItemSlow} className="glass-card"
                  whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(106,172,204,0.12)", transition: { duration: 0.3 } }}
                  style={{
                  padding: cardPadding,
                  display: "flex", flexDirection: "column", gap: cardGap,
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
                  <ul style={{ display: "flex", flexDirection: "column", gap: listGap, margin: 0, padding: 0 }}>
                     {commercialBullets.map((point) => (
                        <li key={point} style={{ display: "flex", alignItems: "flex-start", gap: 9, listStyle: "none" }}>
                           <span style={{ width: 5, height: 5, borderRadius: "50%", background: CYAN, flexShrink: 0, marginTop: 7 }} />
                           <span style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.6 }}>{point}</span>
                        </li>
                     ))}
                  </ul>

                  {/* ── Was es kostet ──
                      Bis zum 09.09.2026 stand hier keine einzige Zahl: Die
                      Sektion hiess „Preise" und nannte keine. Wer wissen wollte,
                      was PRO kostet, musste die Anwendung installieren und den
                      Bestellweg öffnen. */}
                  <div style={{
                     display: "grid", gap: 10,
                     gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  }}>
                     {([[t("pricing.priceProLabel"), preisText(preise.pro, sprache), CYAN],
                        [t("pricing.priceLifetimeLabel"), preisText(preise.lifetime, sprache), "#f59e0b"]] as const)
                        .map(([label, preis, farbe]) => (
                        <div key={label} style={{
                           padding: "12px 14px", borderRadius: 12,
                           border: `1px solid ${farbe}33`, background: `${farbe}0a`,
                           display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
                        }}>
                           <span style={{ fontSize: 11.5, color: TEXT_MUTED, letterSpacing: "0.02em" }}>
                              {label}
                           </span>
                           <span style={{ fontSize: 16, fontWeight: 800, color: farbe, whiteSpace: "nowrap" }}>
                              {preis}
                           </span>
                        </div>
                     ))}
                  </div>

                  {/* Im Preisplan als zwingend gesetzt - überall dort, wo Preise
                      genannt werden. Ohne sie kann ein Käufer den Wert von
                      LIFETIME gegenüber PRO nicht abschätzen und wählt im
                      Zweifel PRO. */}
                  <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0 }}>
                     {t("pricing.priceExplainer")}
                  </p>
                  <p style={{ fontSize: 11.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
                     {t("pricing.priceNote")}
                  </p>

                  {/* Der Bestellweg. Er öffnet das Anfragefenster über der
                      Seite - bewusst kein Sprung auf eine eigene Seite: Wer
                      bestellt, klickt zwischen Formular und Preisen hin und
                      her, und ein Wechsel der Umgebung wirkt dabei wie ein
                      Anbieterwechsel. */}
                  <a href="#lizenz-anfrage" style={{
                     alignSelf: "flex-start", marginTop: 2,
                     display: "inline-flex", alignItems: "center", gap: 8,
                     padding: "10px 20px", borderRadius: 10,
                     background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                     color: "#08111a", fontSize: 13.5, fontWeight: 700,
                     textDecoration: "none",
                  }}>
                     <FaKey size={12} /> {t("pricing.orderCta")}
                  </a>
               </motion.div>
            </motion.div>

         </motion.div>
      </PageSection>
   );
};

export default Preise;
