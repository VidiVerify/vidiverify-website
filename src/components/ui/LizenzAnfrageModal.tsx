/**
 * Die Bestellanfrage - der manuelle Kaufweg, als Overlay über der Website.
 *
 * Sie ersetzt die vorbereitete Bestell-Email aus dem Lizenzfenster der
 * Anwendung. Der Grund war handfest: Die kodierte `mailto:`-Adresse sprengte
 * auf Russisch und Chinesisch die Grenze, die Windows an das Emailprogramm
 * weiterreicht, und wurde stillschweigend abgeschnitten. Dazu drei Gründe, die
 * schwerer wiegen - ein Emailprogramm ist keine Voraussetzung, die wir stellen
 * dürfen; Preise und Erklärzeile sind Text AN den Kunden und standen in einer
 * Nachricht VOM Kunden; und wir bekamen Fliesstext statt Daten.
 *
 * **Warum ein Overlay und keine eigene Seite** (Entscheidung 09.09.2026): Die
 * erste Fassung war eine eigene Unterseite mit eigenem Bündel. Sie sah gut
 * aus und war trotzdem falsch - wer eine Software bestellt, klickt zwischen
 * Formular und Website hin und her, um noch etwas nachzulesen. Springt dabei
 * das Design, wirkt es wie ein Anbieterwechsel, und das ausgerechnet im
 * Bezahlvorgang. Das Overlay verlässt den Websiteraum nicht: Nav, Hintergrund
 * und Fuss bleiben stehen, Schliessen ist kein Rücksprung.
 *
 * Drei Dinge fallen dabei nicht weg: Die Adresse `/lizenz-anfrage` trägt
 * weiter (`public/404.html` leitet auf `/#lizenz-anfrage`, samt Abfrage), der
 * Inhalt entsteht erst beim Öffnen und landet deshalb in keinem Suchindex, und
 * die Eingaben überleben ein Schliessen - siehe `entwurf`.
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
import { apiBasis } from "@utils/apiBasis";
import { useFensterStapel } from "@utils/useFensterStapel";
import { emailVorschlag } from "@utils/emailVorschlag";
import { laenderNamen, landVorschlag } from "@utils/laender";
import agbData from "../../../data/agb.json";
import widerrufData from "../../../data/widerruf.json";

const VVID_RE = /^VV-[0-9A-Z]{5}$/;

/* Emailprüfung: ein @, davor und danach etwas, und in der Domain ein Punkt mit
 * einer Endung aus mindestens zwei Buchstaben.
 *
 * Bewusst strenger als `<input type="email">`: Der Browser lässt `max@muster`
 * durch, weil Adressen ohne Punkt technisch zulässig sind (`root@localhost`).
 * Für eine Rechnung, die durchs Internet gehen muss, ist das keine Adresse -
 * und der Kunde merkt den Tippfehler erst, wenn nichts ankommt
 * (Anwenderbefund 10.09.2026). */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

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
 * deshalb ausserhalb der Komponente - sie wird beim Schliessen abgebaut, das
 * Modul bleibt.
 *
 * BEWUSST NUR IM SPEICHER, nicht in `localStorage`: Hier stehen Anschrift und
 * Steuernummer. Was der Browser über die Sitzung hinaus behält, muss man
 * wieder löschen können, und für den einen Zweck - hin und her klicken, ohne
 * etwas zu verlieren - genügt der Speicher.
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

/* Ein Kästchen mit Beschriftung, in der Links stehen dürfen.
 *
 * Der Text ist BEWUSST kein `<label>`, weder verschachtelt noch über
 * `htmlFor`: Ein Klick auf einen Link innerhalb einer Beschriftung leitet der
 * Browser auf das zugehörige Kästchen um. Der Link wird dabei nie ausgelöst -
 * genau das war der Befund, dass sich AGB und Widerrufsbelehrung nicht öffnen
 * liessen (10.09.2026).
 *
 * Stattdessen trägt der Text seine eigene Klickbehandlung: Ein Klick schaltet
 * das Kästchen um, ein Klick auf einen Link darin nicht. Verbunden sind beide
 * über `aria-labelledby`, damit ein Vorleseprogramm die Beschriftung weiterhin
 * findet. `alignItems: flex-start`, weil die Beschriftung zwei Zeilen lang
 * wird und das Kästchen sonst mittig daneben schwebte. */
