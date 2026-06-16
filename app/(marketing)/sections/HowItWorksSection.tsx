'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const steps = [
  { step: '01', title: 'Find Your Community', description: 'Search by city, village, or neighborhood. Join existing communities or create your own.',
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
    color: 'from-primary-500 to-primary-600' },
  { step: '02', title: 'Connect & Engage', description: 'Share updates, start discussions, participate in polls, and connect with neighbors.',
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    color: 'from-secondary-500 to-secondary-600' },
  { step: '03', title: 'Grow Together', description: 'Organize events, preserve culture, solve problems, and build lasting community bonds.',
    icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>,
    color: 'from-accent-500 to-accent-600' },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-neutral-50 dark:bg-neutral-950" id="how-it-works-section">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-caption font-semibold uppercase tracking-widest text-primary-600 mb-3 block">Simple Process</span>
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-4">How Hometown Hub Works</h2>
          <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">Three simple steps to become part of your local community</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="relative">
              {index < steps.length - 1 && <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-700" />}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow duration-300 relative">
                <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                  <span className={cn('absolute inset-0 bg-gradient-to-br', step.color)} />
                  <span className="relative text-white text-body-sm font-bold">{step.step}</span>
                </span>
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white bg-gradient-to-br', step.color)}>{step.icon}</div>
                <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">{step.title}</h3>
                <p className="text-body text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
