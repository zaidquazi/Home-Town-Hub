'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, Button, Input } from '../../../components/ui';
import { Search, MapPin, Calendar as CalendarIcon, Clock, Users, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEvents, useJoinEvent } from '../../../lib/hooks/useEvents';
import { useAuthStore } from '../../../store';
import { useDebounce } from 'use-debounce';
import CreateEventModal from '@/components/events/CreateEventModal';

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'past' | 'my-events'>('upcoming');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: events, isLoading, error } = useEvents(activeFilter, debouncedSearch);
  const joinMutation = useJoinEvent();
  const user = useAuthStore(state => state.user);

  const filteredEvents = events || [];

  return (
    <div className="w-full space-y-10 pb-24 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">Local Events</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Find out what's happening in your hometown this week.</p>
        </div>
        <Button variant="primary" size="lg" className="shrink-0 rounded-xl shadow-glow w-full md:w-auto" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Input 
            label=""
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            className="bg-white dark:bg-neutral-900 shadow-sm"
          />
        </div>
        <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto shadow-inner-soft">
          {['upcoming', 'my-events', 'past'].map((filter) => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter as any)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeFilter === filter ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800/80'}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            Failed to load events.
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No events found matching your criteria.
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const isAttending = user ? event.attendees.includes(user._id) : false;
            // Parse ISO date
            const dateObj = new Date(event.date);
            const month = dateObj.toLocaleString('default', { month: 'short' });
            const day = dateObj.getDate();

            return (
              <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05, type: 'spring', bounce: 0.2 }}>
                <Card variant="interactive" className="overflow-hidden flex flex-col md:flex-row group border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none bg-white dark:bg-[#121214]">
                  <div className="md:w-1/3 h-56 md:h-auto relative overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-900/40 dark:to-accent-900/40">
                    <Image 
                      src={event.coverPhoto || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600'} 
                      alt={event.title} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-md text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-white/20 dark:border-white/10 flex flex-col items-center">
                      <span className="text-[10px] uppercase font-extrabold text-primary-600 dark:text-primary-400 tracking-wider mb-0.5">{month}</span>
                      <span className="text-xl leading-none text-neutral-900 dark:text-white">{day}</span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1 z-10 bg-white dark:bg-[#121214]">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="text-2xl font-bold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{event.title}</h3>
                    </div>
                    <div className="text-[13px] font-bold tracking-wide uppercase text-accent-600 dark:text-accent-500 mb-4">
                      Hosted by Community
                    </div>
                    <p className="text-[15px] text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 flex-1 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-semibold text-neutral-600 dark:text-neutral-300 mb-6 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-500" />
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent-500" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2 text-neutral-500">
                        <Users className="w-4 h-4" />
                        {event.attendees.length} attending
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800/50 mt-auto">
                      {isAttending ? (
                        <Button variant="outline" size="lg" className="rounded-xl border-green-500/50 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/20 w-full sm:w-auto font-bold pointer-events-none">
                          ✓ You're Attending
                        </Button>
                      ) : (
                        <Button 
                          size="lg"
                          className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white w-full sm:w-auto shadow-sm"
                          onClick={() => joinMutation.mutate(event._id)}
                          disabled={joinMutation.isPending}
                        >
                          {joinMutation.isPending ? 'Joining...' : 'RSVP Now'}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
