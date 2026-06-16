'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/admin/reports');
      setReports(data.data.reports);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/reports/${id}/resolve`, { status, actionTaken: 'Reviewed by admin' });
      toast.success(`Report marked as ${status}`);
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Abuse Reports & Disputes</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
            <tr>
              <th className="p-4 font-medium text-sm text-zinc-500">Target</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Reason</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Reporter</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Status</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {reports.map((r: any) => (
              <tr key={r._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4 text-sm font-medium">{r.targetType}</td>
                <td className="p-4 text-sm">{r.reason}</td>
                <td className="p-4 text-sm">{r.reporter?.fullName}</td>
                <td className="p-4">
                  <Badge variant={r.status === 'resolved' ? 'success' : r.status === 'dismissed' ? 'neutral' : 'warning'}>
                    {r.status}
                  </Badge>
                </td>
                <td className="p-4 space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleResolve(r._id, 'resolved')}>Resolve</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleResolve(r._id, 'dismissed')} className="text-zinc-600">Dismiss</Button>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">No reports found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
