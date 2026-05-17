import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { X, Scale, Mail, Globe, ShieldCheck, User } from "lucide-react";
import { CYAN, TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";
import data from "../../../data/impressum.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const ImpressumModal = ({ open, onClose }: Props) => {
   const { t } = useTranslation();
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!open) return;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
         window.removeEventListener("keydown", onKey);
         document.body.style.overflow = "";
      };
   }, [open, onClose]);

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  key="imp-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={onClose}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1000,
                     background: "rgba(6,7,18,0.82)",
                     backdropFilter: "blur(14px)",
                     WebkitBackdropFilter: "blur(14px)",
                  }}
               />

               <motion.div
                  key="imp-modal"
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                     position: "fixed", inset: 0, zIndex: 1001,
                     display: "flex", alignItems: "center", justifyContent: "center",
                     padding: "24px 16px",
                     pointerEvents: "none",
                  }}
               >
                  <div style={{
                     width: "100%", maxWidth: 640,
                     maxHeight: "88vh",
                     display: "flex", flexDirection: "column",
                     background: "rgba(14,16,36,0.97)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     borderRadius: 20,
                     boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,172,204,0.06)",
                     pointerEvents: "auto",
                     overflow: "hidden",
                  }}>

                     {/* Header */}
                     <div style={{
                        padding: "22px 28px 20px",
                        borderBottom: "1px solid rgba(106,172,204,0.12)",
                        display: "flex", alignItems: "flex-start", gap: 14,
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.03)",
                     }}>
                        <div style={{
                           width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                           background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           <Scale size={18} color={CYAN} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <p style={{ fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, margin: 0, lineHeight: 1.4 }}>
                              Rechtliche Angaben
                           </p>
                           <h2 style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, margin: "4px 0 0" }}>
                              {data.title}
                           </h2>
                           <p style={{ fontSize: 11, color: TEXT_MUTED, margin: "4px 0 0" }}>{data.date}</p>
                        </div>
                        <button
                           onClick={onClose}
                           style={{
                              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: TEXT_MUTED, transition: "all 0.15s",
                           }}
                           onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLButtonElement).style.color = TEXT_PRIMARY; }}
                           onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = TEXT_MUTED; }}
                        >
                           <X size={15} />
                        </button>
                     </div>

                     {/* Scrollable content */}
                     <div
                        ref={scrollRef}
                        data-lenis-prevent
                        onWheel={e => e.stopPropagation()}
                        style={{
                           overflowY: "auto", flex: 1,
                           padding: "24px 28px 32px",
                           scrollbarWidth: "thin",
                           scrollbarColor: "rgba(106,172,204,0.2) transparent",
                        }}
                     >
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                           {/* Provider card */}
                           <div style={{
                              borderRadius: 14,
                              border: "1px solid rgba(106,172,204,0.15)",
                              background: "rgba(106,172,204,0.03)",
                              overflow: "hidden",
                           }}>
                              <div style={{
                                 padding: "9px 16px",
                                 borderBottom: "1px solid rgba(106,172,204,0.1)",
                                 background: "rgba(106,172,204,0.05)",
                              }}>
                                 <span style={{ fontSize: 10, fontWeight: 700, color: CYAN, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    {data.provider.legal_note}
                                 </span>
                              </div>
                              <div style={{ padding: "16px 18px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                                 <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_PRIMARY, margin: "0 0 8px" }}>
                                       {data.provider.name}
                                    </p>
                                    {data.provider.address.map((line, i) => (
                                       <p key={i} style={{ fontSize: 12.5, color: TEXT_SECONDARY, margin: 0, lineHeight: 1.7 }}>{line}</p>
                                    ))}
                                 </div>
                                 <div style={{
                                    width: 1, alignSelf: "stretch",
                                    background: "rgba(106,172,204,0.1)",
                                    flexShrink: 0,
                                 }} />
                                 <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>
                                       Vertreten durch
                                    </p>
                                    <p style={{ fontSize: 12.5, color: TEXT_SECONDARY, margin: 0 }}>
                                       {data.provider.represented_by}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           {/* Contact row */}
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              {/* Email */}
                              <div style={{
                                 borderRadius: 12, padding: "14px 16px",
                                 border: "1px solid rgba(106,172,204,0.12)",
                                 background: "rgba(106,172,204,0.03)",
                                 display: "flex", flexDirection: "column", gap: 8,
                              }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div style={{
                                       width: 26, height: 26, borderRadius: 8,
                                       background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.16)",
                                       display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                       <Mail size={12} color={CYAN} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                       Email
                                    </span>
                                 </div>
                                 <a
                                    href={`mailto:${data.contact.email}`}
                                    style={{ fontSize: 12, color: CYAN, textDecoration: "none", wordBreak: "break-all" }}
                                 >
                                    {data.contact.email}
                                 </a>
                              </div>

                              {/* Website */}
                              <div style={{
                                 borderRadius: 12, padding: "14px 16px",
                                 border: "1px solid rgba(106,172,204,0.12)",
                                 background: "rgba(106,172,204,0.03)",
                                 display: "flex", flexDirection: "column", gap: 8,
                              }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                    <div style={{
                                       width: 26, height: 26, borderRadius: 8,
                                       background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.16)",
                                       display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                    }}>
                                       <Globe size={12} color={CYAN} />
                                    </div>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                       Website
                                    </span>
                                 </div>
                                 <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                    {data.contact.websites.map((w, i) => (
                                       <span key={i} style={{ fontSize: 12, color: TEXT_SECONDARY }}>{w}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           {/* Privacy + Responsible row */}
                           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                              <div style={{
                                 borderRadius: 12, padding: "12px 16px",
                                 border: "1px solid rgba(106,172,204,0.1)",
                                 background: "rgba(106,172,204,0.02)",
                                 display: "flex", flexDirection: "column", gap: 6,
                              }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <ShieldCheck size={11} color={CYAN} style={{ opacity: 0.7 }} />
                                    <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                       Datenschutz
                                    </span>
                                 </div>
                                 <span style={{ fontSize: 11.5, color: TEXT_SECONDARY }}>{data.privacy_url}</span>
                              </div>
                              <div style={{
                                 borderRadius: 12, padding: "12px 16px",
                                 border: "1px solid rgba(106,172,204,0.1)",
                                 background: "rgba(106,172,204,0.02)",
                                 display: "flex", flexDirection: "column", gap: 6,
                              }}>
                                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <User size={11} color={CYAN} style={{ opacity: 0.7 }} />
                                    <span style={{ fontSize: 10, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                       Inhaltlich verantwortlich
                                    </span>
                                 </div>
                                 <span style={{ fontSize: 11.5, color: TEXT_SECONDARY }}>{data.responsible}</span>
                              </div>
                           </div>

                           {/* Divider */}
                           <div style={{ height: 1, background: "rgba(106,172,204,0.08)" }} />

                           {/* Text sections */}
                           <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                              {data.sections.map((section) => (
                                 <div key={section.id} style={{ display: "flex", gap: 16 }}>
                                    <div style={{
                                       flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                                       background: "rgba(106,172,204,0.07)", border: "1px solid rgba(106,172,204,0.15)",
                                       display: "flex", alignItems: "center", justifyContent: "center",
                                       marginTop: 1,
                                    }}>
                                       <span style={{ fontSize: 10, fontWeight: 800, color: CYAN }}>{section.id}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                       <h3 style={{ fontSize: 12.5, fontWeight: 700, color: TEXT_PRIMARY, margin: "0 0 8px", lineHeight: 1.4 }}>
                                          {section.title}
                                       </h3>
                                       <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                                          {section.paragraphs.map((para, i) => (
                                             <p key={i} style={{ fontSize: 12.5, color: TEXT_SECONDARY, lineHeight: 1.75, margin: 0 }}>
                                                {para}
                                             </p>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>

                        </div>
                     </div>

                     {/* Footer */}
                     <div style={{
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(106,172,204,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.02)",
                     }}>
                        <span style={{
                           display: "inline-flex", alignItems: "center", gap: 6,
                           padding: "4px 10px 4px 6px", borderRadius: 999,
                           background: "rgba(106,172,204,0.07)", border: "1px solid rgba(106,172,204,0.16)",
                        }}>
                           <span style={{
                              width: 18, height: 18, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                              display: "inline-flex", alignItems: "center", justifyContent: "center",
                              fontSize: 9, fontWeight: 900, color: "#fff",
                              flexShrink: 0,
                           }}>V</span>
                           <span style={{ fontSize: 11, fontWeight: 600, color: CYAN }}>VidiVerify-Team</span>
                           <span style={{ width: 1, height: 10, background: "rgba(106,172,204,0.25)" }} />
                           <span style={{ fontSize: 11, color: TEXT_MUTED }}>Gera</span>
                        </span>
                        <motion.button
                           onClick={onClose}
                           whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                           style={{
                              padding: "7px 18px", borderRadius: 10,
                              background: "rgba(106,172,204,0.08)", border: "1px solid rgba(106,172,204,0.2)",
                              fontSize: 12, fontWeight: 600, color: CYAN, cursor: "pointer",
                           }}
                        >
                           {t("modal.close")}
                        </motion.button>
                     </div>

                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

export default ImpressumModal;
