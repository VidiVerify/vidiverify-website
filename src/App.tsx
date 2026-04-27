import { useEffect, useState, lazy, Suspense } from "react";
import { ReactLenis } from "lenis/react";
import Nav from "@components/layout/Navigation/Nav";
import Hero from "@components/layout/Header/Hero";
import Footer from "@components/layout/Footer/Footer";
import ErrorBoundary from "@components/common/ErrorBoundary";
import ScrollProgress from "@components/ui/ScrollProgress";
import BackToTop from "@components/ui/BackToTop";
import KeyboardNav from "@components/ui/KeyboardNav";
import { CYAN } from "@/constants/theme";
import SectionTransition from "@components/ui/SectionTransition";
import ParallaxElements from "@components/ui/ParallaxElements";
import AuroraBlobs from "@components/ui/AuroraBlobs";
import ShootingStars from "@components/ui/ShootingStars";
import EulaModal from "@components/ui/EulaModal";
import DatenschutzModal from "@components/ui/DatenschutzModal";
import ImpressumModal from "@components/ui/ImpressumModal";

// Lazy Load "Below the fold" sections for massive performance gains
const About = lazy(() => import("@pages/about/About"));
const Services = lazy(() => import("@pages/services/Services"));
const Achievement = lazy(() => import("@pages/achievement/Achievement"));
const Contact = lazy(() => import("@pages/contact/Contact"));
const Donate = lazy(() => import("@pages/donate/Donate"));
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

   useEffect(() => {
      globalThis.history.scrollRestoration = "manual";
      const hash = window.location.hash.slice(1);
      const modalHashes = ["eula", "datenschutz", "impressum"];
      if (hash && !modalHashes.includes(hash)) {
         const deadline = Date.now() + 4000;
         const tryScroll = () => {
            const el = document.getElementById(hash);
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
      };
      document.addEventListener("click", handler, true);
      return () => document.removeEventListener("click", handler, true);
   }, []);

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
            <AuroraBlobs />
            <ShootingStars />
            <ParallaxElements />
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
                     <SectionTransition variant="glow-pulse" />
                     <div className="section-dark" id="spenden">
                        <Donate />
                     </div>
                  </Suspense>
               </main>
               <Footer />
               <BackToTop />
            </div>
            <EulaModal open={eulaOpen} onClose={() => setEulaOpen(false)} />
            <DatenschutzModal open={datenschutzOpen} onClose={() => setDatenschutzOpen(false)} />
            <ImpressumModal open={impressumOpen} onClose={() => setImpressumOpen(false)} />
         </ErrorBoundary>
      </ReactLenis>
   );
};

export default App;
