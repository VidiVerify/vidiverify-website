import { useMemo } from "react";
import { motion } from "motion/react";
import { getName } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import { MONO_FONT } from "@/constants/theme";
import FooterSocial from "./FooterSocial";
import logo from "@assets/logo.png";

const LEGAL_LINKS = [
   { label: "Datenschutzerklärung", href: "#datenschutz" },
   { label: "Lizenzvereinbarung (EULA)", href: "#eula" },
   { label: "Impressum", href: "#impressum" },
];

const FooterContent = () => {
   const name = useMemo(() => getName(), []);

   return (
      <>
         {/* Logo */}
         <motion.div variants={staggerItem}>
            <img src={logo} alt="VidiVerify" style={{ height: 36, width: "auto", opacity: 0.9 }} />
         </motion.div>

         {/* Social links */}
         <FooterSocial />

         {/* Legal links */}
         <motion.div
            style={{
               display: "flex",
               alignItems: "center",
               gap: 6,
               flexWrap: "wrap",
               justifyContent: "center",
            }}
            variants={staggerItem}
         >
            {LEGAL_LINKS.map((link, i) => (
               <span key={link.href} style={{ display: "contents" }}>
                  <a
                     href={link.href}
                     style={{
                        fontSize: 11,
                        color: "#4a4a6a",
                        fontFamily: MONO_FONT,
                        textDecoration: "none",
                        transition: "color 0.2s",
                     }}
                     onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#6e6e90"; }}
                     onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#4a4a6a"; }}
                  >
                     {link.label}
                  </a>
                  {i < LEGAL_LINKS.length - 1 && (
                     <span style={{ fontSize: 11, color: "#2a2a40", fontFamily: MONO_FONT }}>·</span>
                  )}
               </span>
            ))}
         </motion.div>

         {/* Copyright */}
         <motion.p
            style={{ color: "#6e6e90", fontSize: 14, textAlign: "center" }}
            variants={staggerItem}
         >
            &copy; {new Date().getFullYear()} {name}
         </motion.p>
      </>
   );
};

export default FooterContent;
