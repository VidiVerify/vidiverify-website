import { useState, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";

interface Props {
   value: string | number;
   duration?: number;
}

const AnimatedCounter = ({ value, duration = 2 }: Props) => {
   const [count, setCount] = useState<number>(0);

   const { ref, inView } = useInView({
      threshold: 0.5,
      triggerOnce: true,
   });

   const { numericValue, suffix } = useMemo(() => {
      const str = String(value);
      let i = 0;
      while (i < str.length && str[i] >= "0" && str[i] <= "9") i++;
      if (i > 0) {
         return {
            numericValue: Number.parseInt(str.slice(0, i), 10),
            suffix: str.slice(i),
         };
      }
      return { numericValue: 0, suffix: str };
   }, [value]);

   useEffect(() => {
      if (!inView) return;

      const startTime = performance.now();
      const durationMs = duration * 1000;
      let raf: number;

      const animate = (currentTime: number) => {
         const elapsed = currentTime - startTime;
         const progress = Math.min(elapsed / durationMs, 1);

         const eased = 1 - Math.pow(1 - progress, 3);
         const current = Math.round(eased * numericValue);

         setCount(current);

         if (progress < 1) {
            raf = requestAnimationFrame(animate);
         }
      };

      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
   }, [inView, numericValue, duration]);

   return (
      <span
         ref={ref}
         style={{ color: "#6aaccc", textShadow: "0 0 18px rgba(106,172,204,0.45)", fontFamily: "inherit" }}
         className="text-3xl font-bold"
      >
         {count}
         {suffix && <span style={{ color: "#4a7da0" }}>{suffix}</span>}
      </span>
   );
};

export default AnimatedCounter;
