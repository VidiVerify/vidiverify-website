import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { FaExclamationCircle, FaShieldAlt, FaWindows, FaLock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, GLASS_BORDER } from "@/constants/theme";

const ACCENT = "#f5c542";

interface SmartScreenModalProps {
   open: boolean;
   onClose: () => void;
}

const SmartScreenModal = ({ open, onClose }: SmartScreenModalProps) => {
   const { t } = useTranslation();
   const closeRef = useRef<HTMLButtonElement>(null);

   useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
         if (e.key === "Escape") onClose();
      };
      globalThis.addEventListener("keydown", onKey);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeRef.current?.focus();
      return () => {
         globalThis.removeEventListener("keydown", onKey);
         document.body.style.overflow = prevOverflow;
      };
   }, [open, onClose]);

   const items = [
      {
         icon: <FaShieldAlt size={14} color={ACCENT} />,
         label: t("download.smartscreenItemSignedLabel"),
         body: t("download.smartscreenSigned"),
      },
      {
         icon: <FaLock size={13} color={ACCENT} />,
         label: t("download.smartscreenItemReputationLabel"),
         body: t("download.smartscreenReputation"),
      },
   ];

   return createPortal(
      <AnimatePresence>
         {open && (
            <motion.div
               key="smartscreen-modal-backdrop"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.2 }}
               onClick={onClose}
               style={{
                  position: "fixed", inset: 0, zIndex: 400,
                  background: "rgba(8, 8, 16, 0.72)",
                  backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 20,
               }}
            >
               <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="smartscreen-modal-title"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                     position: "relative",
                     width: "100%", maxWidth: 520,
                     maxHeight: "calc(100vh - 40px)", overflowY: "auto",
                     borderRadius: 16,
                     background: "rgba(15, 15, 35, 0.94)",
                     backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                     border: `1px solid ${GLASS_BORDER}`,
                     boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(245,197,66,0.10)`,
                  }}
               >
                  {/* Accent band (top) */}
                  <div
                     aria-hidden
                     style={{
                        height: 3,
                        background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                        borderRadius: "16px 16px 0 0",
                     }}
                  />

                  <div style={{ padding: 26 }}>
                     {/* Close button */}
                     <button
                        ref={closeRef}
                        onClick={onClose}
                        aria-label={t("download.smartscreenModalClose")}
                        style={{
                           position: "absolute", top: 14, right: 14,
                           width: 32, height: 32, borderRadius: 8,
                           border: `1px solid ${GLASS_BORDER}`,
                           background: "rgba(255,255,255,0.04)",
                           color: TEXT_MUTED, cursor: "pointer",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                     >
                        <IoClose size={18} />
                     </button>

                     {/* Header */}
                     <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6, paddingRight: 40 }}>
                        <div style={{
                           width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                           background: "rgba(245,197,66,0.12)",
                           border: "1px solid rgba(245,197,66,0.32)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           <FaExclamationCircle size={20} color={ACCENT} />
                        </div>
                        <div>
                           <span style={{
                              display: "block",
                              fontSize: 10, fontWeight: 700, color: ACCENT,
                              textTransform: "uppercase", letterSpacing: "0.12em",
                              marginBottom: 2,
                           }}>
                              {t("download.smartscreenModalKicker")}
                           </span>
                           <h3
                              id="smartscreen-modal-title"
                              style={{ fontSize: 18, fontWeight: 700, color: TEXT_PRIMARY, margin: 0, lineHeight: 1.3 }}
                           >
                              {t("download.smartscreenModalTitle")}
                           </h3>
                        </div>
                     </div>

                     {/* Intro */}
                     <p style={{ fontSize: 13.5, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "16px 0 18px" }}>
                        {t("download.smartscreenModalIntro")}
                     </p>

                     {/* Items */}
                     <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {items.map((it, idx) => (
                           <div key={idx} style={{
                              padding: 14,
                              borderRadius: 12,
                              background: "rgba(245,197,66,0.04)",
                              border: "1px solid rgba(245,197,66,0.18)",
                           }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                 <div style={{
                                    width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                                    background: "rgba(245,197,66,0.12)",
                                    border: "1px solid rgba(245,197,66,0.25)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                 }}>
                                    {it.icon}
                                 </div>
                                 <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    {it.label}
                                 </span>
                              </div>
                              <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0 }}>
                                 {it.body}
                              </p>
                           </div>
                        ))}
                     </div>

                     {/* Store CTA */}
                     <div style={{
                        marginTop: 16,
                        padding: 14,
                        borderRadius: 12,
                        background: "rgba(106,172,204,0.06)",
                        border: "1px solid rgba(106,172,204,0.22)",
                     }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                           <div style={{
                              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                              background: "rgba(106,172,204,0.12)",
                              border: "1px solid rgba(106,172,204,0.25)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                           }}>
                              <FaWindows size={13} color={CYAN} />
                           </div>
                           <span style={{ fontSize: 11, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {t("download.smartscreenItemStoreLabel")}
                           </span>
                        </div>
                        <p style={{ fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "0 0 10px" }}>
                           {t("download.smartscreenModalStoreBody")}
                        </p>
                        <motion.a
                           href="https://apps.microsoft.com/store/detail/XPDLZGLQP4LKZW"
                           target="_blank"
                           rel="noopener noreferrer"
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           style={{
                              display: "inline-flex", alignItems: "center", gap: 8,
                              padding: "8px 14px", borderRadius: 10,
                              background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                              color: "#fff", fontSize: 12, fontWeight: 600,
                              textDecoration: "none",
                              boxShadow: `0 4px 16px rgba(106,172,204,0.30)`,
                           }}
                        >
                           <FaWindows size={12} />
                           {t("download.smartscreenModalStoreCta")}
                        </motion.a>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default SmartScreenModal;
