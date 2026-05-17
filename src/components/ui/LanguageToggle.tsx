import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

interface LanguageToggleProps {
   compact?: boolean;
}

const LANGS = [
   { code: "de", flag: "de", labelKey: "languageGermanShort" },
   { code: "en", flag: "us", labelKey: "languageEnglishShort" },
];

const LanguageToggle = ({ compact = false }: LanguageToggleProps) => {
   const { i18n, t } = useTranslation();
   const current = i18n.resolvedLanguage ?? i18n.language ?? "en";

   const switchTo = (code: string) => {
      if (code === current) return;
      i18n.changeLanguage(code);
   };

   return (
      <div
         role="group"
         aria-label={t("common.languageLabel")}
         style={{
            display: "inline-flex",
            gap: 2,
            padding: 3,
            borderRadius: 999,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
         }}
      >
         {LANGS.map(({ code, flag, labelKey }) => {
            const active = current.startsWith(code);
            return (
               <motion.button
                  key={code}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => switchTo(code)}
                  aria-pressed={active}
                  aria-label={t(`common.${labelKey}`)}
                  style={{
                     display: "inline-flex",
                     alignItems: "center",
                     gap: 5,
                     padding: compact ? "3px 8px" : "4px 10px",
                     borderRadius: 999,
                     border: "none",
                     cursor: active ? "default" : "pointer",
                     background: active ? "linear-gradient(135deg, #6aaccc, #4a7da0)" : "transparent",
                     color: active ? "#fff" : "#a5a5c0",
                     fontSize: compact ? 10 : 11,
                     fontWeight: 700,
                     letterSpacing: "0.04em",
                     transition: "background 0.2s, color 0.2s",
                  }}
               >
                  <img
                     src={`https://flagcdn.com/${flag}.svg`}
                     alt=""
                     aria-hidden
                     style={{
                        width: compact ? 14 : 16,
                        height: compact ? 10 : 12,
                        borderRadius: 2,
                        objectFit: "cover",
                     }}
                  />
                  {t(`common.${labelKey}`)}
               </motion.button>
            );
         })}
      </div>
   );
};

export default LanguageToggle;
