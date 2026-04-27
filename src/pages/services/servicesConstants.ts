import { ScanSearch, ShieldCheck, Film, FileVideo, LayoutList, ClipboardList, Code } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
   "Vorprüfung": ScanSearch,
   "Integritätsprüfung": ShieldCheck,
   "Media Analyse": Film,
   "Formatprüfung": FileVideo,
   "Strukturierte Ergebnisdarstellung": LayoutList,
   "Ergebnis-Dokumentation": ClipboardList,
   _fallback: Code,
};

export interface AccentColor {
   iconBg: string;
   icon: string;
   dot: string;
   borderHover: string;
}

export const ACCENT_COLORS: AccentColor[] = [
   { iconBg: "rgba(106,172,204,0.1)", icon: "#6aaccc", dot: "#6aaccc", borderHover: "rgba(106,172,204,0.4)" },
   { iconBg: "rgba(34,197,94,0.1)",   icon: "#22c55e", dot: "#22c55e", borderHover: "rgba(34,197,94,0.4)"   },
   { iconBg: "rgba(156,199,224,0.1)", icon: "#9cc7e0", dot: "#9cc7e0", borderHover: "rgba(156,199,224,0.4)" },
   { iconBg: "rgba(245,158,11,0.1)",  icon: "#f59e0b", dot: "#f59e0b", borderHover: "rgba(245,158,11,0.4)"  },
   { iconBg: "rgba(167,139,250,0.1)", icon: "#a78bfa", dot: "#a78bfa", borderHover: "rgba(167,139,250,0.4)" },
   { iconBg: "rgba(74,125,160,0.1)",  icon: "#4a7da0", dot: "#4a7da0", borderHover: "rgba(74,125,160,0.4)"  },
];
