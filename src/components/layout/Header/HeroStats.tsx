import { useMemo } from "react";
import { motion } from "motion/react";
import { getStatistics, getSiteConfig } from "@data/dataLoader";
import { staggerItem } from "@utils/animations";
import AnimatedCounter from "@components/ui/AnimatedCounter";
import { useGitHubDownloadCount } from "@/hooks/useGitHubDownloadCount";
import { usePageViewCount } from "@/hooks/usePageViewCount";

const LABELS: Record<string, string> = {
   launch: "Launch",
   formate: "Formate",
   codezeilen: "Codezeilen",
   funktionen: "Funktionen",
   downloads: "Downloads",
   seitenaufrufe: "Seitenaufrufe",
};

const HeroStats = () => {
   const statistics = useMemo(() => getStatistics(), []);
   const { counter_namespace, gc_code } = useMemo(() => getSiteConfig(), []);
   const { count: dlCount } = useGitHubDownloadCount("VidiVerify", "vidiverify-releases");
   const { count: pvCount } = usePageViewCount({ namespace: counter_namespace, gcCode: gc_code });

   const statsArray = useMemo(() => {
      return Object.entries(statistics).map(([key, value]) => ({
         key,
         label: LABELS[key] ?? key.replaceAll("_", " "),
         value:
            key === "downloads" && dlCount !== null ? `${dlCount}+` :
            key === "seitenaufrufe" && pvCount !== null ? `${pvCount}+` :
            value,
      }));
   }, [statistics, dlCount, pvCount]);

   return (
      <motion.div
         className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-2"
         variants={staggerItem}
      >
         {statsArray.map((stat) => (
            <div key={stat.key} className="flex flex-col items-center gap-1.5">
               <AnimatedCounter value={stat.value} duration={2} />
               <span className="text-text-muted text-xs md:text-sm font-medium tracking-wide uppercase">
                  {stat.label}
               </span>
            </div>
         ))}
      </motion.div>
   );
};

export default HeroStats;
