/* Die FAQ als erste Karte im Kontaktbereich: Wer Kontakt sucht, hat meist
 * eine Frage, und oft steht die Antwort schon da (Wunsch des Anwenders
 * 24.11.2026).
 *
 * Die Links sind gewöhnliche Anker (`#faq`, `#faq-<slug>`); geöffnet wird das
 * Fenster vom Klick-Abfänger in `App.tsx`. Zahl und Wortlaut der Fragen kommen
 * aus denselben Daten wie das Fenster, damit die Karte nie etwas anderes
 * zeigt als die FAQ selbst. */

import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { HelpCircle, Search, ChevronRight } from "lucide-react";
import { TEXT_PRIMARY, TEXT_SECONDARY } from "@/constants/theme";
import { staggerItemSlow } from "@utils/animations";
import faqDe from "../../../data/faq.json";
import faqEn from "../../../data/faq.en.json";

const GELB = "#f5c542";
const gelb = (a: number) => `rgba(245,197,66,${a})`;
const cyan = (a: number) => `rgba(106,172,204,${a})`;

/** Die vier Fragen, die vor einer Kontaktaufnahme am häufigsten anstehen. */
const OFT_GEFRAGT = ["reparieren", "kein-upload", "preise", "ganze-ordner"];

interface FaqDaten {
   searchPlaceholder: string;
   sections: { items: { slug: string; q: string }[] }[];
}

interface Props {
   isMobile: boolean;
}

const FaqKarte = ({ isMobile }: Props) => {
   const { t, i18n } = useTranslation();
   const daten = ((i18n.language || "de").toLowerCase().startsWith("de") ? faqDe : faqEn) as FaqDaten;
   const alle = daten.sections.flatMap((s) => s.items);
   const fragen = OFT_GEFRAGT
      .map((slug) => alle.find((f) => f.slug === slug))
      .filter((f): f is { slug: string; q: string } => !!f);

   return (
      <motion.div
         variants={staggerItemSlow}
         className="glass-card"
         style={{
            padding: isMobile ? "18px 16px" : "22px 26px",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 1fr",
            gap: isMobile ? 18 : 28,
            alignItems: "center",
            background: `linear-gradient(135deg, ${gelb(0.13)}, ${cyan(0.07)} 55%, rgba(255,255,255,0.02))`,
            border: `1px solid ${gelb(0.32)}`,
            boxShadow: `0 14px 44px ${gelb(0.08)}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            borderRadius: 18,
         }}
      >
         {/* Links: Einladung und Suche */}
         <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
               <span style={{
                  width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                  background: gelb(0.15), border: `1px solid ${gelb(0.42)}`,
                  boxShadow: `0 0 20px ${gelb(0.2)}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
               }}>
                  <HelpCircle size={19} color={GELB} />
               </span>
               <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 10.5, color: GELB, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>
                     {t("contact.faqLabel")}
                  </p>
                  <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: TEXT_PRIMARY, margin: "2px 0 0", lineHeight: 1.3 }}>
                     {t("contact.faqHeading")}
                  </h3>
               </div>
            </div>
            <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.65, margin: 0 }}>
               {t("contact.faqText", { n: alle.length })}
            </p>
            <motion.a
               href="#faq"
               whileHover={{ y: -2 }}
               style={{
                  display: "flex", alignItems: "center", gap: 10,
                  height: 44, padding: "0 6px 0 14px", borderRadius: 12,
                  background: "rgba(10,12,28,0.55)",
                  border: `1px solid ${gelb(0.4)}`,
                  textDecoration: "none", cursor: "pointer",
               }}
            >
               <Search size={16} color={GELB} style={{ flexShrink: 0 }} />
               <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "#8c8cab", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {daten.searchPlaceholder}
               </span>
               <span style={{
                  flexShrink: 0, padding: "7px 14px", borderRadius: 9,
                  background: `linear-gradient(135deg, ${GELB}, #e0a526)`,
                  fontSize: 12, fontWeight: 800, color: "#1a1a2e", whiteSpace: "nowrap",
               }}>
                  {t("contact.faqAction")}
               </span>
            </motion.a>
         </div>

         {/* Rechts: die häufigsten Fragen als Direktlinks */}
         <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
            <p style={{ fontSize: 10.5, color: TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 2px" }}>
               {t("contact.faqPopular")}
            </p>
            {fragen.map((f) => (
               <motion.a
                  key={f.slug}
                  href={`#faq-${f.slug}`}
                  whileHover={{ x: 3, borderColor: gelb(0.45) }}
                  style={{
                     display: "flex", alignItems: "center", gap: 10,
                     padding: "10px 12px", borderRadius: 11,
                     background: "rgba(255,255,255,0.04)",
                     border: `1px solid ${cyan(0.16)}`,
                     textDecoration: "none", cursor: "pointer",
                  }}
               >
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: TEXT_PRIMARY, lineHeight: 1.4 }}>
                     {f.q}
                  </span>
                  <ChevronRight size={15} color={GELB} style={{ flexShrink: 0 }} />
               </motion.a>
            ))}
         </div>
      </motion.div>
   );
};

export default FaqKarte;
