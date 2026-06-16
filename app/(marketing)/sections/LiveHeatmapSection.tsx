'use client';

import { motion } from 'framer-motion';

const activities = [
  { user: "Sarah J.", action: "organized a beach cleanup in", location: "San Diego", time: "2m ago" },
  { user: "Michael T.", action: "posted a new job in", location: "Austin Tech Hub", time: "5m ago" },
  { user: "Elena R.", action: "joined the community", location: "Little Italy NYC", time: "12m ago" },
  { user: "David K.", action: "started a discussion in", location: "Seattle Coffee Lovers", time: "18m ago" },
  { user: "Priya M.", action: "shared photos in", location: "London Photographers", time: "24m ago" },
  { user: "James L.", action: "RSVP'd to an event in", location: "Toronto Startups", time: "31m ago" },
  { user: "Anita B.", action: "created a new community:", location: "Berlin Digital Nomads", time: "1h ago" },
];

export function LiveHeatmapSection() {
  return (
    <section className="py-24 bg-[#0a0a0a] border-y border-white/5 overflow-hidden flex flex-col items-center">
      <div className="mb-12 text-center px-4">
        <h3 className="text-xl font-bold text-white tracking-wide uppercase flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Live Global Activity
        </h3>
      </div>

      <div className="relative w-full flex overflow-x-hidden">
        {/* Left/Right Fade Masks */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="flex gap-4 whitespace-nowrap pl-4"
        >
          {[...activities, ...activities, ...activities].map((item, i) => (
            <div 
              key={i} 
              className="inline-flex flex-col gap-2 px-6 py-4 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md min-w-[300px]"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-white">{item.user}</span>
                <span className="text-neutral-500 font-medium text-xs">{item.time}</span>
              </div>
              <div className="text-neutral-400 text-sm">
                {item.action} <span className="text-primary-400 font-semibold">{item.location}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
