'use client';

import React from 'react';
import Link from 'next/link';

export function FooterSection() {
  return (
    <footer className="bg-[#0a0a0a] text-neutral-400 border-t border-white/5" id="footer-section">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-8 mb-20">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6">
              <img src="/icon.svg" alt="Hometown Hub Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-white tracking-tight">Hometown Hub</span>
            </div>
            <p className="text-neutral-500 font-medium leading-relaxed mb-8">
              The digital infrastructure for physical communities. Reconnect with your roots, wherever you are.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-neutral-500 hover:text-white transition-colors text-sm font-medium">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-16 w-full lg:w-auto">
            {[
              { title: 'Platform', links: ['Features', 'Communities', 'Events', 'Safety'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map((group) => (
              <div key={group.title}>
                <h4 className="text-white font-bold mb-6">{group.title}</h4>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-neutral-500 hover:text-white transition-colors text-sm font-medium">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-neutral-600 text-sm font-medium">
            © {new Date().getFullYear()} Hometown Hub Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            <span>Designed in California</span>
            <span className="w-1 h-1 bg-neutral-800 rounded-full" />
            <span>Built for the World</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
