'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { useCommunities } from '@/lib/hooks/useCommunities';

export function CommunityShowcaseSection() {
  const { data: communities, isLoading } = useCommunities();
  
  const displayCommunities = communities?.filter(c => !c.isPrivate).slice(0, 4) || [];

  return (
    <section className="section-padding bg-white dark:bg-neutral-900" id="community-showcase-section">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-caption font-semibold uppercase tracking-widest text-secondary-600 mb-3 block">Featured Communities</span>
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-4">Discover Thriving Communities</h2>
          <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">From bustling metros to serene villages — every hometown has a story worth sharing</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayCommunities.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No communities found</h3>
            <p className="text-neutral-500 mb-6">Be the first to create a community for your hometown!</p>
            <Link href="/communities">
              <Button>Create a Community</Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayCommunities.map((community, index) => (
              <Link href={`/communities`} key={community._id}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -6 }}
                  className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden cursor-pointer group shadow-card hover:shadow-card-hover transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-36 overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-500 to-accent-500">
                    {(community as any).coverImage && (
                      <img src={(community as any).coverImage} alt={community.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-caption font-medium text-neutral-700">{community.category || 'General'}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🏙️</span>
                      <h3 className="text-body font-semibold text-neutral-900 dark:text-white truncate">{community.name}</h3>
                    </div>
                    <p className="text-body-sm text-neutral-500 line-clamp-2 mb-4 flex-1">{community.description}</p>
                    <div className="flex items-center justify-between text-caption text-neutral-400">
                      <span>{formatNumber(community.members?.length || 0)} members</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {displayCommunities.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
            <Link href="/communities">
              <Button variant="outline" size="lg">Explore All Communities →</Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
