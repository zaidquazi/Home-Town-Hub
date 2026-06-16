'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function TimelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.3], [0, 1, 0.2]);
  const opacity2 = useTransform(scrollYProgress, [0.2, 0.4, 0.5], [0.2, 1, 0.2]);
  const opacity3 = useTransform(scrollYProgress, [0.4, 0.6, 0.7], [0.2, 1, 0.2]);
  const opacity4 = useTransform(scrollYProgress, [0.6, 0.8, 1], [0.2, 1, 1]);

  const y1 = useTransform(scrollYProgress, [0, 0.2], [50, 0]);
  const y2 = useTransform(scrollYProgress, [0.2, 0.4], [50, 0]);
  const y3 = useTransform(scrollYProgress, [0.4, 0.6], [50, 0]);
  const y4 = useTransform(scrollYProgress, [0.6, 0.8], [50, 0]);

  return (
    <section ref={containerRef} className="py-40 bg-[#0a0a0a] relative overflow-hidden hidden sm:block">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_50%)]" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 flex flex-col justify-center min-h-[150vh]">
        <div className="sticky top-1/3 space-y-12 md:space-y-16">
          <motion.div style={{ opacity: opacity1, y: y1 }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              We move away for work.
            </h2>
          </motion.div>
          
          <motion.div style={{ opacity: opacity2, y: y2 }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-500 tracking-tight">
              We lose touch with our roots.
            </h2>
          </motion.div>
          
          <motion.div style={{ opacity: opacity3, y: y3 }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-neutral-500 tracking-tight">
              The community slowly fades.
            </h2>
          </motion.div>

          <motion.div style={{ opacity: opacity4, y: y4 }}>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 tracking-tight">
              Hometown Hub brings it back.
            </h2>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
