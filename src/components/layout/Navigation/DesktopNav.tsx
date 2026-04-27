import { motion } from "motion/react";
import { CYAN, TEXT_PRIMARY } from "@/constants/theme";

interface NavSection {
   id: string;
   label: string;
}

interface DesktopNavProps {
   sections: NavSection[];
   activeSection: string;
   sectionProgress: number;
   onNavigate: (id: string) => void;
}

const dotVariants = {
   idle:    { scale: 0, opacity: 0 },
   active:  { scale: 1, opacity: 1 },
   hovered: { scale: 1, opacity: 0.6 },
};

const DesktopNav = ({
   sections,
   activeSection,
   sectionProgress,
   onNavigate,
}: DesktopNavProps) => {
   return (
      <div style={{ alignItems: "center", gap: 4, display: "flex" }}>
         {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
               <motion.button
                  key={section.id}
                  onClick={() => onNavigate(section.id)}
                  whileHover="hovered"
                  animate={isActive ? "active" : "idle"}
                  style={{
                     padding: "6px 12px",
                     fontSize: 13,
                     fontWeight: 500,
                     borderRadius: 8,
                     cursor: "pointer",
                     border: "none",
                     transition: "color 0.2s ease, background-color 0.2s ease",
                     color: isActive ? CYAN : "rgba(165, 165, 192, 0.9)",
                     backgroundColor: isActive
                        ? "rgba(6, 182, 212, 0.1)"
                        : "transparent",
                     backdropFilter: isActive ? "blur(8px)" : "none",
                     display: "flex",
                     alignItems: "center",
                     gap: 6,
                     position: "relative",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color = TEXT_PRIMARY;
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                     }
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                     if (!isActive) {
                        e.currentTarget.style.color = "rgba(165, 165, 192, 0.9)";
                        e.currentTarget.style.backgroundColor = "transparent";
                     }
                  }}
                  aria-label={`Navigate to ${section.label}`}
               >
                  <motion.span
                     variants={dotVariants}
                     transition={{ type: "spring", stiffness: 400, damping: 25 }}
                     style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: CYAN,
                        boxShadow: `0 0 ${6 + sectionProgress * 8}px rgba(6, 182, 212, ${0.3 + sectionProgress * 0.5})`,
                        flexShrink: 0,
                        display: "inline-block",
                     }}
                  />
                  {section.label}
               </motion.button>
            );
         })}
      </div>
   );
};

export default DesktopNav;
