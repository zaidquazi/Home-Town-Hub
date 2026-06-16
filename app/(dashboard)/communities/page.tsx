'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, Button, Input } from '../../../components/ui';
import { Search, MapPin, Users, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCommunities, useJoinCommunity } from '../../../lib/hooks/useCommunities';
import { useAuthStore } from '../../../store';

import Link from 'next/link';

export default function CommunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: communities, isLoading, error } = useCommunities();
  const joinMutation = useJoinCommunity();
  const user = useAuthStore(state => state.user);

  const filteredCommunities = communities?.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="w-full space-y-10 pb-24 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white mb-2">Discover Communities</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Find your people and join local groups in your hometown.</p>
        </div>
        <Link href="/communities/create">
          <Button variant="primary" size="lg" className="shrink-0 rounded-xl shadow-glow w-full md:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Create Community
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Input 
          label=""
          placeholder="Search for communities by name or interest..." 
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
          className="bg-white dark:bg-neutral-900 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-400">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin mb-4" />
            <p className="font-medium">Loading communities...</p>
          </div>
        ) : error ? (
          <div className="col-span-full text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/30">
            <p className="text-red-500 font-medium">Failed to load communities. Please try again.</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
            <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">No communities found</p>
            <p className="text-neutral-500 max-w-sm text-center">We couldn't find any communities matching your search. Why not create one?</p>
          </div>
        ) : (
          filteredCommunities.map((community, index) => {
            const members = community.members || [];
            const isJoined = user ? members.includes(user._id) : false;
            
            return (
              <motion.div key={community._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05, type: 'spring', bounce: 0.2 }}>
                <Card variant="interactive" className="flex flex-col h-full border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none overflow-hidden group/card bg-white dark:bg-[#121214]">
                  <div className="h-40 w-full relative bg-gradient-to-br from-primary-500/20 to-accent-500/20 dark:from-primary-900/40 dark:to-accent-900/40 flex items-center justify-center overflow-hidden">
                    {community.coverPhoto ? (
                      <Image 
                        src={community.coverPhoto} 
                        alt={community.name} 
                        fill
                        className="object-cover group-hover/card:scale-110 transition-transform duration-700 ease-out" 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-5xl group-hover/card:scale-110 transition-transform duration-700">🏙️</span>
                    )}
                    <div className="absolute top-3 left-3 bg-white/80 dark:bg-black/60 backdrop-blur-md text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm text-neutral-900 dark:text-white border border-white/20">
                      {community.category || 'General'}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1 z-10 bg-white dark:bg-[#121214]">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1 group-hover/card:text-primary-600 dark:group-hover/card:text-primary-400 transition-colors">{community.name}</h3>
                    <p className="text-[15px] text-neutral-500 dark:text-neutral-400 mb-5 line-clamp-2 flex-1 leading-relaxed">{community.description}</p>
                    
                    <div className="flex items-center gap-4 text-[13px] font-semibold text-neutral-500 dark:text-neutral-400 mb-6 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                        <span className="truncate">{community.location?.city ? `${community.location.city}, ${community.location.country}` : 'Local'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Users className="w-4 h-4 text-accent-500 shrink-0" />
                        {members.length.toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {isJoined ? (
                        <Link href={`/communities/${community.slug}`} className="w-full block">
                          <Button variant="outline" size="lg" isFullWidth className="rounded-xl w-full group/btn font-bold">
                            Visit Group <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          isFullWidth 
                          className="rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-white"
                          onClick={() => joinMutation.mutate(community._id)}
                          disabled={joinMutation.isPending}
                        >
                          {joinMutation.isPending ? 'Joining...' : 'Join Community'}
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
    </div>
  );
}
