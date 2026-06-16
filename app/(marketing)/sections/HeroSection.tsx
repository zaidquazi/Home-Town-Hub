'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Globe2 } from 'lucide-react';
import { InteractiveGlobe } from '@/components/ui/InteractiveGlobe';

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={ref} 
      className="relative min-h-[100dvh] pt-32 pb-20 overflow-hidden flex flex-col items-center justify-center bg-[#0a0a0a]"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <motion.div 
        style={{ y: yText, opacity }} 
        className="relative z-20 container mx-auto px-4 md:px-6 flex flex-col items-center text-center mt-8 md:mt-16"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-8 group cursor-pointer hover:bg-white/[0.05] transition-colors"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
          <span className="text-sm font-medium text-neutral-300">Hometown Hub 2.0 is live</span>
          <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 transition-colors group-hover:translate-x-0.5" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.8, ease: 'easeOut' }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tighter leading-[1.1] max-w-5xl"
        >
          Your Hometown, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400">
            Reconnected.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          className="mt-8 text-lg md:text-xl text-neutral-400 max-w-2xl text-pretty leading-relaxed font-medium"
        >
          The hyperlocal platform where neighbors become friends. Discover events, share updates, and solve local problems — all in one beautifully crafted space.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full sm:w-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-950 font-bold rounded-full text-base hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center justify-center gap-2">
              Start Exploring
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/communities" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-full text-base hover:bg-white/10 backdrop-blur-md transition-colors flex items-center justify-center gap-2">
              <Globe2 className="w-4 h-4" />
              View Communities
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* 3D Interactive Globe Section */}
      <div className="relative w-full max-w-[1200px] mx-auto mt-[-100px] md:mt-[-150px] lg:mt-[-200px] pointer-events-auto z-10 hidden sm:block">
        <InteractiveGlobe />
      </div>
      
      {/* Mobile-only spacer for the globe so it doesn't overlap excessively */}
      <div className="relative w-full mt-[-50px] pointer-events-auto z-10 sm:hidden">
         <InteractiveGlobe />
      </div>
      
      {/* Bottom fade out into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
    </section>
  );
}
