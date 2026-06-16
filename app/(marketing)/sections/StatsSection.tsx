'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { formatNumber } from '@/lib/utils';
import { useAppStats } from '@/lib/hooks/useAnalytics';

function AnimatedCounter({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView || value === 0) return;
    
    let isMounted = true;
    const duration = 2000, steps = 60, increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      if (!isMounted) return;
      current += increment;
      if (current >= value) { 
        setCount(value); 
        clearInterval(timer); 
      }
      else setCount(Math.floor(current));
    }, duration / steps);
    
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isInView, value]);

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-2">
        {formatNumber(count)}<span className="text-primary-600">{suffix}</span>
      </div>
      <p className="text-body text-neutral-500">{label}</p>
    </motion.div>
  );
}

export function StatsSection() {
  const { data: stats } = useAppStats();

  return (
    <section className="section-padding bg-white dark:bg-neutral-900 border-y border-neutral-100 dark:border-neutral-800" id="stats-section">
      <div className="container-app">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <AnimatedCounter value={stats?.totalCommunities || 0} label="Active Communities" />
          <AnimatedCounter value={stats?.totalUsers || 0} label="Connected Members" />
          <AnimatedCounter value={stats?.totalEvents || 0} label="Events Hosted" />
          <AnimatedCounter value={stats?.totalPosts || 0} label="Local Discussions" />
        </div>
      </div>
    </section>
  );
}
