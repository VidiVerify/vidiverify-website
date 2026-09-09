/**
 * Die Bestellanfrage — der manuelle Kaufweg, als Overlay über der Website.
 *
 * Sie ersetzt die vorbereitete Bestell-Email aus dem Lizenzfenster der
 * Anwendung. Der Grund war handfest: Die kodierte `mailto:`-Adresse sprengte
 * auf Russisch und Chinesisch die Grenze, die Windows an das Emailprogramm
 * weiterreicht, und wurde stillschweigend abgeschnitten. Dazu drei Gründe, die
 * schwerer wiegen — ein Emailprogramm ist keine Voraussetzung, die wir stellen
 * dürfen; Preise und Erklärzeile sind Text AN den Kunden und standen in einer
 * Nachricht VOM Kunden; und wir bekamen Fliesstext statt Daten.
 *
 * **Warum ein Overlay und keine eigene Seite** (Entscheidung 09.09.2026): Die
 * erste Fassung war eine eigene Unterseite mit eigenem Bündel. Sie sah gut
 * aus und war trotzdem falsch — wer eine Software bestellt, klickt zwischen
 * Formular und Website hin und her, um noch etwas nachzulesen. Springt dabei
 * das Design, wirkt es wie ein Anbieterwechsel, und das ausgerechnet im
 * Bezahlvorgang. Das Overlay verlässt den Websiteraum nicht: Nav, Hintergrund
 * und Fuss bleiben stehen, Schliessen ist kein Rücksprung.
 *
 * Drei Dinge fallen dabei nicht weg: Die Adresse `/lizenz-anfrage` trägt
 * weiter (`public/404.html` leitet auf `/#lizenz-anfrage`, samt Abfrage), der
 * Inhalt entsteht erst beim Öffnen und landet deshalb in keinem Suchindex, und
 * die Eingaben überleben ein Schliessen — siehe `entwurf`.
 *
 * WAS DIESES FENSTER NICHT TUT: Es stellt keine Lizenz aus und nimmt kein Geld
 * entgegen. Es schickt eine Anfrage an unseren Worker; alles Weitere
 * entscheidet ein Mensch. Der Zahlungsweg über den Anbieter liegt auf `/pro`
 * und ist ein eigener Zweig.
 *
 * Plan: 05_DOKUMENTATION/PLANUNGEN/PRO Lizenzierungsmodul/
 *       2026-09-09_Bestellanfrage-Umsetzung.md
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { X, KeyRound } from "lucide-react";
import ProBadge from "./ProBadge";
import {
   AMBER, CYAN, GREEN, TEXT_MUTED, TEXT_PRIMARY, TEXT_SECONDARY,
} from "@/constants/theme";
import { spracheAus, TEXTE } from "./lizenzAnfrageTexte";
import { preisText, usePreise } from "@utils/usePreise";
import { turnstileSchluessel } from "@utils/turnstile";

const VVID_RE = /^VV-[0-9A-Z]{5}$/;

type Wunsch = "free" | "pro" | "lifetime";

declare global {
   interface Window {
      turnstile?: {
         render: (el: HTMLElement, o: Record<string, unknown>) => string;
         reset: (id?: string) => void;
      };
   }
}

/* Der Entwurf überlebt das Schliessen.
 *
 * Genau darum ging es beim Wechsel zum Overlay: Wer zwischendurch die Preise
 * nachliest, soll nicht fünfzehn Felder erneut ausfüllen. Der Entwurf steht
 * deshalb ausserhalb der Komponente — sie wird beim Schliessen abgebaut, das
 * Modul bleibt.
 *
 * BEWUSST NUR IM SPEICHER, nicht in `localStorage`: Hier stehen Anschrift und
 * Steuernummer. Was der Browser über die Sitzung hinaus behält, muss man
 * wieder löschen können, und für den einen Zweck — hin und her klicken, ohne
 * etwas zu verlieren — genügt der Speicher.
 */
const entwurf: {
   felder: Record<string, string>;
   anrede: string;
   kundentyp: "privat" | "gewerblich";
   wunsch: Wunsch | null;
   vvid: string | null;
} = { felder: {}, anrede: "", kundentyp: "privat", wunsch: null, vvid: null };

