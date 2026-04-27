import { AMBER } from "@/constants/theme";

const ProBadge = () => (
   <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
      padding: "2px 7px", borderRadius: 5,
      background: AMBER,
      color: "#1a0900",
      textTransform: "uppercase" as const, lineHeight: 1.6,
      display: "inline-block", verticalAlign: "middle", marginBottom: 2,
      boxShadow: "0 1px 6px rgba(245,158,11,0.45)",
   }}>PRO</span>
);

export default ProBadge;
