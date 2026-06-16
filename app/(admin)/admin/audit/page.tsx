'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        setLogs(data.data.logs);
      } catch (error) {
        toast.error('Failed to load audit logs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Audit Logs</h1>
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b">
            <tr>
              <th className="p-4 font-medium text-sm text-zinc-500">Time</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Admin</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Action</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Target Type</th>
              <th className="p-4 font-medium text-sm text-zinc-500">Target ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {logs.map((log: any) => (
              <tr key={log._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4 text-xs text-zinc-500">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="p-4 text-sm font-medium">{log.admin?.fullName}</td>
                <td className="p-4 text-sm"><span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-xs">{log.action}</span></td>
                <td className="p-4 text-sm">{log.targetType}</td>
                <td className="p-4 text-sm text-zinc-500 font-mono text-xs">{log.targetId}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">No audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