const feldStil: React.CSSProperties = {
   width: "100%",
   padding: "9px 12px",
   borderRadius: 8,
   border: "1px solid rgba(255,255,255,0.10)",
   background: "rgba(255,255,255,0.03)",
   color: TEXT_PRIMARY,
   fontSize: 13.5,
   fontFamily: "inherit",
   outline: "none",
};

const beschriftungStil: React.CSSProperties = {
   display: "block",
   fontSize: 11,
   color: TEXT_MUTED,
   marginBottom: 5,
   letterSpacing: "0.02em",
};

const rubrik: React.CSSProperties = {
   fontSize: 10,
   fontWeight: 700,
   color: TEXT_MUTED,
   textTransform: "uppercase",
   letterSpacing: "0.08em",
   margin: "0 0 12px",
};

const hinweis: React.CSSProperties = {
   fontSize: 12,
   color: TEXT_MUTED,
   lineHeight: 1.6,
   margin: 0,
};

/* Beschriftung und Feld über `htmlFor` verbunden, nicht über Verschachtelung:
 * Ein Vorleseprogramm findet beides so zuverlässig, auch bei `select` und
 * `textarea`. */
function Feld({ id, titel, kind, pflicht }: {
   id: string; titel: string; kind: React.ReactNode; pflicht?: boolean;
}) {
   return (
      <div>
         <label htmlFor={id} style={beschriftungStil}>
            {titel}
            {pflicht && (
               <span style={{ color: AMBER, fontWeight: 700 }} aria-hidden="true">
                  {" *"}
               </span>
            )}
         </label>
         {kind}
      </div>
   );
}

function Block({ titel, children }: { titel: string; children: React.ReactNode }) {
   return (
      <section style={{
         padding: "18px 20px",
         borderRadius: 14,
         border: "1px solid rgba(255,255,255,0.06)",
         background: "rgba(255,255,255,0.02)",
      }}>
         <p style={rubrik}>{titel}</p>
         {children}
      </section>
   );
}

interface Props {
   open: boolean;
   onClose: () => void;
}

