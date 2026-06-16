'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useEvent, useJoinEvent } from '@/lib/hooks/useEvents';
import { Card, Button, Avatar } from '@/components/ui';
import { MapPin, Calendar, Users, Share2, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store';

export default function EventDetailsPage() {
  const { id } = useParams() as { id: string };
  const { data: event, isLoading } = useEvent(id);
  const joinMutation = useJoinEvent();
  const user = useAuthStore(s => s.user);

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (!event) {
    return <div className="text-center py-12 text-neutral-500">Event not found.</div>;
  }

  const isAttending = event.attendees?.includes(user?._id || '');
  const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <Link href="/events" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Event Details</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" /> Share
        </Button>
      </div>

      <Card variant="default" className="overflow-hidden border-0 shadow-xl dark:shadow-none bg-white dark:bg-[#121214] mb-8">
        <div className="h-64 md:h-80 bg-gradient-to-br from-primary-600/90 to-accent-600/90 relative flex items-center justify-center">
          {event.coverPhoto ? (
            <img src={event.coverPhoto} alt="Cover" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
          ) : (
            <span className="text-6xl opacity-30">📅</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-white/20">
                {event.category || 'General Event'}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm leading-tight">{event.title}</h1>
            </div>
            <Button 
              onClick={() => joinMutation.mutate(event._id)}
              disabled={joinMutation.isPending || (isFull && !isAttending)}
              variant={isAttending ? 'outline' : 'primary'}
              size="lg"
              className={`rounded-xl shadow-lg border-0 font-bold ${isAttending ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 backdrop-blur-md' : 'bg-white text-primary-600 hover:bg-neutral-100'}`}
            >
              {isAttending ? '✓ Attending' : isFull ? 'Event Full' : 'Join Event'}
            </Button>
          </div>
        </div>
        <div className="p-6 md:p-8 relative bg-white dark:bg-[#121214]">
          <h3 className="text-xl font-bold mb-4 tracking-tight">About Event</h3>
          <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap max-w-3xl">
            {event.description}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card variant="glass" className="p-6 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl">
            <h3 className="text-xl font-extrabold mb-5 tracking-tight text-neutral-900 dark:text-white">Time & Location</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-sm font-medium text-neutral-500 mt-0.5">{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                <div className="w-12 h-12 bg-accent-50 dark:bg-accent-900/20 rounded-xl flex items-center justify-center text-accent-600 dark:text-accent-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">Venue</p>
                  <p className="text-sm font-medium text-neutral-500 mt-0.5">{event.venue}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card variant="glass" className="p-6 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl">
            <h3 className="font-extrabold text-lg mb-4 tracking-tight text-neutral-900 dark:text-white">Organizer</h3>
            <Link href={`/profile/${event.organizer?.username}`} className="flex items-center gap-3 p-3 -m-3 hover:bg-neutral-100 dark:hover:bg-neutral-900/50 rounded-xl transition-colors group">
              <Avatar src={event.organizer?.profilePicture || `https://ui-avatars.com/api/?name=${event.organizer?.fullName || 'User'}`} alt="Organizer" size="md" className="ring-2 ring-transparent group-hover:ring-primary-500 transition-all" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{event.organizer?.fullName}</p>
                <p className="text-sm font-medium text-neutral-500">@{event.organizer?.username}</p>
              </div>
            </Link>
          </Card>

          <Card variant="glass" className="p-6 bg-white/60 dark:bg-[#121214]/60 backdrop-blur-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">Attendees</h3>
              <span className="text-sm font-bold bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-400">
                {event.attendees.length} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* @ts-ignore */}
              {event.attendees.slice(0, 8).map((attendee: any, i) => (
                <Link key={i} href={`/profile/${attendee?.username || ''}`}>
                  <Avatar src={attendee?.profilePicture || `https://ui-avatars.com/api/?name=${attendee?.fullName || 'User'}`} alt="Attendee" size="sm" className="hover:scale-110 transition-transform cursor-pointer" />
                </Link>
              ))}
              {event.attendees.length > 8 && (
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500 border border-white dark:border-neutral-950">
                  +{event.attendees.length - 8}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
