'use client';

import React, { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { motion } from 'framer-motion';

export function InteractiveGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let height = 0;
    
    if (!canvasRef.current) return;

    // Use ResizeObserver for responsive sizing
    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        height = width; // Keep it square
      }
    };
    
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: height * 2,
      phi: 0,
      theta: 0.15,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [0.2, 0.5, 1],
      glowColor: [0.05, 0.1, 0.25],
      markers: [
        // Simulated active hometown communities
        { location: [37.7595, -122.4367], size: 0.08 }, // SF
        { location: [40.7128, -74.006], size: 0.1 },    // NY
        { location: [51.5074, -0.1278], size: 0.07 },   // London
        { location: [35.6762, 139.6503], size: 0.09 },  // Tokyo
        { location: [-33.8688, 151.2093], size: 0.06 }, // Sydney
        { location: [19.4326, -99.1332], size: 0.07 },  // Mexico City
        { location: [-23.5505, -46.6333], size: 0.08 }, // Sao Paulo
        { location: [48.8566, 2.3522], size: 0.06 },    // Paris
        { location: [28.6139, 77.209], size: 0.09 },    // New Delhi
        { location: [1.3521, 103.8198], size: 0.07 },   // Singapore
      ],
      // @ts-ignore - cobe types may be incomplete
      onRender: (state: any) => {
        // Auto-rotation when not interacting
        if (!pointerInteracting.current) {
          phi += 0.003;
        }
        state.phi = phi + r;
        state.width = width * 2;
        state.height = height * 2;
      }
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [r]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="w-full max-w-[800px] aspect-square mx-auto relative flex items-center justify-center cursor-grab active:cursor-grabbing"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent z-10 pointer-events-none rounded-full" />
      
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 200);
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta;
            setR(delta / 100);
          }
        }}
        className="w-full h-full opacity-0 transition-opacity duration-1000 ease-in-out block"
      />
    </motion.div>
  );
}
