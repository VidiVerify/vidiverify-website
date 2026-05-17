import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";

// Default-Logik:
// 1. localStorage ("vidiverify-lang") wenn gesetzt
// 2. Hostname: vidiverify.com → en, vidiverify.de → de (für künftige
//    Domain-Trennung, aktuell noch ohne Auswirkung)
// 3. navigator.language: de-* → de, sonst en
// 4. Fallback: en
const HOSTNAME_DETECTOR = {
   name: "hostname",
   lookup: () => {
      if (typeof window === "undefined") return undefined;
      const host = window.location.hostname.toLowerCase();
      if (host.endsWith("vidiverify.com")) return "en";
      if (host.endsWith("vidiverify.de")) return "de";
      return undefined;
   },
   cacheUserLanguage: () => undefined,
};

i18n
   .use(LanguageDetector)
   .use(initReactI18next)
   .init({
      resources: {
         de: { translation: de },
         en: { translation: en },
      },
      fallbackLng: "en",
      supportedLngs: ["de", "en"],
      detection: {
         order: ["localStorage", "hostname", "navigator"],
         caches: ["localStorage"],
         lookupLocalStorage: "vidiverify-lang",
      },
      interpolation: {
         escapeValue: false,
      },
      returnObjects: true,
   });

// Custom-Detector registrieren (i18next-browser-languagedetector akzeptiert
// addDetector erst nach init)
(i18n.services.languageDetector as unknown as { addDetector: (d: typeof HOSTNAME_DETECTOR) => void }).addDetector(HOSTNAME_DETECTOR);

// <html lang="..."> dynamisch synchron halten — wichtig für Screenreader und SEO
const syncHtmlLang = (lng: string) => {
   if (typeof document !== "undefined") {
      document.documentElement.lang = lng.toLowerCase().startsWith("de") ? "de" : "en";
   }
};
syncHtmlLang(i18n.resolvedLanguage ?? i18n.language ?? "en");
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
