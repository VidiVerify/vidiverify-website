import { motion } from "motion/react";
import { Layers, Microscope, FlaskConical, FolderCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { staggerItem } from "@utils/animations";

/* Ein Icon je Highlight, in der Reihenfolge der Karten.
 *
 * Vorher standen hier Aktentasche, Doktorhut, Rakete und Pokal - Reste der
 * Lebenslauf-Vorlage, aus der die Seite einmal hervorging. Sie bebilderten
 * einen Werdegang, nicht ein Prüfwerkzeug. */
const HIGHLIGHT_ICONS: { Icon: LucideIcon; color: string }[] = [
   { Icon: Layers, color: "#06b6d4" },        // Prüftiefen
   { Icon: Microscope, color: "#a855f7" },    // Detailanalyse
   { Icon: FlaskConical, color: "#22c55e" },  // Media Lab
   { Icon: FolderCheck, color: "#f59e0b" },   // Stapel und Bestände
];

interface HighlightCardProps {
   text: string;
   index: number;
   isMobile: boolean;
}

const HighlightCard = ({ text, index, isMobile }: HighlightCardProps) => {
   const { Icon, color } = HIGHLIGHT_ICONS[index];
   // Das führende Emoji trennt nur die Karten in der Sprachdatei - angezeigt
   // wird das Icon links daneben.
   const ohneEmoji = text.replace(/^[^\s]+\s/, "");
   // Headline und Satz stehen als „Titel | Text" in einer Zeile der
   // Sprachdatei. Getrennt dargestellt, weil ein Highlight zuerst seine
   // Aussage zeigen soll und erst danach die Begründung; in einem Absatz
   // verschwimmt beides zu einer langen Zeile.
   //
   // Der senkrechte Strich trennt nur und wird nie angezeigt. Er hat den
   // langen Gedankenstrich abgelöst, weil der aus den sichtbaren Texten
   // verschwinden soll und als Trennzeichen dann mehrdeutig würde.
   const bruch = ohneEmoji.indexOf(" | ");
   const kopf = bruch > 0 ? ohneEmoji.slice(0, bruch) : "";
   const satz = bruch > 0 ? ohneEmoji.slice(bruch + 3) : ohneEmoji;

   return (
      <motion.div
         variants={staggerItem}
         style={{
            display: "flex",
            gap: isMobile ? 10 : 14,
            alignItems: "flex-start",
            padding: isMobile ? "12px 14px" : "14px 16px",
            borderRadius: 12,
            background: "rgba(255, 255, 255, 0.03)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
         }}
      >
         <div
            style={{
               width: 32,
               height: 32,
               borderRadius: 8,
               background: `${color}12`,
               border: `1px solid ${color}20`,
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               flexShrink: 0,
               marginTop: 1,
            }}
         >
            <Icon style={{ width: 16, height: 16, color }} />
         </div>
         <div>
            {kopf && (
               <p
                  style={{
                     color: "#f1f5f9",
                     fontSize: isMobile ? 13.5 : 14.5,
                     fontWeight: 700,
                     lineHeight: 1.4,
                     margin: "0 0 3px",
                  }}
               >
                  {kopf}
               </p>
            )}
            <p
               style={{
                  color: "#cbd5e1",
                  fontSize: isMobile ? 12.5 : 13.5,
                  lineHeight: 1.6,
                  margin: 0,
               }}
            >
               {satz}
            </p>
         </div>
      </motion.div>
   );
};

export default HighlightCard;
