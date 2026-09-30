/**
 * Die Allgemeinen Geschäftsbedingungen. Sie regeln den Erwerb einer Lizenz;
 * die Nutzung regelt die EULA.
 *
 * Auf Englisch die Übersetzung (30.09.2026) - Paddle prüft die Domain über
 * vidiverify.com und verlangt Terms in der Navigation; dort stand bis hierher
 * nur die deutsche Fassung. Verbindlich bleibt die deutsche; die Übersetzung
 * sagt das oben selbst (`notice`).
 */
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import agbDe from "../../../data/agb.json";
import agbEn from "../../../data/agb.en.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const AgbModal = ({ open, onClose }: Props) => {
   const { i18n } = useTranslation();
   const deutsch = (i18n.language || "de").toLowerCase().startsWith("de");
   return (
      <RechtstextModal
         open={open}
         onClose={onClose}
         daten={(deutsch ? agbDe : agbEn) as Rechtstext}
         Icon={FileText}
         kennung="agb"
         inhalt
      />
   );
};

export default AgbModal;
