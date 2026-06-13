import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import { useTranslation } from "react-i18next";
import { FaTimes, FaFlask, FaDownload } from "react-icons/fa";
import { TEXT_SECONDARY, TEXT_MUTED } from "@/constants/theme";

// Dezenter Tester-Aktions-Teaser. Zustand kommt aus demselben Manifest, das
// auch die App liest (vidiverify.de/tester/manifest.json) -> ein Schalter,
// beide Seiten im Gleichschritt:
//   active !== true  -> "startet bald" (kein CTA)
//   active === true  -> "jetzt verfügbar" (Download-CTA)
//   ended / Enddatum -> gar nicht einblenden
// Dev-Vorschau: ?promo=soon | ?promo=live | ?promo=off (sofort, ohne Timer/Cooldown).

const MARKENBLAU = "#1B486F";
const ACCENT = "#f5c542"; // gelbe Signalfarbe (PRO-Gold)
const ACCENT_DARK = "#d97706";

const STORAGE_KEY = "vv_tester_promo_v1";
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 Tag Ruhe nach aktivem Schliessen
const FIRST_DELAY_MS = 8000; // verzögerte Erst-Einblendung
const AUTO_HIDE_MS = 12000; // gleitet von selbst wieder weg
const RESHOW_AT_MS = 60000; // einmalige Re-Einblendung für Verweildauer > 60 s
const MANIFEST_URL = "/tester/manifest.json";

type PromoState = "soon" | "live";

interface TesterManifest {
   active?: boolean;
   ended?: boolean;
   end_at?: string | null;
   action_end_at?: string | null;
}

interface Suppress {
   until: number;
   clicked: boolean;
}

const readSuppress = (): Suppress => {
   try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { until: 0, clicked: false };
      const o = JSON.parse(raw) as Partial<Suppress>;
      return { until: Number(o.until) || 0, clicked: o.clicked === true };
   } catch {
      return { until: 0, clicked: false };
   }
};

const writeSuppress = (patch: Partial<Suppress>): void => {
   try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSuppress(), ...patch }));
   } catch {
      /* localStorage nicht verfügbar — ignorieren */
   }
};

