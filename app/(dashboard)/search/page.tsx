'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGlobalSearch } from '@/lib/hooks/useSearch';
import { Card, Avatar } from '@/components/ui';
import { User, Users, Calendar, MessageSquare, Loader2, Search, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data, isLoading } = useGlobalSearch(query);

  if (!query) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-neutral-500 px-4">
        <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-neutral-400 dark:text-neutral-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-3">Search Hometown Hub</h2>
        <p className="text-center max-w-md text-[15px] leading-relaxed">Type something in the search bar above to find people, communities, events, and posts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="mt-6 text-neutral-500 font-medium">Searching for "{query}"...</p>
      </div>
    );
  }

  const hasResults = data && (data.users.length > 0 || data.communities.length > 0 || data.events.length > 0 || data.posts.length > 0);

  if (!hasResults) {
    return (
      <div className="text-center py-32 px-4">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-3 tracking-tight">No results found</h2>
        <p className="text-neutral-500 text-lg">We couldn't find anything matching "{query}".</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 pb-24 lg:pb-12">
      <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800/50">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Search Results
        </h1>
        <p className="text-neutral-500 mt-2 font-medium text-lg">Showing results for "{query}"</p>
      </div>

      <div className="space-y-12">
        {/* People */}
        {data?.users && data.users.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-neutral-900 dark:text-white tracking-tight">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl"><User className="text-primary-600 dark:text-primary-400 w-5 h-5" /></div> People
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.users.map(user => (
                <Link key={user._id} href={`/profile/${user.username}`}>
                  <Card variant="interactive" className="p-5 flex flex-col gap-4 group/card border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none bg-white dark:bg-[#121214] h-full justify-center">
                    <div className="flex items-center gap-4">
                      <Avatar src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} size="lg" className="ring-2 ring-transparent group-hover/card:ring-primary-500 transition-all shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-[15px] text-neutral-900 dark:text-white truncate group-hover/card:text-primary-600 transition-colors">{user.fullName}</p>
                        <p className="text-[13px] font-medium text-neutral-500 truncate">@{user.username}</p>
                      </div>
                    </div>
                    {user.bio && <p className="text-[13px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">{user.bio}</p>}
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Communities */}
        {data?.communities && data.communities.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-neutral-900 dark:text-white tracking-tight">
              <div className="p-2 bg-accent-50 dark:bg-accent-900/20 rounded-xl"><Users className="text-accent-600 dark:text-accent-400 w-5 h-5" /></div> Communities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.communities.map(community => (
                <Link key={community._id} href={`/communities/${community.slug}`}>
                  <Card variant="interactive" className="p-5 flex gap-5 group/card border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none bg-white dark:bg-[#121214] h-full">
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 shrink-0 overflow-hidden relative shadow-sm">
                      {community.coverPhoto ? (
                        <img src={community.coverPhoto} alt={community.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-neutral-400 bg-neutral-200 dark:bg-neutral-800">
                          {community.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="font-extrabold text-[17px] tracking-tight text-neutral-900 dark:text-white line-clamp-1 group-hover/card:text-primary-600 transition-colors">{community.name}</p>
                      <p className="text-[13px] font-semibold text-neutral-500 mt-0.5">{community.memberCount.toLocaleString()} members</p>
                      <p className="text-[13px] mt-2 text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">{community.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Events */}
        {data?.events && data.events.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-neutral-900 dark:text-white tracking-tight">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><Calendar className="text-emerald-600 dark:text-emerald-400 w-5 h-5" /></div> Events
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.events.map(event => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <Card variant="interactive" className="p-6 border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none bg-white dark:bg-[#121214] h-full flex flex-col justify-between group/card">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-extrabold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">
                          {event.category || 'General'}
                        </span>
                      </div>
                      <h3 className="font-bold text-[17px] text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover/card:text-primary-600 transition-colors leading-snug">{event.title}</h3>
                    </div>
                    <div className="space-y-2 text-[13px] font-semibold text-neutral-500 mt-5 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/50">
                      {event.date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                          <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>
                      )}
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent-500 shrink-0" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        {data?.posts && data.posts.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3 text-neutral-900 dark:text-white tracking-tight">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><MessageSquare className="text-blue-600 dark:text-blue-400 w-5 h-5" /></div> Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.posts.map((post: any) => (
                <Link key={post._id} href={`/posts/${post._id}`}>
                  <Card variant="interactive" className="p-6 border-0 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none bg-white dark:bg-[#121214] h-full group/card">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${post.author?.fullName}`} alt={post.author?.fullName || 'User'} size="sm" className="ring-2 ring-transparent group-hover/card:ring-primary-500 transition-all shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[14px] text-neutral-900 dark:text-white truncate">{post.author?.fullName}</span>
                        <span className="text-[12px] font-medium text-neutral-500 truncate">@{post.author?.username}</span>
                      </div>
                    </div>
                    <p className="text-[15px] text-neutral-700 dark:text-neutral-300 line-clamp-3 leading-relaxed">{post.content}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
