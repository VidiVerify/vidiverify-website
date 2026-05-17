import { useMemo } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { getStatistics, getSiteConfig } from "@data/dataLoader";
import { staggerContainer, fadeInLeft, fadeInRight } from "@utils/animations";
import DevAvatar from "@components/ui/DevAvatar";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import HighlightCard from "./HighlightCard";
import StatCounter from "./StatCounter";
import { useGitHubDownloadCount } from "@/hooks/useGitHubDownloadCount";
import { usePageViewCount } from "@/hooks/usePageViewCount";

const About = () => {
   const { t } = useTranslation();
   const statistics = getStatistics();
   const isMobile = useMediaQuery("(max-width: 768px)");
   const { counter_namespace, gc_code } = getSiteConfig();
   const { count: dlCount } = useGitHubDownloadCount("VidiVerify", "vidiverify-releases");
   const { count: pvCount } = usePageViewCount({ namespace: counter_namespace, gcCode: gc_code });

   const highlights = t("highlights.cards", { returnObjects: true }) as string[];

   const statEntries = useMemo((): [string, string][] => {
      const entries = Object.entries(statistics) as [string, string][];
      return entries.map(([k, v]) => {
         if (k === "downloads" && dlCount !== null) return [k, `${dlCount}+`];
         if (k === "seitenaufrufe" && pvCount !== null) return [k, `${pvCount}+`];
         return [k, v];
      });
   }, [statistics, dlCount, pvCount]);

   return (
      <PageSection id="about" title={t("highlights.title")} subtitle={t("highlights.subtitle")}>
         <div style={{ maxWidth: 1152, margin: "0 auto" }}>
            <motion.div
               style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: isMobile ? 32 : 56,
                  alignItems: "center",
               }}
               variants={staggerContainer}
            >
               {/* Left - Avatar */}
               <motion.div
                  variants={fadeInLeft}
                  style={{ display: "flex", justifyContent: "center" }}
               >
                  <div
                     style={isMobile ? { transform: "scale(0.8)" } : undefined}
                  >
                     <DevAvatar />
                  </div>
               </motion.div>

               {/* Right - Bio */}
               <motion.div variants={fadeInRight}>
                  {/* Highlights */}
                  <div
                     style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                     }}
                  >
                     {highlights.map((text, i) => (
                        <HighlightCard
                           key={i}
                           text={text}
                           index={i}
                           isMobile={isMobile}
                        />
                     ))}
                  </div>
               </motion.div>
            </motion.div>

            {/* Stats Row */}
            <StatCounter statEntries={statEntries} isMobile={isMobile} />
         </div>
      </PageSection>
   );
};

export default About;
