import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { FaWindows, FaCopy, FaCheck, FaQrcode } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { QRCodeSVG } from "qrcode.react";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED, MONO_FONT, GLASS_BORDER } from "@/constants/theme";

interface MobileNoticeModalProps {
   open: boolean;
   onClose: () => void;
   shareUrl: string;
}

const MobileNoticeModal = ({ open, onClose, shareUrl }: MobileNoticeModalProps) => {
   const [copied, setCopied] = useState(false);
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

   useEffect(() => {
      if (!copied) return;
      const t = globalThis.setTimeout(() => setCopied(false), 2200);
      return () => globalThis.clearTimeout(t);
   }, [copied]);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(shareUrl);
         setCopied(true);
      } catch {
         const ta = document.createElement("textarea");
         ta.value = shareUrl;
         ta.style.position = "fixed";
         ta.style.opacity = "0";
         document.body.appendChild(ta);
         ta.select();
         try { document.execCommand("copy"); setCopied(true); } catch { /* noop */ }
         document.body.removeChild(ta);
      }
   };

   return createPortal(
      <AnimatePresence>
         {open && (
            <motion.div
               key="mobile-notice-backdrop"
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
                  aria-labelledby="mobile-notice-title"
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                     position: "relative",
                     width: "100%", maxWidth: 420,
                     maxHeight: "calc(100vh - 40px)", overflowY: "auto",
                     borderRadius: 16,
                     background: "rgba(15, 15, 35, 0.92)",
                     backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                     border: `1px solid ${GLASS_BORDER}`,
                     boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(106,172,204,0.08)",
                     padding: 24,
                  }}
               >
                  {/* Close button */}
                  <button
                     ref={closeRef}
                     onClick={onClose}
                     aria-label="Schliessen"
                     style={{
                        position: "absolute", top: 12, right: 12,
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, paddingRight: 36 }}>
                     <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: "rgba(106,172,204,0.1)",
                        border: "1px solid rgba(106,172,204,0.22)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <FaWindows size={18} color={CYAN} />
                     </div>
                     <h3
                        id="mobile-notice-title"
                        style={{ fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY, margin: 0, lineHeight: 1.3 }}
                     >
                        VidiVerify läuft auf Windows
                     </h3>
                  </div>

                  {/* Body */}
                  <p style={{ fontSize: 13.5, color: TEXT_SECONDARY, lineHeight: 1.7, margin: "0 0 18px" }}>
                     Du bist gerade mobil unterwegs — der Installer benötigt einen Windows-PC. So bekommst du den Download auf dein Gerät:
                  </p>

                  {/* Copy action */}
                  <div style={{
                     padding: 14, borderRadius: 12,
                     background: "rgba(106,172,204,0.05)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     marginBottom: 12,
                  }}>
                     <div style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>
                        Download-Link
                     </div>
                     <div style={{
                        fontSize: 12, color: CYAN, fontFamily: MONO_FONT,
                        wordBreak: "break-all", marginBottom: 10, lineHeight: 1.5,
                     }}>
                        {shareUrl}
                     </div>
                     <button
                        onClick={handleCopy}
                        style={{
                           width: "100%", padding: "10px 14px", borderRadius: 10,
                           border: "none", cursor: "pointer",
                           background: copied
                              ? "rgba(34,197,94,0.15)"
                              : `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                           color: copied ? "#22c55e" : "#fff",
                           fontSize: 13, fontWeight: 600,
                           display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                           transition: "background 0.2s, color 0.2s",
                        }}
                     >
                        {copied ? <FaCheck size={12} /> : <FaCopy size={12} />}
                        {copied ? "Link kopiert" : "Download-Link kopieren"}
                     </button>
                     <p style={{ fontSize: 11, color: TEXT_MUTED, lineHeight: 1.5, margin: "8px 0 0" }}>
                        Sende den Link an deinen PC, z. B. per Messenger oder E-Mail.
                     </p>
                  </div>

                  {/* QR action */}
                  <div style={{
                     padding: 14, borderRadius: 12,
                     background: "rgba(106,172,204,0.05)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     marginBottom: 14,
                     display: "flex", alignItems: "center", gap: 14,
                  }}>
                     <div style={{
                        background: "#fff", padding: 8, borderRadius: 8, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                     }}>
                        <QRCodeSVG value={shareUrl} size={88} level="M" marginSize={0} />
                     </div>
                     <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>
                           <FaQrcode size={10} /> QR-Code
                        </div>
                        <p style={{ fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.5, margin: 0 }}>
                           Mit einem anderen Gerät scannen, um diesen Link dort zu öffnen.
                        </p>
                     </div>
                  </div>

                  {/* Footer */}
                  <p style={{ fontSize: 11.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0, paddingTop: 12, borderTop: `1px solid ${GLASS_BORDER}` }}>
                     VidiVerify ist eine native Windows-Anwendung. Unsere Roadmap enthält bereits macOS als weitere Zielplattform.
                  </p>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>,
      document.body,
   );
};

export default MobileNoticeModal;
