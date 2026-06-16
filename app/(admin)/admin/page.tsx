'use client';

import React, { useEffect, useState } from 'react';
import { Card, Avatar } from '@/components/ui';
import { Users, Layout, MessageSquare, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.stats?.users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Communities', value: stats?.stats?.communities || 0, icon: Layout, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Posts', value: stats?.stats?.posts || 0, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Events Hosted', value: stats?.stats?.events || 0, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Overview</h1>
        <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium">
          <TrendingUp className="w-4 h-4 text-green-500" /> System is running smoothly
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="p-6 border border-neutral-100 dark:border-neutral-800 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500">{card.label}</p>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Recent Users</h2>
            </div>
            <div className="space-y-4">
              {stats?.recentActivity?.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} size="sm" />
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-white">{user.fullName}</p>
                      <p className="text-xs text-neutral-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-red-900 dark:text-red-100">Action Required</h2>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              There are currently 0 pending reports that require administrator review.
            </p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              View Reports
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