function Kaestchen({ id, checked, onChange, children }: {
   id: string;
   checked: boolean;
   onChange: (v: boolean) => void;
   children: React.ReactNode;
}) {
   return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
         <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-labelledby={`${id}-text`}
            style={{
               width: 15, height: 15, marginTop: 2, flexShrink: 0,
               accentColor: CYAN, cursor: "pointer",
            }}
         />
         {/* Die beiden Regeln verlangen eine Tastaturbedienung an dieser
             Stelle. Die gibt es: Das Kästchen daneben ist fokussierbar und mit
             der Leertaste schaltbar, und über `aria-labelledby` liest ein
             Vorleseprogramm diesen Text als seine Beschriftung vor. Der
             Klickbereich hier ist reine Bequemlichkeit für die Maus; ihn
             zusätzlich fokussierbar zu machen, hiesse dieselbe Bedienung
             zweimal im Tab-Lauf. */}
         {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,
             jsx-a11y/no-static-element-interactions */}
         <span
            id={`${id}-text`}
            onClick={(e) => {
               // Ein Link führt zu seinem Ziel und schaltet nichts um.
               if ((e.target as HTMLElement).closest("a")) return;
               onChange(!checked);
            }}
            style={{
               fontSize: 12, color: TEXT_SECONDARY, lineHeight: 1.6,
               cursor: "pointer",
            }}
         >
            {children}
         </span>
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

   // Die Preise kommen vom Worker - er ist die Quelle, und er ist derselbe,
   // der die Anfrage entgegennimmt und den Betrag in den Vorgang schreibt.
   const { preise, listenpreise, rabatt, codeGrund, laeuft: preisLaeuft, pruefen }
      = usePreise(open, apiBasis());

   const sitekey = turnstileSchluessel();
   const parameter = new URLSearchParams(window.location.search);
   const nurLokal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
   const appVersion = (parameter.get("ver") || "").slice(0, 32);

   const [vvid, setVvid] = useState(
      entwurf.vvid ?? (parameter.get("vvid") || "").trim().toUpperCase());
   const [wunsch, setWunsch] = useState<Wunsch>(
      entwurf.wunsch ?? (parameter.get("wunsch") === "lifetime" ? "lifetime" : "pro"));
   const [anrede, setAnrede] = useState(entwurf.anrede);
   const [kundentyp, setKundentyp] = useState(entwurf.kundentyp);
   /* Der Blick auf die Bestätigungsseite, ohne eine Anfrage abzusenden.
    *
    * Nur auf `localhost`: Die Seite zeigt Name und Adresse des Bestellers, und
    * die stehen sonst erst da, wenn wirklich jemand bestellt hat. Zum Ansehen
    * genügt `?danke=1&vorname=Max&nachname=Mustermann&email=max@example.de`.
    * Auf den Wirkdomains greift der Weg nicht - dort ist `fertig` nur nach
    * einer echten Absendung wahr. */
   const [felder, setFelder] = useState<Record<string, string>>(() => {
      if (!nurLokal) return entwurf.felder;
      const probe: Record<string, string> = { ...entwurf.felder };
      for (const name of ["vorname", "nachname", "email"]) {
         const wert = parameter.get(name);
         if (wert) probe[name] = wert.slice(0, 80);
      }
      return probe;
   });
   const [rabattcode, setRabattcode] = useState(entwurf.felder.rabattcode || "");

   const [laeuft, setLaeuft] = useState(false);
   const [fertig, setFertig] = useState(
      () => parameter.get("danke") === "1" && nurLokal);
   const [fehler, setFehler] = useState("");
   const [vvidFehler, setVvidFehler] = useState(false);
   const [emailFehler, setEmailFehler] = useState(false);

   const scrollRef = useRef<HTMLDivElement>(null);
   const fehlerRef = useRef<HTMLDivElement>(null);
   const turnstileRef = useRef<HTMLDivElement>(null);
   const widgetRef = useRef<string | null>(null);
   const [botToken, setBotToken] = useState("");

   /* Die beiden Erklärungen.
    *
    * Sie stehen bewusst NICHT im Entwurf, der ein Schliessen überlebt: Eine
    * Zustimmung, die beim nächsten Öffnen schon gesetzt ist, hat niemand in
    * diesem Moment erteilt. Sie wird jedes Mal neu abgegeben.
    *
    * Getrennt und nicht als ein Kästchen, weil sie Verschiedenes bedeuten: Das
    * erste bezieht die Bedingungen ein, das zweite ist die ausdrückliche
    * Erklärung nach § 356 Abs. 5 BGB, ohne die das Widerrufsrecht nicht
    * vorzeitig erlischt. In einem Kästchen zusammengefasst wäre keines von
    * beiden wirksam. */
   /* Die beiden Vorschläge. Sie werden bei jeder Eingabe neu bestimmt - beide
    * Rechnungen sind ein Zeichenkettenvergleich gegen eine kurze Liste und
    * brauchen kein `useMemo`. */
   /* Wen wir auf der Bestätigungsseite ansprechen: Vor- und Nachname, ohne
    * Anrede.
    *
    * „Vielen Dank, Herr Mustermann" führt in das Sie, und zwei Zeilen später
    * steht wieder „deine Anfrage". Der volle Name bleibt beim Du, mit dem das
    * ganze Formular spricht. Fehlt einer der beiden Teile, steht der andere
    * allein; fehlen beide, bleibt es beim Dank ohne Namen. */
   const besteller = [
      (felder.vorname || "").trim(),
      (felder.nachname || "").trim(),
   ].filter(Boolean).join(" ");

   const emailTipp = emailVorschlag(felder.email || "");
   const laender = laenderNamen(sprache);
   const landTipp = landVorschlag(felder.land || "", sprache);

   const [agbOk, setAgbOk] = useState(false);
   const [widerrufOk, setWiderrufOk] = useState(false);
   const [zustimmungFehler, setZustimmungFehler] = useState(false);
   const zustimmungRef = useRef<HTMLDivElement>(null);

   /* Welche Pflichtfelder beim Absenden leer waren.
    *
    * Die Prüfung liegt hier und nicht beim Browser: Dessen `required` öffnet
    * eine Sprechblase mit Ausrufezeichen, die weder zur Oberfläche passt noch
    * mehrere Lücken auf einmal zeigt - sie meldet immer nur das erste Feld.
    * Ein roter Rahmen an allen fehlenden Feldern sagt dasselbe auf einen
    * Blick (Anwenderwunsch 10.09.2026). */
   const [leer, setLeer] = useState<string[]>([]);

   const setzen = (name: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         // Wer tippt, hat die Lücke geschlossen. Der Rahmen geht sofort weg,
         // nicht erst beim nächsten Absenden.
         if (e.target.value.trim()) setLeer((l) => l.filter((n) => n !== name));
         setFelder((alt) => {
            const neu = { ...alt, [name]: e.target.value };
            entwurf.felder = neu;
            return neu;
         });
      };

   /* Der Stil eines Pflichtfeldes: roter Rahmen, solange es fehlt. Dieselbe
    * Farbe wie beim Emailfeld, damit „hier fehlt etwas" überall gleich
    * aussieht. */
   const pflichtStil = (name: string): React.CSSProperties => ({
      ...feldStil,
      borderColor: leer.includes(name) ? "#ef4444" : "rgba(255,255,255,0.10)",
   });

   // Jede Auswahl geht sofort in den Entwurf: Er muss auch dann stimmen, wenn
   // das Fenster im nächsten Augenblick geschlossen wird.
   useEffect(() => { entwurf.vvid = vvid; }, [vvid]);
   useEffect(() => { entwurf.wunsch = wunsch; }, [wunsch]);
   useEffect(() => { entwurf.anrede = anrede; }, [anrede]);
   useEffect(() => { entwurf.kundentyp = kundentyp; }, [kundentyp]);

   // Escape schliesst, der Hintergrund rollt nicht mit - über den gemeinsamen
   // Fensterstapel, damit die Taste NUR das oberste Fenster trifft. Vorher
   // schloss ein Escape in der Datenschutzerklärung das Formular gleich mit,
   // und der Kunde stand wieder auf der Seite.
   useFensterStapel(open, onClose);

   useEffect(() => {
      if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
   }, [open]);

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
      setEmailFehler(!EMAIL_RE.test(email));

      /* Alle leeren Pflichtfelder auf einmal, nicht eines nach dem anderen.
       *
       * Welche das sind, hängt vom Vorgang ab: Eine FREE-Registrierung braucht
       * keine Anschrift, eine Firma zusätzlich die Steuerangaben. */
      const pflicht = ["vorname", "nachname"];
      if (brauchtAnschrift) {
         pflicht.push("strasse", "hausnummer", "plz", "stadt", "land");
         if (kundentyp === "gewerblich") pflicht.push("steuernummer");
      }
      const fehlend = pflicht.filter((n) => !(felder[n] || "").trim());
      // Die Anrede ist kein Textfeld, sondern zwei Knöpfe - sie steht deshalb
      // nicht in `felder` und wird gesondert geprüft, gehört aber in dieselbe
      // Liste: Ein fehlendes Pflichtfeld ist ein fehlendes Pflichtfeld.
      if (!anrede) fehlend.unshift("anrede");
      setLeer(fehlend);

      if (!VVID_RE.test(kennung) || !EMAIL_RE.test(email) || fehlend.length) {
         // Zum ersten Feld, das fehlt - sonst sucht der Kunde den roten Rahmen
         // in einem Formular, das länger ist als der Bildschirm.
         const ziel = !VVID_RE.test(kennung) ? "f-vvid"
            : fehlend.length && !EMAIL_RE.test(email) ? "f-email"
            : fehlend.length ? `f-${fehlend[0]}` : "f-email";
         window.setTimeout(() => {
            document.getElementById(ziel)?.scrollIntoView({
               behavior: "smooth", block: "center",
            });
         }, 50);
         return;
      }
      // Beide Erklärungen sind Voraussetzung, und zwar bevor irgendetwas den
      // Rechner verlässt: Eine Anfrage ohne sie liesse sich später weder der
      // Rechnung zugrunde legen noch belegen.
      if (!agbOk || !widerrufOk) {
         setZustimmungFehler(true);
         setFehler(t.zustimmungFehlt);
         window.setTimeout(() => {
            zustimmungRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
         }, 50);
         return;
      }
      setZustimmungFehler(false);

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
         // auf `.com` läuft die Website über den Reverse-Proxy - beide Male
         // trifft `/api/anfrage` das Richtige, ohne dass hier eine Domain
         // festgeschrieben werden müsste.
         /* Die Adresse kommt aus `apiBasis`, nicht aus dem Quelltext.
          *
          * Beim Entwickeln geht sie in den Sandkasten: Eine Testanfrage
          * gehoert nicht in die Wirkablage zwischen die echten Bestellungen,
          * und ein dort angelegter Rabattcode waere hier sonst unbekannt. */
         const antwort = await fetch(apiBasis() + "/anfrage", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
               ...felder, anrede, kundentyp,
               vv_id: kennung, email, lizenzwunsch: wunsch,
               app_version: appVersion, turnstile: botToken,
               rabattcode,
               // Was der Kunde erklärt hat, und WOZU: Ohne die Fassungskennung
               // ist die Zustimmung später wertlos, weil niemand mehr sagen
               // kann, welcher Wortlaut galt.
               agb_zugestimmt: agbOk,
               widerruf_zugestimmt: widerrufOk,
               agb_fassung: agbData.version,
               widerruf_fassung: widerrufData.version,
            }),
         });
         if (antwort.ok) {
            // Der Entwurf hat seinen Zweck erfüllt. Ihn stehen zu lassen
            // hiesse, dass das nächste Öffnen eine bereits gesendete Anfrage
            // zeigt - und jemand sie ein zweites Mal abschickt.
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
         // Rücksetzer scheiterte der zweite Versuch immer - und zwar mit einer
         // Meldung, die nach unserem Fehler aussieht.
         window.turnstile?.reset(widgetRef.current || undefined);
         setBotToken("");
      } catch {
         setFehler(t.fehlerNetz);
      } finally {
         setLaeuft(false);
      }
      // Nach dem Rendern der Meldung dorthin rollen - sonst bleibt der Klick
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
                              {/* Der Dank mit Namen, wenn einer da ist. Bei einer
                                  FREE-Registrierung ist das Namensfeld oft leer -
                                  dann bleibt es beim Dank ohne Anrede, statt eine
                                  Lücke stehen zu lassen. */}
                              <h3 style={{ fontSize: 18, color: TEXT_PRIMARY, margin: "0 0 10px" }}>
                                 {besteller ? `${t.dankeMitName}, ${besteller}!` : t.dankeOhneName}
                              </h3>
                              <p style={{
                                 fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.75,
                                 maxWidth: 480, margin: "0 auto 4px",
                              }}>
                                 {t.dankeTitel}
                              </p>
                              <p style={{
                                 fontSize: 13, color: TEXT_SECONDARY, lineHeight: 1.75,
                                 maxWidth: 480, margin: "0 auto",
                              }}>
                                 {fettUmsetzen(wunsch === "free" ? t.dankeFrei : t.dankeText)}
                              </p>

                              {/* Die Adresse, an die wir schreiben - hier und nicht
                                  erst in der Rechnung. Ein Tippfehler fällt nur in
                                  diesem Moment noch auf, in dem der Kunde etwas tun
                                  kann. */}
                              {(felder.email || "").trim() && (
                                 <div style={{
                                    // Breite Karte statt eines Kastens, der sich
                                    // um die Adresse legt: Ein schmales Rechteck
                                    // mitten auf einer weiten Fläche wirkt
                                    // verloren, und die Adresse ist hier die
                                    // wichtigste Angabe der ganzen Seite.
                                    display: "flex", flexDirection: "column", gap: 5,
                                    width: "100%", maxWidth: 420,
                                    margin: "20px auto 0", padding: "14px 22px",
                                    borderRadius: 12,
                                    background: "rgba(106,172,204,0.06)",
                                    border: "1px solid rgba(106,172,204,0.22)",
                                 }}>
                                    <span style={{
                                       fontSize: 10, color: TEXT_MUTED,
                                       textTransform: "uppercase", letterSpacing: "0.07em",
                                       fontWeight: 600,
                                    }}>
                                       {t.dankeMeldenAn}
                                    </span>
                                    <span style={{
                                       fontSize: 15, color: TEXT_PRIMARY, fontWeight: 600,
                                       // Die Adresse darf umbrechen statt die
                                       // Karte zu sprengen - manche sind lang.
                                       overflowWrap: "anywhere",
                                    }}>
                                       {(felder.email || "").trim()}
                                    </span>
                                 </div>
                              )}
                              {(felder.email || "").trim() && (
                                 <p style={{
                                    ...hinweis, maxWidth: 480, margin: "10px auto 0",
                                    fontSize: 11.5,
                                 }}>
                                    {t.dankeAdressePruefen}
                                 </p>
                              )}
                           </div>
                        ) : (
                           // `noValidate`: Die Sprechblase des Browsers passt
                           // weder zur Oberfläche noch zeigt sie mehr als ein
                           // fehlendes Feld. Geprüft wird in `absenden`,
                           // gemeldet mit rotem Rahmen.
                           <form id="anfrage-form" onSubmit={absenden} noValidate
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
                                     - ein Preis aus einem Browser ist keine
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
                                              ...feldStil, flex: 1, minWidth: 0,
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
                                  </div>

                                  {/* Die Rückmeldung hat ihre EIGENE Spalte, die
                                      dritte, und teilt sich keinen Platz mit Feld und
                                      Knopf. Beide Zwischenschritte waren falsch: unter
                                      dem Feld schob sie die halbe Maske nach unten, in
                                      derselben Zeile schrumpfte sie Feld und Knopf,
                                      sobald sie erschien. Eine feste Spalte ändert
                                      beim Erscheinen gar nichts an der Umgebung.
                                      Der Rahmen ist derselbe wie bei der Meldung am
                                      Ende des Formulars: grün, wenn der Code gilt, rot,
                                      wenn nicht. */}
                                  <div style={{ display: "flex", alignItems: "flex-end" }}>
                                     {(rabatt || codeGrund) && (
                                        <span style={{
                                           display: "flex", alignItems: "center",
                                           width: "100%", minHeight: 38,
                                           padding: "6px 12px", borderRadius: 8,
                                           fontSize: 12, lineHeight: 1.35,
                                           color: rabatt ? GREEN : "#fca5a5",
                                           background: rabatt
                                              ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                                           border: `1px solid ${rabatt
                                              ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
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
                                     Preis-Sektion, von der der Kunde herkommt - hier wäre sie
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
                                       <div id="f-anrede" style={{ display: "flex", gap: 6 }}>
                                          {[t.herr, t.frau].map((wert) => (
                                             <button
                                                key={wert}
                                                type="button"
                                                onClick={() => {
                                                   setAnrede(wert);
                                                   setLeer((l) => l.filter((n) => n !== "anrede"));
                                                }}
                                                style={{
                                                   ...feldStil,
                                                   padding: "9px 0",
                                                   textAlign: "center",
                                                   cursor: "pointer",
                                                   borderColor: anrede === wert ? CYAN
                                                      : leer.includes("anrede") ? "#ef4444"
                                                      : "rgba(255,255,255,0.10)",
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
                                              onChange={setzen("vorname")} maxLength={80}
                                              style={pflichtStil("vorname")} />} />
                                    <Feld id="f-nachname" titel={t.nachname} pflicht kind={
                                       <input id="f-nachname" value={felder.nachname || ""}
                                              onChange={setzen("nachname")} maxLength={80}
                                              style={pflichtStil("nachname")} />} />
                                 </div>
                                 <div style={{
                                    display: "grid", gap: 12,
                                    gridTemplateColumns: "1fr 1fr", marginTop: 12,
                                 }}>
                                    <Feld id="f-email" titel={t.email} pflicht kind={
                                       <input id="f-email" type="email" maxLength={254}
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
                                 {/* Der Vorschlag bei einer vertippten Domain. Er
                                     korrigiert nichts von selbst: `max@gmx.net` und
                                     `max@gmx.de` sind zwei Postfächer, und welches
                                     gemeint ist, weiss nur der Kunde. */}
                                 {emailTipp && (
                                    <p style={{ ...hinweis, marginTop: 9, color: AMBER }}>
                                       {t.emailTipp}{" "}
                                       <button
                                          type="button"
                                          onClick={() => {
                                             setzen("email")({
                                                target: { value: emailTipp },
                                             } as React.ChangeEvent<HTMLInputElement>);
                                             setEmailFehler(false);
                                          }}
                                          style={{
                                             background: "none", border: "none", padding: 0,
                                             color: AMBER, fontWeight: 700, fontSize: 12,
                                             fontFamily: "inherit", cursor: "pointer",
                                             textDecoration: "underline",
                                          }}
                                       >
                                          {emailTipp}
                                       </button>
                                       {t.tippUebernehmen}
                                    </p>
                                 )}
                                 <p style={{ ...hinweis, marginTop: 9 }}>{t.emailHinweis}</p>
                              </Block>

                              {/* Anschrift - nur, wenn es etwas zu berechnen gibt */}
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
                                                 onChange={setzen("strasse")} maxLength={120}
                                                 style={pflichtStil("strasse")} />} />
                                       <Feld id="f-hausnummer" titel={t.hausnummer} pflicht kind={
                                          <input id="f-hausnummer" value={felder.hausnummer || ""}
                                                 onChange={setzen("hausnummer")} maxLength={20}
                                                 style={pflichtStil("hausnummer")} />} />
                                    </div>
                                    <div style={{
                                       display: "grid", gap: 12,
                                       gridTemplateColumns: "1fr 2fr 2fr", marginTop: 12,
                                    }}>
                                       <Feld id="f-plz" titel={t.plz} pflicht kind={
                                          <input id="f-plz" value={felder.plz || ""}
                                                 onChange={setzen("plz")} maxLength={16}
                                                 style={pflichtStil("plz")} />} />
                                       <Feld id="f-stadt" titel={t.stadt} pflicht kind={
                                          <input id="f-stadt" value={felder.stadt || ""}
                                                 onChange={setzen("stadt")} maxLength={80}
                                                 style={pflichtStil("stadt")} />} />
                                       {/* Vorschlagsliste statt Auswahlfeld: Wer
                                           „Deu" tippt, hat sein Land nach drei
                                           Anschlägen; wer ein Gebiet einträgt, das
                                           die Liste nicht kennt, kann das trotzdem.
                                           Die Namen kommen vom Browser, in der
                                           Sprache des Kunden. */}
                                       <Feld id="f-land" titel={t.land} pflicht kind={
                                          <>
                                             <input id="f-land" value={felder.land || ""}
                                                    onChange={setzen("land")} maxLength={64}
                                                    list="laenderliste"
                                                    autoComplete="country-name"
                                                    style={pflichtStil("land")} />
                                             <datalist id="laenderliste">
                                                {laender.map((l) => <option key={l} value={l} />)}
                                             </datalist>
                                          </>} />
                                    </div>

                                    {/* Und der Fall, den die Liste nicht fängt: Sie
                                        filtert nach Wortanfang, „Deutshcland" beginnt
                                        richtig und endet falsch. */}
                                    {landTipp && (
                                       <p style={{ ...hinweis, marginTop: 9, color: AMBER }}>
                                          {t.landTipp}{" "}
                                          <button
                                             type="button"
                                             onClick={() => setzen("land")({
                                                target: { value: landTipp },
                                             } as React.ChangeEvent<HTMLInputElement>)}
                                             style={{
                                                background: "none", border: "none", padding: 0,
                                                color: AMBER, fontWeight: 700, fontSize: 12,
                                                fontFamily: "inherit", cursor: "pointer",
                                                textDecoration: "underline",
                                             }}
                                          >
                                             {landTipp}
                                          </button>
                                          {t.tippUebernehmen}
                                       </p>
                                    )}
                                    {kundentyp === "gewerblich" && (
                                       <div style={{
                                          display: "grid", gap: 12,
                                          gridTemplateColumns: "1fr 1fr", marginTop: 12,
                                       }}>
                                          <Feld id="f-steuernummer" titel={t.steuernummer} pflicht kind={
                                             <input id="f-steuernummer" value={felder.steuernummer || ""}
                                                    onChange={setzen("steuernummer")} maxLength={32}
                                                    style={pflichtStil("steuernummer")} />} />
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
                                  abgefragt werden - ein Kästchen behauptete eine
                                  Freiwilligkeit, die es nicht gibt. */}
                              <p style={hinweis}>
                                 {t.datenschutz}{" "}
                                 <a href="#datenschutz" style={{ color: CYAN }}>
                                    {t.datenschutzLink}
                                 </a>.
                              </p>

                              {/* Die beiden Erklärungen. Sie stehen unmittelbar
                                  vor dem Absenden, weil sie sich auf diesen
                                  Vorgang beziehen und nicht auf die Seite. */}
                              <div ref={zustimmungRef} style={{
                                 display: "flex", flexDirection: "column", gap: 10,
                                 padding: "13px 15px", borderRadius: 10,
                                 background: zustimmungFehler
                                    ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)",
                                 border: `1px solid ${zustimmungFehler
                                    ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.07)"}`,
                              }}>
                                 <Kaestchen
                                    id="zustimmung-agb"
                                    checked={agbOk}
                                    onChange={(v) => { setAgbOk(v); if (v) setZustimmungFehler(false); }}
                                 >
                                    {t.agbTeil1}{" "}
                                    <a href="#agb" style={{ color: CYAN }}>{t.agbLink}</a>
                                    {t.agbTeil2}{" "}
                                    <a href="#datenschutz" style={{ color: CYAN }}>{t.datenschutzLink}</a>
                                    {t.agbTeil3}
                                 </Kaestchen>
                                 <Kaestchen
                                    id="zustimmung-widerruf"
                                    checked={widerrufOk}
                                    onChange={(v) => { setWiderrufOk(v); if (v) setZustimmungFehler(false); }}
                                 >
                                    {t.widerrufTeil1}{" "}
                                    <a href="#widerruf" style={{ color: CYAN }}>{t.widerrufLink}</a>
                                    {t.widerrufTeil2}
                                 </Kaestchen>
                              </div>

                              {/* Der Satz, der die ganze Konstruktion trägt:
                                  Auf der Seite wird kein Vertrag geschlossen. */}
                              <p style={{ ...hinweis, fontSize: 12.5, color: TEXT_SECONDARY }}>
                                 <strong style={{ color: TEXT_PRIMARY }}>{t.unverbindlichFett}</strong>{" "}
                                 {t.unverbindlichText}
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
                         genau dort, wo dort „Schliessen" steht - und weil die
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
         {/* Die Zeile für den durchgestrichenen Preis steht IMMER, auch ohne
             Rabatt - dann leer und unsichtbar. Erschiene sie erst mit einem
             gültigen Code, wüchse die Karte in dem Moment um eine Zeile: Die
             drei Karten stünden verschieden hoch, und der Text darunter
             spränge in zweien von ihnen nach unten. Ein Preisnachlass darf
             die Seite nicht in Bewegung versetzen. */}
         <span aria-hidden={!statt} style={{
            fontSize: 11, color: TEXT_MUTED, textDecoration: "line-through",
            display: "block", marginTop: 3, textAlign: "right",
            lineHeight: "14px", minHeight: 14,
            visibility: statt ? "visible" : "hidden",
         }}>
            {statt || " "}
         </span>
         <p style={{ ...hinweis, marginTop: 7 }}>{text}</p>
      </button>
   );
}

/** `**fett**` in echten Fettdruck - der Satz zum Zahlungseingang ist der, den
 *  ein Kunde sonst erst aus einer Antwortmail erfährt. */
function fettUmsetzen(text: string) {
   return text.split(/\*\*(.+?)\*\*/g).map((teil, i) =>
      i % 2 === 1
         ? <strong key={i} style={{ color: TEXT_PRIMARY }}>{teil}</strong>
         : <span key={i}>{teil}</span>);
}

export default LizenzAnfrageModal;
