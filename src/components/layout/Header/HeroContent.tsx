import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { getName } from "@data/dataLoader";
import { staggerContainer, staggerItem } from "@utils/animations";
import HeroStats from "./HeroStats";
import HeroSocial from "./HeroSocial";
import logo from "@/assets/logo.png";
const HeroContent = () => {
   const { t } = useTranslation();
   const [roleIndex, setRoleIndex] = useState(0);

   const name = useMemo(() => getName(), []);
   const roles = t("hero.roles", { returnObjects: true }) as string[];

   useEffect(() => {
      const interval = setInterval(() => {
         setRoleIndex((prev) => (prev + 1) % roles.length);
      }, 3000);
      return () => clearInterval(interval);
   }, [roles]);

   const scrollToProjects = useCallback(() => {
      const el = document.querySelector("#highlights");
      if (el) el.scrollIntoView({ behavior: "smooth" });
   }, []);

   const scrollToDownload = useCallback(() => {
      const el = document.querySelector("#download");
      if (el) el.scrollIntoView({ behavior: "smooth" });
   }, []);

   return (
      <motion.div
         className="relative z-10 flex flex-col items-center text-center px-6 py-32 max-w-4xl mx-auto"
         style={{ gap: 0 }}
         variants={staggerContainer}
         initial="hidden"
         animate="visible"
      >
         {/* Logo */}
         <motion.div variants={staggerItem} style={{ marginBottom: 28 }}>
            <img src={logo} alt="VidiVerify" style={{ height: 140, width: "auto" }} />
         </motion.div>

         {/* Heading */}
         <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] tracking-tight"
            variants={staggerItem}
         >
            <span className="gradient-text-vivid">{name}</span>
         </motion.h1>

         {/* Animated role cycling — tight below heading */}
         <motion.div
            className="h-9 md:h-11 flex items-center justify-center"
            variants={staggerItem}
            style={{ marginTop: 6, marginBottom: 28 }}
         >
            <AnimatePresence mode="wait">
               <motion.p
                  key={roleIndex}
                  className="text-base md:text-xl text-text-primary font-bold"
                  initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
               >
                  {roles[roleIndex]}
               </motion.p>
            </AnimatePresence>
         </motion.div>

         {/* Stats row */}
         <div style={{ marginBottom: 20 }}><HeroStats /></div>

         {/* CTA buttons */}
         <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            variants={staggerItem}
         >
            <motion.button
               onClick={scrollToProjects}
               className="btn-primary text-sm font-semibold"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               {t("hero.ctaHighlights")}
            </motion.button>
            <motion.button
               onClick={scrollToDownload}
               className="btn-outline text-sm"
               whileHover={{ scale: 1.04 }}
               whileTap={{ scale: 0.97 }}
            >
               {t("hero.ctaDownload")}
            </motion.button>
         </motion.div>

         {/* Status widget + Social icons */}
         <HeroSocial />
      </motion.div>
   );
};

export default HeroContent;
