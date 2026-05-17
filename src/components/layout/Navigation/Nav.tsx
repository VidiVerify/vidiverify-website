import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useMediaQuery from "@utils/useMediaQuery";
import NavBar from "./NavBar";
import MobileMenu from "./MobileMenu";

interface NavSection {
   id: string;
   label: string;
}

const NAV_KEYS: { id: string; key: string }[] = [
   { id: "highlights", key: "highlights" },
   { id: "funktionen", key: "features" },
   { id: "formate", key: "formats" },
   { id: "roadmap", key: "roadmap" },
   { id: "download", key: "download" },
   { id: "preise", key: "pricing" },
   { id: "kontakt", key: "contact" },
   { id: "spenden", key: "support" },
];

const Nav = () => {
   const { t } = useTranslation();
   const isMobile = useMediaQuery("(max-width: 1023px)");
   const [activeSection, setActiveSection] = useState("hero");
   const [sectionProgress, setSectionProgress] = useState(0);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const activeSectionRef = useRef("hero");

   const NAV_SECTIONS: NavSection[] = useMemo(
      () => NAV_KEYS.map(({ id, key }) => ({ id, label: t(`nav.${key}`) })),
      [t],
   );

   // Lightweight scroll listener for nav background only
   useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 50);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
   }, []);

   // IntersectionObserver-based scroll-spy (replaces per-scroll DOM queries)
   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (entry.isIntersecting) {
                  const id = entry.target.id;
                  activeSectionRef.current = id;
                  setActiveSection(id);
                  const rect = entry.boundingClientRect;
                  const viewMiddle = window.innerHeight * 0.35;
                  const progress = (viewMiddle - rect.top) / rect.height;
                  setSectionProgress(Math.max(0, Math.min(1, progress)));
               }
            }
         },
         {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: "-35% 0px -60% 0px",
         },
      );

      const heroEl = document.getElementById("hero");
      if (heroEl) observer.observe(heroEl);
      // Stabile NAV_KEYS statt der sprachabhaengigen NAV_SECTIONS — die IDs aendern
      // sich nicht beim Sprachwechsel, daher kann das Effekt-Deps-Array leer bleiben.
      for (const { id } of NAV_KEYS) {
         const el = document.getElementById(id);
         if (el) observer.observe(el);
      }

      return () => observer.disconnect();
   }, []);

   const scrollToSection = useCallback((id: string) => {
      const el = document.querySelector(`#${id}`);
      if (el) {
         el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileMenuOpen(false);
   }, []);

   return (
      <>
         <NavBar
            scrolled={scrolled}
            isMobile={isMobile}
            sections={NAV_SECTIONS}
            activeSection={activeSection}
            sectionProgress={sectionProgress}
            mobileMenuOpen={mobileMenuOpen}
            onNavigate={scrollToSection}
            onToggleMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
         />

         {/* Mobile overlay menu */}
         <MobileMenu
            open={mobileMenuOpen}
            sections={NAV_SECTIONS}
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onClose={() => setMobileMenuOpen(false)}
         />
      </>
   );
};

export default Nav;
