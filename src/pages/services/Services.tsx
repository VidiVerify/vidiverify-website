import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { staggerContainer } from "@utils/animations";
import useMediaQuery from "@utils/useMediaQuery";
import PageSection from "@components/layout/PageSection";
import ServiceCard from "./ServiceCard";
import type { Service } from "@/types";

const Services = () => {
   const { t } = useTranslation();
   const services = t("features.cards", { returnObjects: true }) as Service[];
   const isMobile = useMediaQuery("(max-width: 768px)");

   return (
      <PageSection id="services" title={t("features.title")} subtitle={t("features.subtitle")}>
         <motion.div
            style={{
               maxWidth: 1152,
               margin: "0 auto",
               display: "grid",
               gap: 14,
               gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            }}
            variants={staggerContainer}
         >
            {services.map((service, i) => (
               <ServiceCard key={service.id} service={service} index={i} />
            ))}
         </motion.div>
      </PageSection>
   );
};

export default Services;
