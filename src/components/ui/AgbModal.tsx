/**
 * Die Allgemeinen Geschäftsbedingungen. Sie regeln den Erwerb einer Lizenz;
 * die Nutzung regelt die EULA.
 */
import { FileText } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import agbData from "../../../data/agb.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const AgbModal = ({ open, onClose }: Props) => (
   <RechtstextModal
      open={open}
      onClose={onClose}
      daten={agbData as Rechtstext}
      Icon={FileText}
      kennung="agb"
      inhalt
   />
);

export default AgbModal;
