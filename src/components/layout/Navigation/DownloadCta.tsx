/* Download als Knopf im Menü statt als Punkt unter vielen: Er ist das Ziel
 * der Seite und muss auch von weit unten sofort erreichbar sein, und
 * Wiederkehrer (Update, Downloadportale) suchen ihn dort (Entscheidung
 * 25.09.2026). */
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

const GOLD = "#f5c542";
const GOLD_DARK = "#d97706";

interface Props {
   onNavigate: (id: string) => void;
   /** Im Handy-Menü über die volle Breite. */
   block?: boolean;
}

const DownloadCta = ({ onNavigate, block }: Props) => {
   const { t } = useTranslation();
   return (
      <motion.button
         type="button"
         onClick={() => onNavigate("download")}
         whileHover={{ scale: 1.04, y: -1 }}
         whileTap={{ scale: 0.97 }}
         style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            width: block ? "100%" : undefined,
            // Höhe und Form der Sprachwahl daneben: Pille, 32 px, 11er-Schrift
            height: block ? 44 : 32,
            padding: block ? "0 16px" : "0 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,221,128,0.55)",
            // PRO-Gold wie der Knopf der Tester-Promo (TesterPromo.tsx)
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
            boxShadow: "0 2px 12px rgba(245,197,66,0.28), inset 0 1px 0 rgba(255,255,255,0.4)",
            color: "#1a1a1a",
            fontSize: block ? 14 : 11.5, fontWeight: 700, letterSpacing: "0.02em",
            cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap",
         }}
      >
         <Download size={block ? 16 : 13} strokeWidth={2.6} />
         {t("nav.download")}
      </motion.button>
   );
};

export default DownloadCta;