const LizenzAnfrageModal = ({ open, onClose }: Props) => {
   const { i18n } = useTranslation();
   const sprache = spracheAus(i18n.language);
   const t = TEXTE[sprache];

   // Die Preise kommen vom Worker — er ist die Quelle, und er ist derselbe,
   // der die Anfrage entgegennimmt und den Betrag in den Vorgang schreibt.
   const { preise, listenpreise, rabatt, codeGrund, laeuft: preisLaeuft, pruefen }
      = usePreise(open);

   const sitekey = turnstileSchluessel();
   const parameter = new URLSearchParams(window.location.search);
   const appVersion = (parameter.get("ver") || "").slice(0, 32);

   const [vvid, setVvid] = useState(
      entwurf.vvid ?? (parameter.get("vvid") || "").trim().toUpperCase());
   const [wunsch, setWunsch] = useState<Wunsch>(
      entwurf.wunsch ?? (parameter.get("wunsch") === "lifetime" ? "lifetime" : "pro"));
   const [anrede, setAnrede] = useState(entwurf.anrede);
   const [kundentyp, setKundentyp] = useState(entwurf.kundentyp);
   const [felder, setFelder] = useState<Record<string, string>>(entwurf.felder);
   const [rabattcode, setRabattcode] = useState(entwurf.felder.rabattcode || "");

   const [laeuft, setLaeuft] = useState(false);
   const [fertig, setFertig] = useState(
      () => parameter.get("danke") === "1"
         && ["localhost", "127.0.0.1"].includes(window.location.hostname));
   const [fehler, setFehler] = useState("");
   const [vvidFehler, setVvidFehler] = useState(false);
   const [emailFehler, setEmailFehler] = useState(false);

   const scrollRef = useRef<HTMLDivElement>(null);
   const fehlerRef = useRef<HTMLDivElement>(null);
   const turnstileRef = useRef<HTMLDivElement>(null);
   const widgetRef = useRef<string | null>(null);
   const [botToken, setBotToken] = useState("");

   const setzen = (name: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
         setFelder((alt) => {
            const neu = { ...alt, [name]: e.target.value };
            entwurf.felder = neu;
            return neu;
         });

   // Jede Auswahl geht sofort in den Entwurf: Er muss auch dann stimmen, wenn
   // das Fenster im nächsten Augenblick geschlossen wird.
   useEffect(() => { entwurf.vvid = vvid; }, [vvid]);
   useEffect(() => { entwurf.wunsch = wunsch; }, [wunsch]);
   useEffect(() => { entwurf.anrede = anrede; }, [anrede]);
   useEffect(() => { entwurf.kundentyp = kundentyp; }, [kundentyp]);

   // Escape schliesst, der Hintergrund rollt nicht mit — dieselbe Handhabung
   // wie bei den Rechtstext-Fenstern.
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

   /* Turnstile nachladen und einmal zeichnen.
    *
    * Ausdrücklich (`render`) statt über das automatische Aufsammeln: Der
    * Entwicklungslauf von React baut jede Komponente zweimal, und das
    * automatische Verfahren setzte dann zwei Widgets nebeneinander. Der
    * Verweis wird beim Schliessen zurückgesetzt, weil das Widget mit dem
    * Fenster verschwindet.
    */
   useEffect(() => {
      if (!open || !sitekey) return;
      const zeichnen = () => {
         if (!window.turnstile || !turnstileRef.current || widgetRef.current) return;
         widgetRef.current = window.turnstile.render(turnstileRef.current, {
            sitekey,
            theme: "dark",
            size: "flexible",
            // Zeigt sich nur, wenn tatsächlich eine Rückfrage nötig ist.
            // Der Regelfall ist ein leerer Platz, und das ist der Zweck.
            appearance: "interaction-only",
            language: sprache,
            callback: (token: string) => setBotToken(token),
            "expired-callback": () => setBotToken(""),
            "error-callback": () => setBotToken(""),
         });
      };
      if (window.turnstile) {
         zeichnen();
      } else {
         const skript = document.createElement("script");
         skript.src =
            "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
         skript.async = true;
         skript.onload = zeichnen;
         document.head.appendChild(skript);
      }
      return () => { widgetRef.current = null; };
   }, [open, sprache, sitekey]);

   const brauchtAnschrift = wunsch !== "free";

   const absenden = async (e: React.FormEvent) => {
      e.preventDefault();
      setFehler("");

      const kennung = vvid.trim().toUpperCase();
      const email = (felder.email || "").trim();
      setVvidFehler(!VVID_RE.test(kennung));
      setEmailFehler(!email.includes("@"));
      if (!VVID_RE.test(kennung) || !email.includes("@")) return;
      if (!anrede) {
         setFehler(t.anredeFehlt);
         window.setTimeout(() => {
            fehlerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
         }, 50);
         return;
      }
      if (sitekey && !botToken) {
         setFehler(t.botOffen);
         window.setTimeout(() => {
            turnstileRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
         }, 50);
         return;
      }

      setLaeuft(true);
      try {
         // Relative Adresse: Auf `.de` liegt der Worker auf derselben Zone, und
         // auf `.com` läuft die Website über den Reverse-Proxy — beide Male
         // trifft `/api/anfrage` das Richtige, ohne dass hier eine Domain
         // festgeschrieben werden müsste.
         const antwort = await fetch("/api/anfrage", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
               ...felder, anrede, kundentyp,
               vv_id: kennung, email, lizenzwunsch: wunsch,
               app_version: appVersion, turnstile: botToken,
               rabattcode,
            }),
         });
         if (antwort.ok) {
            // Der Entwurf hat seinen Zweck erfüllt. Ihn stehen zu lassen
            // hiesse, dass das nächste Öffnen eine bereits gesendete Anfrage
            // zeigt — und jemand sie ein zweites Mal abschickt.
            entwurf.felder = {};
            entwurf.anrede = "";
            entwurf.wunsch = null;
            setFertig(true);
            return;
         }
         const daten = await antwort.json().catch(() => ({}));
         if (antwort.status === 429) setFehler(t.fehlerBremse);
         else if (String(daten.error || "").startsWith("turnstile")) setFehler(t.fehlerBot);
         else if (daten.error === "bad_vvid") setFehler(t.vvidFehler);
         else if (daten.error === "bad_email") setFehler(t.emailFehler);
         else setFehler(t.fehlerAllgemein);
         // Ein verbrauchtes Turnstile-Token gilt nur einmal. Ohne diesen
         // Rücksetzer scheiterte der zweite Versuch immer — und zwar mit einer
         // Meldung, die nach unserem Fehler aussieht.
         window.turnstile?.reset(widgetRef.current || undefined);
         setBotToken("");
      } catch {
         setFehler(t.fehlerNetz);
      } finally {
         setLaeuft(false);
      }
      // Nach dem Rendern der Meldung dorthin rollen — sonst bleibt der Klick
      // ohne sichtbare Antwort.
      window.setTimeout(() => {
         fehlerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
   };

   return (
      <AnimatePresence>
         {open && (
            <>
               <motion.div
                  key="anfrage-backdrop"
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
                  key="anfrage-modal"
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
                     width: "100%", maxWidth: 780, maxHeight: "88vh",
                     display: "flex", flexDirection: "column",
                     background: "rgba(14,16,36,0.97)",
                     border: "1px solid rgba(106,172,204,0.18)",
                     borderRadius: 20,
                     boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(106,172,204,0.06)",
                     pointerEvents: "auto",
                     overflow: "hidden",
                  }}>
                     {/* ── Kopf ── */}
                     <div style={{
                        padding: "22px 28px 20px",
                        borderBottom: "1px solid rgba(106,172,204,0.12)",
                        display: "flex", alignItems: "flex-start", gap: 14,
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.03)",
                     }}>
                        <div style={{
                           width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                           background: "rgba(106,172,204,0.08)",
                           border: "1px solid rgba(106,172,204,0.2)",
                           display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                           <KeyRound size={18} color={CYAN} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                           <p style={{
                              fontSize: 10, color: TEXT_MUTED, textTransform: "uppercase",
                              letterSpacing: "0.08em", fontWeight: 600, margin: 0,
                              lineHeight: 1.4, display: "flex", alignItems: "center", gap: 7,
                           }}>
                              VidiVerify <ProBadge />
                           </p>
                           <h2 style={{
                              fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, margin: "4px 0 0",
                           }}>
                              {t.titel}
                           </h2>
                           <p style={{ fontSize: 11.5, color: TEXT_MUTED, margin: "4px 0 0", lineHeight: 1.5 }}>
                              {t.untertitel}
                           </p>
                        </div>
                        <button
                           onClick={onClose}
                           aria-label="schliessen"
                           style={{
                              flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: TEXT_MUTED,
                           }}
                        >
                           <X size={15} />
                        </button>
                     </div>

                     {/* ── Inhalt ── */}
                     <div
                        ref={scrollRef}
                        data-lenis-prevent
                        onWheel={(e) => e.stopPropagation()}
                        style={{
                           overflowY: "auto", flex: 1, padding: "22px 28px 28px",
                           scrollbarWidth: "thin",
                           scrollbarColor: "rgba(106,172,204,0.2) transparent",
                        }}
                     >
                        {fertig ? (
                           <div style={{ textAlign: "center", padding: "28px 8px 12px" }}>
                              <div style={{
                                 width: 52, height: 52, borderRadius: "50%", margin: "0 auto 18px",
                                 background: "rgba(34,197,94,0.10)",
                                 border: "1px solid rgba(34,197,94,0.30)",
                                 display: "flex", alignItems: "center", justifyContent: "center",
                                 fontSize: 24, color: GREEN,
                              }}>✓</div>
                              <h3 style={{ fontSize: 18, color: TEXT_PRIMARY, margin: "0 0 10px" }}>
                                 {t.dankeTitel}
                              </h3>
                              <p style={{
                                 fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.75,
                                 maxWidth: 480, margin: "0 auto",
                              }}>
                                 {fettUmsetzen(wunsch === "free" ? t.dankeFrei : t.dankeText)}
                              </p>
                           </div>
                        ) : (
                           <form id="anfrage-form" onSubmit={absenden}
                                 style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                              {!sitekey && (
                                 <div style={{
                                    padding: "14px 16px", borderRadius: 10,
                                    background: "rgba(245,158,11,0.06)",
                                    borderLeft: "3px solid #f59e0b",
                                 }}>
                                    <strong style={{
                                       color: TEXT_PRIMARY, display: "block",
                                       marginBottom: 5, fontSize: 13,
                                    }}>
                                       {t.turnstileFehltTitel}
                                    </strong>
                                    <span style={{ color: TEXT_SECONDARY, fontSize: 12.5 }}>
                                       {t.turnstileFehltText}
                                    </span>
                                 </div>
                              )}

                              {/* Gerätekennung */}
                              <Block titel={t.vvidTitel}>
                                 <Feld id="f-vvid" titel={t.vvidFeld} pflicht kind={
                                    <input
                                       id="f-vvid"
                                       required
                                       value={vvid}
                                       onChange={(e) => setVvid(e.target.value.toUpperCase())}
                                       placeholder={t.vvidPlatzhalter}
                                       maxLength={16}
                                       style={{
                                          ...feldStil, maxWidth: 220,
                                          fontFamily: "JetBrains Mono, ui-monospace, monospace",
                                          letterSpacing: "0.08em",
                                          borderColor: vvidFehler
                                             ? "#ef4444" : "rgba(255,255,255,0.10)",
                                       }}
                                    />} />
                                 <p style={{ ...hinweis, marginTop: 9 }}>
                                    {vvidFehler ? t.vvidFehler : t.vvidHinweis}
                                 </p>
                              </Block>

                              {/* Lizenzwahl */}
                              <Block titel={t.wunschTitel}>
                                 <div style={{
                                    display: "grid", gap: 10,
                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                 }}>
                                    <Wahl gewaehlt={wunsch === "free"} onClick={() => setWunsch("free")}
                                          titel={t.freeTitel} preis={t.freePreis}
                                          text={t.freeText} farbe={GREEN} />
                                    <Wahl gewaehlt={wunsch === "pro"} onClick={() => setWunsch("pro")}
                                          titel={t.proTitel}
                                          preis={preisText(preise.pro, sprache)}
                                          statt={preise.pro !== listenpreise.pro
                                             ? t.statt + " " + preisText(listenpreise.pro, sprache)
                                             : ""}
                                          text={t.proText} farbe={CYAN} />
                                    <Wahl gewaehlt={wunsch === "lifetime"}
                                          onClick={() => setWunsch("lifetime")}
                                          titel={t.lifetimeTitel}
                                          preis={preisText(preise.lifetime, sprache)}
                                          statt={preise.lifetime !== listenpreise.lifetime
                                             ? t.statt + " " + preisText(listenpreise.lifetime, sprache)
                                             : ""}
                                          text={t.lifetimeText} farbe="#f59e0b" />
                                 </div>

                                 {/* Der Rabattcode. Er aendert die ANZEIGE; was
                                     berechnet wird, rechnet der Worker beim
                                     Eingang der Anfrage noch einmal selbst nach
                                     — ein Preis aus einem Browser ist keine
                                     Grundlage fuer eine Rechnung. */}
                                 <div style={{
                                    display: "grid", gap: 10, marginTop: 12,
                                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                 }}>
                                  <div style={{ gridColumn: "span 2" }}>
                                    <label htmlFor="f-rabatt" style={beschriftungStil}>
                                       {t.rabattTitel}
                                    </label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                    <input id="f-rabatt" value={rabattcode}
                                           onChange={(e) => {
                                              const wert = e.target.value.toUpperCase();
                                              setRabattcode(wert);
                                              entwurf.felder = {
                                                 ...entwurf.felder, rabattcode: wert,
                                              };
                                           }}
                                           onKeyDown={(e) => {
                                              // Return im Codefeld prueft den Code,
                                              // statt die halbe Anfrage abzuschicken.
                                              if (e.key === "Enter") {
                                                 e.preventDefault();
                                                 void pruefen(rabattcode);
                                              }
                                           }}
                                           maxLength={32}
                                           placeholder={t.rabattPlatzhalter}
                                           style={{
                                              ...feldStil, flex: 1,
                                              fontFamily: "JetBrains Mono, ui-monospace, monospace",
                                              letterSpacing: "0.06em",
                                           }} />
                                    <button type="button"
                                            onClick={() => void pruefen(rabattcode)}
                                            disabled={!rabattcode || preisLaeuft}
                                            style={{
                                               padding: "9px 16px", borderRadius: 8,
                                               border: "1px solid rgba(255,255,255,0.12)",
                                               background: "rgba(255,255,255,0.04)",
                                               color: rabattcode ? TEXT_PRIMARY : TEXT_MUTED,
                                               fontSize: 12.5, fontFamily: "inherit",
                                               cursor: rabattcode ? "pointer" : "not-allowed",
                                            }}>
                                       {t.rabattPruefen}
                                    </button>
                                    </div>
                                    {(rabatt || codeGrund) && (
                                       <span style={{
                                          fontSize: 12, marginTop: 6, display: "block",
                                          color: rabatt ? GREEN : "#fca5a5",
                                       }}>
                                          {rabatt ? t.rabattGilt
                                             : codeGrund === "abgelaufen" ? t.rabattAbgelaufen
                                             : codeGrund === "aufgebraucht" ? t.rabattAufgebraucht
                                             : codeGrund === "netz" ? t.rabattNetz
                                             : t.rabattUnbekannt}
                                       </span>
                                    )}
                                  </div>
                                 </div>
                                 {/* Die Erklärzeile zum Verhältnis PRO/LIFETIME steht auf der
                                     Preis-Sektion, von der der Kunde herkommt — hier wäre sie
                                     die Wiederholung einer eben gelesenen Aussage. */}
                                 <p style={{ ...hinweis, marginTop: 12 }}>{t.preisHinweis}</p>
                              </Block>

                              {/* Kontakt */}
                              <Block titel={t.kontaktTitel}>
                                 <div style={{
                                    display: "grid", gap: 12,
                                    gridTemplateColumns: "150px 1fr 1fr",
                                 }}>
                                    <Feld id="f-anrede" titel={t.anrede} pflicht kind={
                                       <div style={{ display: "flex", gap: 6 }}>
                                          {[t.herr, t.frau].map((wert) => (
                                             <button
                                                key={wert}
                                                type="button"
                                                onClick={() => setAnrede(wert)}
                                                style={{
                                                   ...feldStil,
                                                   padding: "9px 0",
                                                   textAlign: "center",
                                                   cursor: "pointer",
                                                   borderColor: anrede === wert
                                                      ? CYAN : "rgba(255,255,255,0.10)",
                                                   background: anrede === wert
                                                      ? "rgba(106,172,204,0.10)"
                                                      : "rgba(255,255,255,0.03)",
                                                   color: anrede === wert
                                                      ? TEXT_PRIMARY : TEXT_MUTED,
                                                }}>
                                                {wert}
                                             </button>
                                          ))}
                                       </div>} />
                                    <Feld id="f-vorname" titel={t.vorname} pflicht kind={
                                       <input id="f-vorname" value={felder.vorname || ""}
                                              onChange={setzen("vorname")} required maxLength={80}
                                              style={feldStil} />} />
                                    <Feld id="f-nachname" titel={t.nachname} pflicht kind={
                                       <input id="f-nachname" value={felder.nachname || ""}
                                              onChange={setzen("nachname")} required maxLength={80}
                                              style={feldStil} />} />
                                 </div>
                                 <div style={{
                                    display: "grid", gap: 12,
                                    gridTemplateColumns: "1fr 1fr", marginTop: 12,
                                 }}>
                                    <Feld id="f-email" titel={t.email} pflicht kind={
                                       <input id="f-email" type="email" required maxLength={254}
                                              value={felder.email || ""} onChange={setzen("email")}
                                              style={{
                                                 ...feldStil,
                                                 borderColor: emailFehler
                                                    ? "#ef4444" : "rgba(255,255,255,0.10)",
                                              }} />} />
                                    <Feld id="f-telefon" titel={t.telefon} kind={
                                       <input id="f-telefon" value={felder.telefon || ""}
                                              onChange={setzen("telefon")} maxLength={40}
                                              style={feldStil} />} />
                                 </div>
                                 <p style={{ ...hinweis, marginTop: 9 }}>{t.emailHinweis}</p>
                              </Block>

                              {/* Anschrift — nur, wenn es etwas zu berechnen gibt */}
                              {brauchtAnschrift && (
                                 <Block titel={t.anschriftTitel}>
                                    <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
                                       <span style={{ ...beschriftungStil, marginBottom: 0, alignSelf: "center" }}>
                                          {t.kundentyp}
                                       </span>
                                       {(["privat", "gewerblich"] as const).map((art) => (
                                          <span key={art} style={{
                                             display: "flex", alignItems: "center", gap: 7,
                                             color: TEXT_SECONDARY, fontSize: 13,
                                          }}>
                                             <input id={"kt-" + art} type="radio" name="kundentyp"
                                                    checked={kundentyp === art}
                                                    onChange={() => setKundentyp(art)} />
                                             <label htmlFor={"kt-" + art} style={{ cursor: "pointer" }}>
                                                {art === "privat" ? t.privat : t.gewerblich}
                                             </label>
                                          </span>
                                       ))}
                                    </div>
                                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "3fr 1fr" }}>
                                       <Feld id="f-strasse" titel={t.strasse} pflicht kind={
                                          <input id="f-strasse" value={felder.strasse || ""}
                                                 onChange={setzen("strasse")} required maxLength={120}
                                                 style={feldStil} />} />
                                       <Feld id="f-hausnummer" titel={t.hausnummer} pflicht kind={
                                          <input id="f-hausnummer" value={felder.hausnummer || ""}
                                                 onChange={setzen("hausnummer")} required maxLength={20}
                                                 style={feldStil} />} />
                                    </div>
                                    <div style={{
                                       display: "grid", gap: 12,
                                       gridTemplateColumns: "1fr 2fr 2fr", marginTop: 12,
                                    }}>
                                       <Feld id="f-plz" titel={t.plz} pflicht kind={
                                          <input id="f-plz" value={felder.plz || ""}
                                                 onChange={setzen("plz")} required maxLength={16}
                                                 style={feldStil} />} />
                                       <Feld id="f-stadt" titel={t.stadt} pflicht kind={
                                          <input id="f-stadt" value={felder.stadt || ""}
                                                 onChange={setzen("stadt")} required maxLength={80}
                                                 style={feldStil} />} />
                                       <Feld id="f-land" titel={t.land} pflicht kind={
                                          <input id="f-land" value={felder.land || ""}
                                                 onChange={setzen("land")} required maxLength={64}
                                                 style={feldStil} />} />
                                    </div>
                                    {kundentyp === "gewerblich" && (
                                       <div style={{
                                          display: "grid", gap: 12,
                                          gridTemplateColumns: "1fr 1fr", marginTop: 12,
                                       }}>
                                          <Feld id="f-steuernummer" titel={t.steuernummer} pflicht kind={
                                             <input id="f-steuernummer" value={felder.steuernummer || ""}
                                                    onChange={setzen("steuernummer")} required maxLength={32}
                                                    style={feldStil} />} />
                                          <Feld id="f-ustid" titel={t.ustid} kind={
                                             <input id="f-ustid" value={felder.ustid || ""}
                                                    onChange={setzen("ustid")} maxLength={32}
                                                    style={feldStil} />} />
                                       </div>
                                    )}
                                 </Block>
                              )}

                              {/* Anmerkung */}
                              <Block titel={t.infosTitel}>
                                 <textarea value={felder.infos || ""} onChange={setzen("infos")}
                                           maxLength={2000} rows={3}
                                           aria-label={t.infosTitel}
                                           placeholder={t.infosPlatzhalter}
                                           style={{ ...feldStil, resize: "vertical" }} />
                              </Block>

                              <p style={{ ...hinweis, marginTop: 2 }}>
                                 <span style={{ color: AMBER, fontWeight: 700 }}>*</span>
                                 {t.pflichtnote.replace("*", "")}
                              </p>

                              {/* Datenschutz: Hinweis, KEIN Kästchen.
                                  Die Verarbeitung läuft über die Vertragsanbahnung. Was
                                  dafür nötig ist, darf gar nicht per Einwilligung
                                  abgefragt werden — ein Kästchen behauptete eine
                                  Freiwilligkeit, die es nicht gibt. */}
                              <p style={hinweis}>
                                 {t.datenschutz}{" "}
                                 <a href="#datenschutz" style={{ color: CYAN }}>
                                    {t.datenschutzLink}
                                 </a>.
                              </p>

                              <div ref={turnstileRef} style={{ minHeight: 4 }} />

                              {fehler && (
                                 <div ref={fehlerRef} style={{
                                    padding: "11px 14px", borderRadius: 8,
                                    background: "rgba(239,68,68,0.08)",
                                    border: "1px solid rgba(239,68,68,0.25)",
                                    color: "#fca5a5", fontSize: 12.5,
                                 }}>
                                    <strong style={{ display: "block", marginBottom: 3 }}>
                                       {t.fehlerTitel}
                                    </strong>
                                    {fehler}
                                 </div>
                              )}
                           </form>
                        )}
                     </div>

                     {/* ── Fussleiste ──
                         Dieselbe wie in den Rechtstext-Fenstern: links das
                         Signet, rechts die Aktion. Der Absendeknopf steht
                         genau dort, wo dort „Schliessen" steht — und weil die
                         Leiste nicht mitrollt, bleibt er auch bei
                         ausgeklappter Anschrift sichtbar. */}
                     <div style={{
                        padding: "14px 28px",
                        borderTop: "1px solid rgba(106,172,204,0.1)",
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between",
                        flexShrink: 0,
                        background: "rgba(106,172,204,0.02)",
                     }}>
                        <span style={{
                           display: "inline-flex", alignItems: "center", gap: 6,
                           padding: "4px 10px 4px 6px", borderRadius: 999,
                           background: "rgba(106,172,204,0.07)",
                           border: "1px solid rgba(106,172,204,0.16)",
                        }}>
                           <span style={{
                              width: 18, height: 18, borderRadius: "50%",
                              background: `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                              display: "inline-flex", alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9, fontWeight: 900, color: "#fff",
                              flexShrink: 0,
                           }}>V</span>
                           <span style={{ fontSize: 11, fontWeight: 600, color: CYAN }}>
                              VidiVerify-Team
                           </span>
                           <span style={{ width: 1, height: 10, background: "rgba(106,172,204,0.25)" }} />
                           <span style={{ fontSize: 11, color: TEXT_MUTED }}>Gera</span>
                        </span>

                        {fertig ? (
                           <motion.button
                              onClick={onClose}
                              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                              style={{
                                 padding: "7px 18px", borderRadius: 10,
                                 background: "rgba(106,172,204,0.08)",
                                 border: "1px solid rgba(106,172,204,0.2)",
                                 fontSize: 12, fontWeight: 600, color: CYAN,
                                 cursor: "pointer", fontFamily: "inherit",
                              }}
                           >
                              {t.zurueck}
                           </motion.button>
                        ) : (
                           <motion.button
                              type="submit" form="anfrage-form"
                              disabled={laeuft || !sitekey}
                              whileHover={laeuft || !sitekey ? undefined : { scale: 1.04 }}
                              whileTap={laeuft || !sitekey ? undefined : { scale: 0.97 }}
                              style={{
                                 padding: "9px 22px", borderRadius: 10, border: "none",
                                 background: laeuft || !sitekey
                                    ? "rgba(255,255,255,0.08)"
                                    : `linear-gradient(135deg, ${CYAN}, #4a7da0)`,
                                 color: laeuft || !sitekey ? TEXT_MUTED : "#08111a",
                                 fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                                 cursor: laeuft || !sitekey ? "not-allowed" : "pointer",
                              }}
                           >
                              {laeuft ? t.sendet : t.absenden}
                           </motion.button>
                        )}
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
   );
};

