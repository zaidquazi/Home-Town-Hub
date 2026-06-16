'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Ban, AlertTriangle, Activity } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ModerationCenter() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFlaggedContent = async () => {
    try {
      const { data } = await api.get('/moderation/flagged');
      setItems(data.data.items);
    } catch (err) {
      toast.error('Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlaggedContent();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/moderation/flagged/${id}/${action}`);
      toast.success(`Content ${action}d successfully`);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          AI Moderation Center
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">Review content flagged by the automated AI safety system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">In Review Queue</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">Auto-Approved (24h)</p>
            <p className="text-2xl font-bold">1,204</p>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-neutral-500">AI Accuracy Rate</p>
            <p className="text-2xl font-bold">98.5%</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-neutral-500 animate-pulse">Loading queue...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold">Queue Empty</h3>
            <p className="text-neutral-500">All caught up! The AI is handling things smoothly.</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/30 rounded-2xl p-5"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      Score: {item.moderation?.riskScore}/100
                    </span>
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Flags: {item.moderation?.reasons?.join(', ')}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-3">
                    Posted by <span className="font-medium text-black dark:text-white">{item.author?.fullName}</span>
                  </p>
                  <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl text-sm border border-neutral-200 dark:border-neutral-800">
                    {item.content}
                  </div>
                </div>
                
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => handleAction(item._id, 'approve')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors font-medium text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(item._id, 'reject')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Ban className="w-4 h-4" />
                    Delete Post
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors font-medium text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Warn User
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
