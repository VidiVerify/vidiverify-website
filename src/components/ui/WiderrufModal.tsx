/**
 * Die Widerrufsbelehrung samt Muster-Widerrufsformular. Sie gilt für
 * Verbraucher und ist Bestandteil der AGB.
 */
import { Undo2 } from "lucide-react";
import RechtstextModal from "./RechtstextModal";
import type { Rechtstext } from "./RechtstextModal";
import widerrufData from "../../../data/widerruf.json";

interface Props {
   open: boolean;
   onClose: () => void;
}

const WiderrufModal = ({ open, onClose }: Props) => (
   <RechtstextModal
      open={open}
      onClose={onClose}
      daten={widerrufData as Rechtstext}
      Icon={Undo2}
      kennung="widerruf"
   />
);

export default WiderrufModal;
