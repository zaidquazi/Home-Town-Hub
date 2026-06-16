'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MessageSquare, Calendar, ShieldCheck, MapPin, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  { 
    title: 'Real-Time Community Feed', 
    desc: 'Share updates, polls, and announcements instantly with your local network.', 
    icon: <MessageSquare className="w-6 h-6 text-primary-400" />, 
    span: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-gradient-to-br from-primary-500/10 to-primary-900/10'
  },
  { 
    title: 'Event Organization', 
    desc: 'Host local meetups, cleanups, and cultural festivals.', 
    icon: <Calendar className="w-6 h-6 text-accent-400" />, 
    span: 'col-span-1 lg:col-span-1',
    bg: 'bg-gradient-to-br from-accent-500/10 to-accent-900/10'
  },
  { 
    title: 'Moderated Safely', 
    desc: 'Keep communities secure with robust admin and reporting tools.', 
    icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />, 
    span: 'col-span-1 lg:col-span-1',
    bg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-900/10'
  },
  { 
    title: 'Hyperlocal Discovery', 
    desc: 'Find people and communities exactly where you are from.', 
    icon: <MapPin className="w-6 h-6 text-orange-400" />, 
    span: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-gradient-to-br from-orange-500/10 to-orange-900/10'
  },
  { 
    title: 'AI Connections', 
    desc: 'Smart algorithms match you with locals holding similar interests.', 
    icon: <Sparkles className="w-6 h-6 text-purple-400" />, 
    span: 'col-span-1 md:col-span-2 lg:col-span-2',
    bg: 'bg-gradient-to-br from-purple-500/10 to-purple-900/10'
  },
  { 
    title: 'Growth Analytics', 
    desc: 'Track engagement and see your community blossom over time.', 
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />, 
    span: 'col-span-1 lg:col-span-1',
    bg: 'bg-gradient-to-br from-blue-500/10 to-blue-900/10'
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden" id="features-section">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true, margin: "-100px" }} 
          className="max-w-3xl mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
            Everything you need. <br />
            <span className="text-neutral-500">Nothing you don't.</span>
          </h2>
          <p className="text-xl text-neutral-400 font-medium">
            A premium toolkit designed exclusively for nurturing and scaling vibrant local networks.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.title} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, margin: "-50px" }} 
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }} 
              className={cn(
                'group relative rounded-3xl p-8 overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-colors', 
                feature.span
              )}
            >
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", feature.bg)} />
              
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-neutral-400 font-medium text-[17px] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
