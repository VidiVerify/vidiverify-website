import { useMemo } from "react";
import { motion } from "motion/react";
import { getSocialProfiles } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import ICON_MAP from "@utils/iconMap";

const HeroSocial = () => {
   const socialProfiles = useMemo(() => getSocialProfiles(), []);

   return (
      <>
         {/* Social icons */}
         <motion.div
            className="flex items-center gap-3"
            style={{ marginTop: 26 }}
            variants={staggerItem}
         >
            {socialProfiles.map((profile) => {
               const IconComponent = ICON_MAP[profile.icon];
               if (!IconComponent) return null;
               return (
                  <motion.a
                     key={profile.id}
                     href={profile.link}
                     target="_blank"
                     rel="noopener noreferrer"
                     style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        background: "rgba(255, 255, 255, 0.03)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#a5a5c0",
                        transition: "all 0.3s",
                     }}
                     whileHover={{
                        scale: 1.15,
                        y: -3,
                        color: "#06b6d4",
                        borderColor: "rgba(6, 182, 212, 0.3)",
                        background: "rgba(6, 182, 212, 0.08)",
                     }}
                     whileTap={{ scale: 0.9 }}
                     aria-label={`Visit ${profile.name} profile`}
                  >
                     <IconComponent size={18} />
                  </motion.a>
               );
            })}
         </motion.div>
      </>
   );
};

export default HeroSocial;