const TesterPromo = () => {
   const { t } = useTranslation();
   const lenis = useLenis();
   const [state, setState] = useState<PromoState | null>(null);
   const [visible, setVisible] = useState(false);
   const hideTimer = useRef<number | undefined>(undefined);

   const override = useMemo(
      () => new URLSearchParams(window.location.search).get("promo"),
      [],
   );
   const forced = override === "soon" || override === "live";

   const scheduleAutoHide = useCallback(() => {
      window.clearTimeout(hideTimer.current);
      if (forced) return; // im Review-Modus offen lassen
      hideTimer.current = window.setTimeout(() => setVisible(false), AUTO_HIDE_MS);
   }, [forced]);

   useEffect(() => {
      if (override === "off") return;

      let cancelled = false;
      const timers: number[] = [];

      const run = (resolved: PromoState) => {
         if (cancelled) return;
         setState(resolved);

         if (forced) {
            setVisible(true);
            return;
         }

         const sup = readSuppress();
         if (sup.clicked || Date.now() < sup.until) return;

         timers.push(
            window.setTimeout(() => {
               if (cancelled) return;
               setVisible(true);
               scheduleAutoHide();
            }, FIRST_DELAY_MS),
         );

         timers.push(
            window.setTimeout(() => {
               if (cancelled) return;
               const s = readSuppress();
               if (s.clicked || Date.now() < s.until) return; // aktiv geschlossen -> Ruhe
               setVisible(true);
               scheduleAutoHide();
            }, RESHOW_AT_MS),
         );
      };

      if (forced) {
         run(override === "live" ? "live" : "soon");
      } else {
         fetch(MANIFEST_URL, { cache: "no-store" })
            .then((r) => (r.ok ? (r.json() as Promise<TesterManifest>) : null))
            .then((m) => {
               if (cancelled) return;
               if (m) {
                  const endRaw = m.action_end_at ?? m.end_at ?? null;
                  const ended =
                     m.ended === true || (endRaw !== null && Date.parse(endRaw) < Date.now());
                  if (ended) return; // Kampagne vorbei -> nicht einblenden
                  run(m.active === true ? "live" : "soon");
               } else {
                  run("soon");
               }
            })
            .catch(() => run("soon"));
      }

      return () => {
         cancelled = true;
         timers.forEach((id) => window.clearTimeout(id));
         window.clearTimeout(hideTimer.current);
      };
   }, [override, forced, scheduleAutoHide]);

   const handleClose = useCallback(() => {
      setVisible(false);
      window.clearTimeout(hideTimer.current);
      if (!forced) writeSuppress({ until: Date.now() + COOLDOWN_MS });
   }, [forced]);

   const handleCta = useCallback(() => {
      writeSuppress({ clicked: true });
      setVisible(false);
      if (lenis) {
         lenis.scrollTo("#download", { offset: -64 });
      } else {
         document.getElementById("download")?.scrollIntoView({ behavior: "smooth" });
      }
   }, [lenis]);

   const accent = ACCENT;

   return (
      <AnimatePresence>
         {visible && state && (
            <motion.div
               initial={{ opacity: 0, y: 40, scale: 0.96 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 40, scale: 0.96 }}
               transition={{ type: "spring", stiffness: 120, damping: 18 }}
               role="dialog"
               aria-label={t("testerPromo.headline")}
               style={{
                  position: "fixed",
                  bottom: 24,
                  right: 24,
                  zIndex: 60,
                  width: "min(360px, calc(100vw - 32px))",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "rgba(18,20,28,0.74)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 14px 44px rgba(0,0,0,0.45)",
               }}
            >
               <div style={{ height: 3, background: `linear-gradient(to right, ${accent}, ${MARKENBLAU})` }} />
               <div style={{ padding: "15px 18px 17px", position: "relative" }}>
                  <button
                     onClick={handleClose}
                     aria-label={t("testerPromo.close")}
                     style={{
                        position: "absolute",
                        top: 11,
                        right: 11,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: TEXT_MUTED,
                        cursor: "pointer",
                     }}
                  >
                     <FaTimes size={11} />
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, paddingRight: 28 }}>
                     <span style={{ color: accent, display: "inline-flex" }}>
                        <FaFlask size={13} />
                     </span>
                     <span style={{ fontSize: 11, fontWeight: 600, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {t("testerPromo.kicker")}
                     </span>
                     <motion.span
                        animate={state === "live" ? { boxShadow: [`0 0 0 0 ${accent}66`, `0 0 0 6px ${accent}00`] } : undefined}
                        transition={state === "live" ? { duration: 1.6, repeat: Infinity, ease: "easeOut" } : undefined}
                        style={{
                           fontSize: 9,
                           fontWeight: 800,
                           letterSpacing: "0.08em",
                           padding: "2px 7px",
                           borderRadius: 5,
                           background: accent,
                           color: "#1a1a1a",
                           textTransform: "uppercase",
                        }}
                     >
                        {state === "live" ? t("testerPromo.badgeLive") : t("testerPromo.badgeSoon")}
                     </motion.span>
                  </div>

                  <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#eeeef5" }}>
                     {t("testerPromo.headline")}
                  </h3>
                  <p style={{ margin: "0 0 12px", fontSize: 12.5, lineHeight: 1.6, color: TEXT_SECONDARY }}>
                     {t("testerPromo.body")}
                  </p>

                  {state === "live" && (
                     <motion.button
                        onClick={handleCta}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{
                           display: "inline-flex",
                           alignItems: "center",
                           gap: 8,
                           padding: "8px 16px",
                           borderRadius: 8,
                           border: "none",
                           cursor: "pointer",
                           background: `linear-gradient(to right, ${ACCENT}, ${ACCENT_DARK})`,
                           color: "#1a1a1a",
                           fontSize: 13,
                           fontWeight: 700,
                           marginBottom: 10,
                        }}
                     >
                        <FaDownload size={12} />
                        {t("testerPromo.cta")}
                     </motion.button>
                  )}

                  <p style={{ margin: 0, fontSize: 10, lineHeight: 1.5, color: TEXT_MUTED }}>
                     {t("testerPromo.conditions")}
                  </p>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
   );
};

export default TesterPromo;
