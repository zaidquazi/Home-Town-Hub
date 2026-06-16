'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, FileCheck, KeyRound, EyeOff } from 'lucide-react';

export function SecuritySection() {
  return (
    <section className="py-32 bg-[#0a0a0a] relative overflow-hidden" id="security-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-neutral-900 to-black rounded-[3rem] p-10 md:p-16 lg:p-20 text-center relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="relative z-10"
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-[1.5rem] bg-gradient-to-br from-primary-500/20 to-primary-600/5 border border-primary-500/20 flex items-center justify-center shadow-inner">
              <Lock className="w-10 h-10 text-primary-400" />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Your Privacy. <br className="md:hidden" /> Protected.</h2>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
              We believe your community data belongs to your community. We use enterprise-grade security and strict privacy policies to ensure it stays that way.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'End-to-End Encryption', icon: <EyeOff className="w-6 h-6" /> },
                { label: 'Strict GDPR Compliant', icon: <FileCheck className="w-6 h-6" /> },
                { label: 'Secure Authentication', icon: <KeyRound className="w-6 h-6" /> },
                { label: 'No Data Mining', icon: <Lock className="w-6 h-6" /> },
              ].map((item, i) => (
                <motion.div 
                  key={item.label} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="text-neutral-500 mb-4 bg-white/5 p-4 rounded-2xl border border-white/5">{item.icon}</div>
                  <p className="text-[15px] text-neutral-300 font-bold">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
