import { iconMapById, fallbackIcon } from "./servicesConstants";

interface ServiceAnimationProps {
   id: number;
   color: string;
}

const ServiceAnimation = ({ id, color }: ServiceAnimationProps) => {
   const IconComponent = iconMapById[id] || fallbackIcon;

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
