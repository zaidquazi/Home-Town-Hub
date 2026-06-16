'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCommunity } from '@/lib/hooks/useCommunities';
import { usePendingMembers, useApproveMember, useRejectMember } from '@/lib/hooks/useModeration';
import { useAuthStore } from '@/store';
import { Card, Avatar, Button, Input } from '@/components/ui';
import { ShieldCheck, UserCheck, UserX, Settings, Loader2, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CommunitySettingsPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: community, isLoading: isCommunityLoading, refetch } = useCommunity(slug);
  const { data: pendingMembers, isLoading: isPendingLoading } = usePendingMembers(community?._id);
  
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();

  const [activeTab, setActiveTab] = useState<'pending' | 'rules'>('pending');
  const [newRule, setNewRule] = useState({ title: '', description: '' });
  const [isUpdatingRules, setIsUpdatingRules] = useState(false);

  if (isCommunityLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary-600 animate-spin" /></div>;
  }

  if (!community) {
    return <div className="text-center py-12 text-neutral-500">Community not found.</div>;
  }

  const isMod = community.moderators?.some((id: any) => id === user?._id || id?._id === user?._id) || 
                community.owner === user?._id || community.owner?._id === user?._id ||
                user?.role === 'admin' || user?.role === 'superadmin';

  if (!isMod) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
        <p className="text-neutral-500 text-center max-w-md">You must be a moderator of {community.name} to view this page.</p>
      </div>
    );
  }

  const handleAddRule = async () => {
    if (!newRule.title || !newRule.description) return toast.error('Fill in all fields');
    const updatedRules = [...(community.rules || []), newRule];
    updateRules(updatedRules);
  };

  const handleRemoveRule = async (index: number) => {
    const updatedRules = [...(community.rules || [])];
    updatedRules.splice(index, 1);
    updateRules(updatedRules);
  };

  const updateRules = async (rules: any[]) => {
    setIsUpdatingRules(true);
    try {
      await api.put(`/moderation/communities/${community._id}/rules`, { rules });
      toast.success('Rules updated successfully');
      setNewRule({ title: '', description: '' });
      refetch();
    } catch (error) {
      toast.error('Failed to update rules');
    } finally {
      setIsUpdatingRules(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <Link href={`/communities/${slug}`} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary-600" />
              Community Settings
            </h1>
            <p className="text-sm text-neutral-500">Manage {community.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Nav */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'pending' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            Pending Members
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'rules' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}
          >
            Rules
          </button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {activeTab === 'pending' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Pending Requests</h2>
                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-bold px-3 py-1 rounded-full">
                  {pendingMembers?.length || 0} Pending
                </span>
              </div>

              {isPendingLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div>
              ) : pendingMembers?.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  No pending join requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingMembers?.map((member: any) => (
                    <div key={member._id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-3">
                        <Avatar src={member.profilePicture || `https://ui-avatars.com/api/?name=${member.fullName}`} alt={member.fullName} size="md" />
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white">{member.fullName}</p>
                          <p className="text-xs text-neutral-500">@{member.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => rejectMutation.mutate({ communityId: community._id, userId: member._id })}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                        >
                          <UserX className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveMutation.mutate({ communityId: community._id, userId: member._id })}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'rules' && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Community Rules</h2>
              
              <div className="space-y-4 mb-8">
                {(!community.rules || community.rules.length === 0) && (
                  <p className="text-neutral-500 text-sm text-center py-4 border-2 border-dashed rounded-lg">No rules defined yet.</p>
                )}
                {community.rules?.map((rule: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{idx + 1}. {rule.title}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{rule.description}</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveRule(idx)}
                      disabled={isUpdatingRules}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t dark:border-neutral-800 space-y-4">
                <h3 className="font-bold text-sm">Add New Rule</h3>
                <Input 
                  placeholder="Rule title" 
                  value={newRule.title} 
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })} 
                />
                <Input 
                  placeholder="Rule description" 
                  value={newRule.description} 
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })} 
                />
                <Button onClick={handleAddRule} disabled={isUpdatingRules} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Rule
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
