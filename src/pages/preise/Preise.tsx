import { motion } from "motion/react";
import { FaCheckCircle, FaKey, FaRocket, FaHeart, FaScroll } from "react-icons/fa";
import PageSection from "@components/layout/PageSection";
import { staggerContainerSlow, staggerItemSlow } from "@utils/animations";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import useMediaQuery from "@utils/useMediaQuery";
import ProBadge from "@components/ui/ProBadge";

const FREE_GREEN = "#22c55e";

const LICENSE_POINTS: React.ReactNode[] = [
   "Offizielle Lizenzierung – Einmalige Nutzungsgebühr — keine Abonnements",
   "Alle Updates innerhalb der jeweiligen Releaseserie enthalten",
   "Zusätzliche und künftige Funktionen dieser Releaseserie eingeschlossen",
   <><span>Grundlage für spätere </span><ProBadge />-Freischaltung</>,
];

const Preise = () => {
   const isMobile = useMediaQuery("(max-width: 768px)");

   const scrollTo = (id: string) => {
      document.querySelector(`#${id}`)?.scrollIntoView({ behavior: "smooth" });
   };

   return (
      <PageSection id="preise" title="Preise" subtitle="Offen, fair und transparent">
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
                           Privatanwender
                        </p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: FREE_GREEN, margin: 0 }}>Kostenfrei</h3>
                     </div>
                     <span style={{
                        marginLeft: "auto", padding: "3px 10px", borderRadius: 999,
                        background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                        fontSize: 11, fontWeight: 700, color: FREE_GREEN,
                     }}>
                        0 €
                     </span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     VidiVerify steht für die ausschliesslich private Nutzung kostenfrei zur Verfügung. Der Zugang ist bewusst offen gestaltet — ohne Registrierungspflicht, ohne Lizenzgebühr.
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}>
                     {[
                        "Voller Funktionsumfang für die private Nutzung",
                        "Kein Account, keine Registrierung erforderlich",
                        "Lokale Verarbeitung – keine Cloud, keine Abhängigkeiten",
                     ].map((point) => (
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
                     <FaHeart size={12} color={FREE_GREEN} /> Unterstützen
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
                           Gewerblich & professionell
                        </p>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: CYAN, margin: 0 }}>Lizenz</h3>
                     </div>
                     <span style={{
                        marginLeft: "auto", padding: "3px 10px", borderRadius: 999,
                        background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                        fontSize: 11, fontWeight: 700, color: CYAN,
                     }}>
                        in Vorbereitung
                     </span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     Wer VidiVerify nicht ausschliesslich privat verwendet, benötigt eine offizielle Lizenz. Die Lizenzierung erfolgt mit einer einmaligen Nutzungsgebühr. Hierdurch werden zusätzlich automatisch alle in Vorbereitung befindlichen <ProBadge />-Features für die jeweilige Releaseserie freigeschaltet.
                  </p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0 }}>
                     {LICENSE_POINTS.map((point, i) => (
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
                           Perspektive
                        </p>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                           VidiVerify <ProBadge />
                        </h3>
                     </div>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: TEXT_SECONDARY, margin: 0 }}>
                     Die offizielle Lizenzierung ermöglicht die Nutzung von VidiVerify – als VidiVerify <ProBadge /> – auch im gewerblichen und professionellen Umfeld. Erweiterte Pro-Features und zusätzliche Funktionen sind dabei automatisch eingeschlossen. Lizenzen sichern Innovation und Stabilität der Software.
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
                     Lizenzvereinbarung (EULA)
                  </motion.a>
               </motion.div>
            </motion.div>
         </motion.div>
      </PageSection>
   );
};

export default Preise;
