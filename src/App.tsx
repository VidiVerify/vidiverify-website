import { useEffect, useState, lazy, Suspense } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@components/layout/Navigation/Nav";
import Hero from "@components/layout/Header/Hero";
import Footer from "@components/layout/Footer/Footer";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ScrollProgress from "@components/ui/ScrollProgress";
import BackToTop from "@components/ui/BackToTop";
import TesterPromo from "@components/ui/TesterPromo";
import KeyboardNav from "@components/ui/KeyboardNav";
import { CYAN } from "@/constants/theme";
import SectionTransition from "@components/ui/SectionTransition";
import ParallaxElements from "@components/ui/ParallaxElements";
import AuroraBlobs from "@components/ui/AuroraBlobs";
import ShootingStars from "@components/ui/ShootingStars";
import EulaModal from "@components/ui/EulaModal";
import DatenschutzModal from "@components/ui/DatenschutzModal";
import ImpressumModal from "@components/ui/ImpressumModal";
import AgbModal from "@components/ui/AgbModal";
import WiderrufModal from "@components/ui/WiderrufModal";
import LizenzAnfrageModal from "@components/ui/LizenzAnfrageModal";
import ProKaufModal from "@components/ui/ProKaufModal";
import ZahlenSeite from "@components/ui/ZahlenSeite";
import { kennungAufraeumen } from "@utils/adresse";

// Lazy Load "Below the fold" sections for massive performance gains
const About = lazy(() => import("@pages/about/About"));
const Services = lazy(() => import("@pages/services/Services"));
const Achievement = lazy(() => import("@pages/achievement/Achievement"));
const Contact = lazy(() => import("@pages/contact/Contact"));
const Roadmap = lazy(() => import("@pages/roadmap/Roadmap"));
const Download = lazy(() => import("@pages/download/Download"));
const Preise = lazy(() => import("@pages/preise/Preise"));

const SectionLoader = () => (
   <div
      style={{
         display: "flex",
         justifyContent: "center",
         alignItems: "center",
         minHeight: "30vh",
      }}
   >
      <div
         style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "2px solid rgba(6, 182, 212, 0.2)",
            borderTopColor: CYAN,
            animation: "spin 1s linear infinite",
         }}
      />
   </div>
);

