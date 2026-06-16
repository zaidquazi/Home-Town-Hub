'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEvents } from '@/lib/hooks/useEvents';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui';

export function EventsShowcaseSection() {
  const { data: events, isLoading } = useEvents();
  
  const displayEvents = events?.slice(0, 4) || [];

  return (
    <section className="section-padding bg-neutral-50 dark:bg-neutral-950" id="events-section">
      <div className="container-app">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-caption font-semibold uppercase tracking-widest text-accent-600 mb-3 block">Local Events</span>
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-4">Events Happening Near You</h2>
          <p className="text-body-lg text-neutral-500 max-w-2xl mx-auto">From cultural festivals to weekend meetups — find events that bring your community together</p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No events scheduled</h3>
            <p className="text-neutral-500 mb-6">Take the initiative and organize the next local gathering!</p>
            <Link href="/events">
              <Button>Host an Event</Button>
            </Link>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {displayEvents.map((event, index) => (
              <motion.div key={event._id} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                className="min-w-[300px] sm:min-w-[340px] snap-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-2xl flex-shrink-0">🗓️</div>
                  <div className="min-w-0">
                    <h3 className="text-body font-semibold text-neutral-900 dark:text-white mb-1 truncate">{event.title}</h3>
                    <p className="text-body-sm text-primary-600 font-medium mb-1">{format(new Date(event.date), 'MMM d, yyyy')}</p>
                    <p className="text-caption text-neutral-500 truncate">{event.venue}</p>
                    <p className="text-caption text-secondary-600 mt-2">{event.attendees?.length || 0} attending</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
