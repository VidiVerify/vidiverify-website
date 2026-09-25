/**
 * Die Endbenutzerlizenzvereinbarung. Aufbau und Verhalten kommen aus
 * `RechtstextModal`, das sich EULA, AGB und Widerrufsbelehrung teilen.
 *
 * Auf Englisch die Übersetzung, die auch das Setup zeigt (24.09.2026) -
 * vidiverify.com liefert englisch aus, und dort stand bis hierher die
 * deutsche Fassung. Verbindlich bleibt die deutsche; die Übersetzung sagt
 * das oben selbst (`notice`).
 */
import { useTranslation } from "react-i18next";
import { ScrollText } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import eulaDe from "../../../data/eula.json";
import eulaEn from "../../../data/eula.en.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const EulaModal = ({ open, onClose }: Props) => {
   const { i18n } = useTranslation();
   const deutsch = (i18n.language || "de").toLowerCase().startsWith("de");
   return (
      <RechtstextModal
         open={open}
         onClose={onClose}
         daten={(deutsch ? eulaDe : eulaEn) as Rechtstext}
         Icon={ScrollText}
         kennung="eula"
         inhalt
      />
   );
};

export default EulaModal;
