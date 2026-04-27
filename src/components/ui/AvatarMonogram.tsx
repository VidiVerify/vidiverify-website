import { motion } from "motion/react";
import logo from "@/assets/logo.png";

const AvatarMonogram = () => {
   return (
      <div
         style={{
            position: "absolute",
            inset: 34,
            borderRadius: "50%",
            background:
               "radial-gradient(circle at 30% 30%, rgba(18,18,42,0.9), rgba(10,10,20,0.85))",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
         }}
      >
         <motion.img
            src={logo}
            alt="VidiVerify"
            style={{ width: 90, height: 90, x: 3, y: 3 }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
               opacity: 1,
               scale: 1,
               filter: [
                  "drop-shadow(0 0 7px rgba(106,172,204,0.36))",
                  "drop-shadow(0 0 22px rgba(106,172,204,0.78))",
                  "drop-shadow(0 0 7px rgba(106,172,204,0.36))",
               ],
            }}
            transition={{
               opacity: { duration: 0.6, delay: 0.3 },
               scale: { duration: 0.6, delay: 0.3 },
               filter: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 },
            }}
         />
      </div>
   );
};

export default AvatarMonogram;
