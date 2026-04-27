import { iconMap } from "./servicesConstants";

interface ServiceAnimationProps {
   title: string;
   color: string;
}

const ServiceAnimation = ({ title, color }: ServiceAnimationProps) => {
   const IconComponent = iconMap[title] || iconMap._fallback;

   return (
      <IconComponent
         style={{
            width: 40,
            height: 40,
            color,
            opacity: 0.85,
         }}
      />
   );
};

export default ServiceAnimation;
