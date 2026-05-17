import { useState } from "react";
import type { Variants } from "motion/react";
import type { Service } from "@/types";
import useMediaQuery from "@utils/useMediaQuery";
import GlassCard from "@components/ui/GlassCard";
import { iconMapById, fallbackIcon, ACCENT_COLORS } from "./servicesConstants";
import ServiceAnimation from "./ServiceAnimation";

interface ServiceCardProps {
   service: Service;
   index: number;
}

const bentoEntry: Variants = {
   hidden: { opacity: 0, y: 30, rotate: -1 },
   visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
   },
};

const ServiceCard = ({ service, index }: ServiceCardProps) => {
   const [isHovered, setIsHovered] = useState(false);
   const isMobile = useMediaQuery("(max-width: 768px)");
   const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];
   const IconComponent = iconMapById[service.id] || fallbackIcon;

   return (
      <GlassCard
         style={{ padding: 0, overflow: "hidden" }}
         variants={bentoEntry}
         whileHover={{
            y: -6,
            boxShadow: `0 12px 40px ${colors.borderHover}`,
            transition: { duration: 0.3 },
         }}
         onHoverStart={() => setIsHovered(true)}
         onHoverEnd={() => setIsHovered(false)}
      >
         <div
            style={{
               display: "flex",
               flexDirection: isMobile ? "column" : "row",
            }}
         >
            {/* Left: Animation */}
            <div
               style={{
                  width: isMobile ? "100%" : 128,
                  minHeight: isMobile ? 88 : "auto",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${colors.icon}06`,
                  borderRight: isMobile ? "none" : `1px solid ${colors.icon}12`,
                  borderBottom: isMobile
                     ? `1px solid ${colors.icon}12`
                     : "none",
                  position: "relative",
                  overflow: "hidden",
               }}
            >
               <div
                  style={{
                     position: "absolute",
                     inset: 0,
                     background: `radial-gradient(circle at 50% 50%, ${colors.iconBg}, transparent 70%)`,
                     opacity: isHovered ? 0.5 : 0.2,
                     transition: "opacity 0.3s ease",
                     pointerEvents: "none",
                  }}
               />
               <ServiceAnimation id={service.id} color={colors.icon} />
            </div>

            {/* Right: Content */}
            <div style={{ flex: 1, padding: "12px 18px" }}>
               <h3
                  style={{
                     fontSize: 14,
                     fontWeight: 700,
                     color: "#eeeef5",
                     marginBottom: 6,
                     display: "flex",
                     alignItems: "center",
                     gap: 6,
                  }}
               >
                  <IconComponent
                     style={{
                        width: 14,
                        height: 14,
                        color: colors.icon,
                        flexShrink: 0,
                     }}
                  />
                  {service.title}
               </h3>

               <ul
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     gap: 3,
                  }}
               >
                  {service.list.map((item) => (
                     <li
                        key={item}
                        style={{
                           display: "flex",
                           alignItems: "flex-start",
                           gap: 8,
                           color: "#a5a5c0",
                           fontSize: 12,
                           lineHeight: 1.45,
                        }}
                     >
                        <span
                           style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              marginTop: 6,
                              flexShrink: 0,
                              backgroundColor: colors.dot,
                           }}
                        />
                        {item}
                     </li>
                  ))}
               </ul>
            </div>
         </div>
      </GlassCard>
   );
};

export default ServiceCard;
