'use client';

import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button } from '@/components/ui';
import { Search, MoreVertical, ShieldAlert, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import api from '@/lib/api';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/admin/users?search=${encodeURIComponent(debouncedSearch)}`);
      setUsers(data.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  const toggleStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">User Management</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage platform users, roles, and access.</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full md:w-80 pl-10 pr-3 py-2 border border-neutral-200 dark:border-neutral-800 rounded-xl leading-5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 font-medium border-b border-neutral-200 dark:border-neutral-800">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-600 mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}`} alt={user.fullName} size="sm" />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{user.fullName}</p>
                          <p className="text-xs text-neutral-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => updateRole(user._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-md border-0 bg-opacity-10 cursor-pointer outline-none focus:ring-2 focus:ring-primary-500 ${
                          user.role === 'superadmin' ? 'bg-red-500 text-red-700 dark:text-red-400' :
                          user.role === 'admin' ? 'bg-purple-500 text-purple-700 dark:text-purple-400' :
                          user.role === 'moderator' ? 'bg-blue-500 text-blue-700 dark:text-blue-400' :
                          'bg-neutral-500 text-neutral-700 dark:text-neutral-400'
                        }`}
                        disabled={user.role === 'superadmin'}
                      >
                        <option value="user" className="bg-white text-black">User</option>
                        <option value="moderator" className="bg-white text-black">Moderator</option>
                        <option value="admin" className="bg-white text-black">Admin</option>
                        {user.role === 'superadmin' && <option value="superadmin" className="bg-white text-black">Superadmin</option>}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleStatus(user._id)}
                        disabled={user.role === 'superadmin'}
                        className={user.isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'}
                      >
                        {user.isActive ? 'Suspend' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
