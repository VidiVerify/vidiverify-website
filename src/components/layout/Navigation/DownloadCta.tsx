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
   /** Im Handy-Menü: grösser, aber nur so breit wie sein Inhalt. Über die
    *  volle Breite wirkte er wie ein Balken (Anwenderwunsch 03.10.2026). */
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
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5,
            // So gross wie die inneren Knöpfe der Sprachwahl (DE/EN), nicht
            // wie deren äussere Pille: dieselben Werte wie in
            // LanguageToggle.tsx, keine feste Höhe.
            padding: block ? "10px 22px" : "4px 10px",
            borderRadius: 999,
            border: "none",
            // PRO-Gold wie der Knopf der Tester-Promo (TesterPromo.tsx)
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
            boxShadow: "0 2px 10px rgba(245,197,66,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
            color: "#1a1a1a",
            fontSize: block ? 14 : 11, fontWeight: 700, letterSpacing: "0.04em",
            cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap",
         }}
      >
         <Download size={block ? 16 : 12} strokeWidth={2.6} />
         {t("nav.download")}
      </motion.button>
   );
};

export default DownloadCta;