function Wahl({ gewaehlt, onClick, titel, preis, statt, text, farbe }: {
   gewaehlt: boolean; onClick: () => void;
   titel: string; preis: string; statt?: string; text: string; farbe: string;
}) {
   return (
      <button type="button" onClick={onClick} style={{
         textAlign: "left", padding: 14, borderRadius: 12, cursor: "pointer",
         display: "flex", flexDirection: "column", alignItems: "stretch",
         justifyContent: "flex-start",
         background: gewaehlt ? `${farbe}12` : "rgba(255,255,255,0.02)",
         border: `1px solid ${gewaehlt ? farbe : "rgba(255,255,255,0.08)"}`,
         color: TEXT_PRIMARY, fontFamily: "inherit",
      }}>
         <div style={{
            display: "flex", alignItems: "baseline",
            justifyContent: "space-between", gap: 8,
         }}>
            <span style={{ fontWeight: 700, letterSpacing: "0.04em", fontSize: 13 }}>
               {titel}
            </span>
            <span style={{ color: farbe, fontSize: 12.5, fontWeight: 700 }}>{preis}</span>
         </div>
         {statt && (
            <span style={{
               fontSize: 11, color: TEXT_MUTED, textDecoration: "line-through",
               display: "block", marginTop: 3, textAlign: "right",
            }}>
               {statt}
            </span>
         )}
         <p style={{ ...hinweis, marginTop: 7 }}>{text}</p>
      </button>
   );
}

/** `**fett**` in echten Fettdruck — der Satz zum Zahlungseingang ist der, den
 *  ein Kunde sonst erst aus einer Antwortmail erfährt. */
function fettUmsetzen(text: string) {
   return text.split(/\*\*(.+?)\*\*/g).map((teil, i) =>
      i % 2 === 1
         ? <strong key={i} style={{ color: TEXT_PRIMARY }}>{teil}</strong>
         : <span key={i}>{teil}</span>);
}

export default LizenzAnfrageModal;
