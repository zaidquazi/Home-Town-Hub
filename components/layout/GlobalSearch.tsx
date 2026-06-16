'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Users, Calendar, MessageSquare, X } from 'lucide-react';
import { useGlobalSearch } from '@/lib/hooks/useSearch';
import { useDebounce } from 'use-debounce';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useGlobalSearch(debouncedQuery);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResults = data ? (data.users.length + data.communities.length + data.posts.length + data.events.length) : 0;

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="block w-full pl-10 pr-10 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-2xl leading-5 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 sm:text-sm transition-all shadow-sm"
          placeholder="Search Hometown Hub..."
        />
        {query && (
          <button 
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-50 max-h-[80vh] flex flex-col"
          >
            <div className="p-2 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-8 text-neutral-500">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Searching globally...
                </div>
              ) : totalResults === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Users */}
                  {(data?.users?.length || 0) > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-3 h-3" /> People
                      </h3>
                      {data?.users?.map(user => (
                        <Link key={user._id} href={`/profile/${user.username}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                          <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt={user.fullName} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">{user.fullName}</p>
                            <p className="text-xs text-neutral-500">@{user.username}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Communities */}
                  {(data?.communities?.length || 0) > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-3 h-3" /> Communities
                      </h3>
                      {data?.communities?.map(community => (
                        <Link key={community._id} href={`/communities/${community.slug}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden">
                            <img src={community.coverPhoto || `https://ui-avatars.com/api/?name=${community.name}&background=random`} alt={community.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">{community.name}</p>
                            <p className="text-xs text-neutral-500">{community.memberCount} members</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Events */}
                  {(data?.events?.length || 0) > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Events
                      </h3>
                      {data?.events?.map(event => (
                        <Link key={event._id} href={`/events/${event._id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center text-primary-500">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white line-clamp-1">{event.title}</p>
                            <p className="text-xs text-neutral-500 line-clamp-1">{event.venue}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {/* Posts */}
                  {(data?.posts?.length || 0) > 0 && (
                    <div>
                      <h3 className="px-3 py-2 text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Posts
                      </h3>
                      {data?.posts?.map(post => (
                        <Link key={post._id} href={`/feed`} onClick={() => setIsOpen(false)} className="block px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors">
                          <p className="text-sm text-neutral-900 dark:text-white line-clamp-2">{post.content}</p>
                          <p className="text-xs text-neutral-500 mt-1">By {(post.authorId as any)?.fullName || 'User'}</p>
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
            {totalResults > 0 && (
              <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-center">
                <Link href={`/search?q=${query}`} onClick={() => setIsOpen(false)} className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer">
                  See all {totalResults} results
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
