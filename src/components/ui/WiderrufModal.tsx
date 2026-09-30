/**
 * Die Widerrufsbelehrung samt Muster-Widerrufsformular. Sie gilt für
 * Verbraucher und ist Bestandteil der AGB.
 *
 * Auf Englisch die Übersetzung als „Refund Policy and Right of Withdrawal"
 * (30.09.2026) - Paddle verlangt eine Refund Policy in der Navigation.
 * Verbindlich bleibt die deutsche Fassung (`notice`).
 */
import { useTranslation } from "react-i18next";
import { Undo2 } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import widerrufDe from "../../../data/widerruf.json";
import widerrufEn from "../../../data/widerruf.en.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const WiderrufModal = ({ open, onClose }: Props) => {
   const { i18n } = useTranslation();
   const deutsch = (i18n.language || "de").toLowerCase().startsWith("de");
   return (
      <RechtstextModal
         open={open}
         onClose={onClose}
         daten={(deutsch ? widerrufDe : widerrufEn) as Rechtstext}
         Icon={Undo2}
         kennung="widerruf"
      />
   );
};

export default WiderrufModal;
