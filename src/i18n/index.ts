import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";

// Default-Logik:
// 1. localStorage ("vidiverify-lang") wenn gesetzt — gewinnt immer (User-Wahl)
// 2. Querystring (?lng=en|de) — von Cloudflare Page Rule gesetzt, wenn jemand
//    via vidiverify.com einsteigt
// 3. Hostname: vidiverify.com → en, vidiverify.de → de (für künftige
//    Domain-Trennung direkt auf GitHub Pages)
// 4. navigator.language: de-* → de, sonst en
// 5. Fallback: en
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

// Custom-Detector via Klasseninstanz VOR init registrieren — sonst wird
// "hostname" beim initialen Detection-Run uebersprungen und der navigator-
// Detector greift faelschlich (Browser=de-DE -> DE selbst auf vidiverify.com).
const lngDetector = new LanguageDetector();
lngDetector.addDetector(HOSTNAME_DETECTOR);

i18n
   .use(lngDetector)
   .use(initReactI18next)
   .init({
      resources: {
         de: { translation: de },
         en: { translation: en },
      },
      fallbackLng: "en",
      supportedLngs: ["de", "en"],
      detection: {
         order: ["localStorage", "querystring", "hostname", "navigator"],
         caches: ["localStorage"],
         lookupLocalStorage: "vidiverify-lang",
         lookupQuerystring: "lng",
      },
      interpolation: {
         escapeValue: false,
      },
      returnObjects: true,
   });

// <html lang="..."> dynamisch synchron halten — wichtig für Screenreader und SEO
const syncHtmlLang = (lng: string) => {
   if (typeof document !== "undefined") {
      document.documentElement.lang = lng.toLowerCase().startsWith("de") ? "de" : "en";
   }
};
syncHtmlLang(i18n.resolvedLanguage ?? i18n.language ?? "en");
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