const App = () => {
   const [eulaOpen, setEulaOpen] = useState(() => window.location.hash === "#eula");
   const [datenschutzOpen, setDatenschutzOpen] = useState(() => window.location.hash === "#datenschutz");
   const [impressumOpen, setImpressumOpen] = useState(() => window.location.hash === "#impressum");
   const [agbOpen, setAgbOpen] = useState(() => window.location.hash === "#agb");
   const [widerrufOpen, setWiderrufOpen] = useState(() => window.location.hash === "#widerruf");
   // Die Bestellanfrage. Sie kommt meist aus der Anwendung: Der Knopf dort
   // fuehrt auf `/lizenz-anfrage?vvid=…`, und `public/404.html` leitet das
   // hierher um - Abfrage inbegriffen, denn ohne sie müsste der Kunde seine
   // Geraetekennung abtippen.
   const [anfrageOpen, setAnfrageOpen] = useState(() => window.location.hash === "#lizenz-anfrage");
   // Die Kaufseite. Sie kommt ebenso aus der Anwendung: „PRO holen" fuehrt auf
   // `/pro?vvid=…&ver=…`. Die VV-ID MUSS dabei ankommen - ohne sie kann ein
   // Kauf keiner Installation zugeordnet werden.
   const [proOpen, setProOpen] = useState(() => window.location.hash === "#pro");
   /* Die Zielseite der verschickten Zahlungslinks. Sie kommt nicht aus der
    * Anwendung, sondern aus einer Email: Der Zahlungsanbieter hängt an diese
    * Adresse `?_ptxn=<Vorgang>`, und Paddle.js öffnet das Bezahlfenster. */
   const [zahlenOffen] = useState(() => window.location.hash === "#zahlen");

   /* Gerätekennung und Version aus der Adresse nehmen, sobald sie gelesen sind.
    *
    * Sie müssen mitkommen - ohne sie lässt sich ein Kauf keiner Installation
    * zuordnen -, aber sie sollen nicht stehen bleiben: In der Adresse landen
    * sie im Browserverlauf, auf jedem Bildschirmfoto und in jedem
    * weitergereichten Link. Wer eine VV-ID kennt, kann bei der Abholstelle das
    * Token dazu anfordern, in dem die Emailadresse des Kunden steht
    * (Sicherheitsprüfung 11.09.2026, Befund 3).
    *
    * Beide Fenster räumten die Adresse bereits auf - aber erst beim
    * SCHLIESSEN, also nach Formular und Bezahlvorgang. Hier geschieht es vor
    * dem ersten Blick. Die Werte selbst gehen nicht verloren: `kennungLesen()`
    * merkt sie sich für die Sitzung. */
   useEffect(() => { kennungAufraeumen(); }, []);

   useEffect(() => {
      globalThis.history.scrollRestoration = "manual";
      const hash = window.location.hash.slice(1);
      const modalHashes = ["eula", "datenschutz", "impressum", "agb", "widerruf", "lizenz-anfrage", "pro"];
      // Wer bestellen will, soll HINTER dem Fenster die Preise sehen.
      //
      // Die Bestellanfrage kommt aus der Anwendung, und der erste Griff nach
      // dem Öffnen ist oft nicht das Formular, sondern eine Frage: Was ist der
      // Unterschied zwischen PRO und LIFETIME? Steht dahinter der Seitenkopf,
      // muss er erst suchen; steht dort die Preistafel, hat er die Antwort,
      // sobald er das Fenster schliesst.
      const zielAnker = (hash === "lizenz-anfrage" || hash === "pro") ? "preise" : hash;
      if (zielAnker && (!modalHashes.includes(zielAnker) || zielAnker === "preise")) {
         const deadline = Date.now() + 4000;
         const tryScroll = () => {
            const el = document.getElementById(zielAnker);
            if (el) {
               el.scrollIntoView({ behavior: "smooth" });
            } else if (Date.now() < deadline) {
               setTimeout(tryScroll, 100);
            }
         };
         setTimeout(tryScroll, 100);
      } else {
         globalThis.scrollTo(0, 0);
      }
   }, []);

   useEffect(() => {
      const handler = (e: MouseEvent) => {
         const anchor = (e.target as Element).closest("a");
         if (!anchor) return;
         const href = anchor.getAttribute("href");
         if (href === "#eula") { e.preventDefault(); setEulaOpen(true); }
         if (href === "#datenschutz") { e.preventDefault(); setDatenschutzOpen(true); }
         if (href === "#impressum") { e.preventDefault(); setImpressumOpen(true); }
         if (href === "#agb") { e.preventDefault(); setAgbOpen(true); }
         if (href === "#widerruf") { e.preventDefault(); setWiderrufOpen(true); }
         if (href === "#lizenz-anfrage") { e.preventDefault(); setAnfrageOpen(true); }
         if (href === "#pro") { e.preventDefault(); setProOpen(true); }
      };
      document.addEventListener("click", handler, true);
      return () => document.removeEventListener("click", handler, true);
   }, []);

   // Liegt ein Fenster über der Seite, ruht die Zierde dahinter. Sie ist
   // ohnehin verdeckt, und ihre Rechenzeit fehlt sonst dort, wo gerade
   // getippt wird.
   // Das Kauffenster gehört mit in diese Liste - es fehlte bis zum
   // 11.09.2026. Ausgerechnet dort ist die Rechenzeit am nötigsten: Die Seite
   // erhebt eine Anschrift, lädt Paddle nach und wartet danach auf die
   // Lizenz, während hinter dem Fenster unsichtbar eine Szene weiterlief.
   const fensterOffen = eulaOpen || datenschutzOpen || impressumOpen || agbOpen
      || widerrufOpen || anfrageOpen || proOpen;

   /* Die Zielseite der Zahlungslinks steht FÜR SICH, ohne die Landeseite
    * dahinter.
    *
    * Wer hier ankommt, hat sich längst entschieden - er hat einen Link aus
    * unserer Email geöffnet und will bezahlen. Eine Preistafel und eine
    * Formatliste hinter dem Bezahlfenster wären an dieser Stelle nur Lärm,
    * und die Szenen im Hintergrund nähmen dem Fenster Rechenzeit (siehe
    * `fensterOffen`). */
   if (zahlenOffen) {
      /* Die Rechtsmodale gehören MIT.
       *
       * Der Fusszeile hier ohne sie zu rendern, hiess: AGB, Widerruf,
       * Datenschutz, EULA und Impressum waren von der Zahlungsseite aus nicht
       * erreichbar - die Links setzten nur einen Zustand, den niemand
       * anzeigte (Codex-Review 22.09.2026, am Routing nachgestellt).
       * Ausgerechnet auf der Seite, auf der bezahlt wird. */
      return (
         <ErrorBoundary>
            <Nav />
            <ZahlenSeite />
            <Footer />
            <EulaModal open={eulaOpen} onClose={() => setEulaOpen(false)} />
            <DatenschutzModal open={datenschutzOpen}
                              onClose={() => setDatenschutzOpen(false)} />
            <ImpressumModal open={impressumOpen}
                            onClose={() => setImpressumOpen(false)} />
            <AgbModal open={agbOpen} onClose={() => setAgbOpen(false)} />
            <WiderrufModal open={widerrufOpen}
                           onClose={() => setWiderrufOpen(false)} />
         </ErrorBoundary>
      );
   }

   return (
      <ReactLenis
         root
         options={{
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
         }}
      >
         <ErrorBoundary>
            <ScrollProgress />
            <KeyboardNav />
            {!fensterOffen && (
               <>
                  <AuroraBlobs />
                  <ShootingStars />
                  <ParallaxElements />
               </>
            )}
            <div className="relative min-h-screen">
               <Nav />
               <main>
                  <Hero />
                  <Suspense fallback={<SectionLoader />}>
                     <SectionTransition variant="gradient-sweep" />
                     <div className="section-darker" id="highlights">
                        <About />
                     </div>
                     <SectionTransition variant="glow-pulse" />
                     <div className="section-dark" id="funktionen">
                        <Services />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-darker" id="formate">
                        <Achievement />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-dark" id="roadmap">
                        <Roadmap />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-dark" id="download">
                        <Download />
                     </div>
                     <SectionTransition variant="beam" />
                     <div className="section-darker" id="preise">
                        <Preise />
                     </div>
                     <SectionTransition variant="gradient-sweep" />
                     <div className="section-darker" id="kontakt">
                        <Contact />
                     </div>
                  </Suspense>
               </main>
               <Footer />
               <BackToTop />
               <TesterPromo />
            </div>
            <EulaModal open={eulaOpen} onClose={() => setEulaOpen(false)} />
            <DatenschutzModal open={datenschutzOpen} onClose={() => setDatenschutzOpen(false)} />
            <ImpressumModal open={impressumOpen} onClose={() => setImpressumOpen(false)} />
            <AgbModal open={agbOpen} onClose={() => setAgbOpen(false)} />
            <WiderrufModal open={widerrufOpen} onClose={() => setWiderrufOpen(false)} />
            <LizenzAnfrageModal open={anfrageOpen} onClose={() => setAnfrageOpen(false)} />
            <ProKaufModal open={proOpen} onClose={() => setProOpen(false)} />
         </ErrorBoundary>
      </ReactLenis>
   );
};

export default App;
