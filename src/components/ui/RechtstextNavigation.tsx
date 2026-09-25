/**
 * Inhaltsverzeichnis und „Zum Inhalt" für die langen Rechtstexte
 * (Datenschutz, AGB, EULA).
 *
 * Ein Bauteil für alle drei, damit sie gleich aussehen und gleich springen.
 * Gesprungen wird im Scrollbereich des Fensters, nicht auf der Seite:
 * `scrollIntoView` bewegte auch die Seite dahinter.
 */
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp } from "lucide-react";
import { CYAN, TEXT_MUTED, TEXT_SECONDARY } from "@/constants/theme";
import { TOC_ID, abschnittId, springe } from "@utils/rechtstextSprung";

interface TocProps {
   box: RefObject<HTMLDivElement | null>;
   sections: { id: number; title: string }[];
   titel?: string;
}

export function Inhaltsverzeichnis({ box, sections, titel }: TocProps) {
   const { t } = useTranslation();
   return (
      <nav id={TOC_ID} style={{
         padding: "14px 16px", borderRadius: 12, marginBottom: 30,
         background: "rgba(106,172,204,0.03)",
         border: "1px solid rgba(106,172,204,0.1)",
      }}>
         <p style={{
            fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
            letterSpacing: "0.08em", fontWeight: 600, margin: "0 0 8px",
         }}>
            {titel ?? t("modal.toc")}
         </p>
         <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 100%), 1fr))",
            columnGap: 16, rowGap: 2,
         }}>
            {sections.map((section) => (
               <button
                  key={section.id}
                  type="button"
                  onClick={() => springe(box, abschnittId(section.id))}
                  style={{
                     display: "flex", gap: 8, alignItems: "baseline",
                     textAlign: "left", cursor: "pointer",
                     padding: "3px 0", background: "none", border: "none",
                     font: "inherit", fontSize: 11.5, lineHeight: 1.45,
                     color: TEXT_SECONDARY, transition: "color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = CYAN; }}
                  onMouseLeave={e => { e.currentTarget.style.color = TEXT_SECONDARY; }}
               >
                  <span style={{ fontSize: 10, fontWeight: 800, color: CYAN, minWidth: 16, textAlign: "right" }}>
                     {section.id}
                  </span>
                  <span>{section.title}</span>
               </button>
            ))}
         </div>
      </nav>
   );
}

/** Kleiner Rücksprung am Ende eines Abschnitts. */
export function ZumInhalt({ box }: { box: RefObject<HTMLDivElement | null> }) {
   const { t } = useTranslation();
   return (
      <button
         type="button"
         onClick={() => springe(box, TOC_ID)}
         style={{
            alignSelf: "flex-start",
            display: "inline-flex", alignItems: "center", gap: 4,
            marginTop: 2, padding: "2px 0",
            background: "none", border: "none", cursor: "pointer",
            font: "inherit", fontSize: 10.5, fontWeight: 600,
            color: TEXT_MUTED, opacity: 0.8, transition: "color 0.15s, opacity 0.15s",
         }}
         onMouseEnter={e => { e.currentTarget.style.color = CYAN; e.currentTarget.style.opacity = "1"; }}
         onMouseLeave={e => { e.currentTarget.style.color = TEXT_MUTED; e.currentTarget.style.opacity = "0.8"; }}
      >
         <ArrowUp size={11} strokeWidth={2.4} />
         {t("modal.backToToc")}
      </button>
   );
}
