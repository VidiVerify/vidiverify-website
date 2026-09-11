/**
 * Die Endbenutzerlizenzvereinbarung. Aufbau und Verhalten kommen aus
 * `RechtstextModal`, das sich EULA, AGB und Widerrufsbelehrung teilen.
 */
import { ScrollText } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import eulaData from "../../../data/eula.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const EulaModal = ({ open, onClose }: Props) => (
   <RechtstextModal
      open={open}
      onClose={onClose}
      daten={eulaData as Rechtstext}
      Icon={ScrollText}
      kennung="eula"
   />
);

export default EulaModal;
