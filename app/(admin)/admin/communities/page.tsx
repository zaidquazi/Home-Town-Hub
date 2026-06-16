'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      const { data } = await api.get('/communities');
      setCommunities(data.data.communities);
    } catch (error) {
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.post(`/admin/communities/${id}/${action}`);
      toast.success(`Community ${action}d successfully`);
      fetchCommunities();
    } catch (error) {
      toast.error(`Failed to ${action} community`);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Communities</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
            <tr>
              <th className="p-4 font-medium text-sm text-zinc-500">Name</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Category</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Location</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Status</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {communities.map((c: any) => (
              <tr key={c._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-zinc-500">/{c.slug}</p>
                </td>
                <td className="p-4 text-sm">{c.category}</td>
                <td className="p-4 text-sm">{c.location?.city}, {c.location?.country}</td>
                <td className="p-4">
                  <Badge variant={c.status === 'approved' ? 'success' : c.status === 'rejected' ? 'danger' : 'warning'}>
                    {c.status || 'approved'}
                  </Badge>
                </td>
                <td className="p-4 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleAction(c._id, 'approve')}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAction(c._id, 'reject')} className="text-red-600">Reject</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
