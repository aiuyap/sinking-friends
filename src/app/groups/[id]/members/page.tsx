'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MemberCard } from '@/components/members/MemberCard';
import { InviteMemberModal } from '@/components/members/InviteMemberModal';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, UserPlus, Users, PhilippinePeso, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ApiMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'ADMIN' | 'MEMBER';
  status: 'active' | 'inactive';
  contribution: number;
  totalContributions: number;
  nextPayday: Date;
  joinedAt: Date;
  missedPayments: number;
  isCurrentUser: boolean;
}

interface ApiStats {
  total: number;
  active: number;
  inactive: number;
  totalContributions: number;
}

interface ApiResponse {
  members: ApiMember[];
  stats: ApiStats;
}

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  contribution: number;
  totalContributions: number;
  nextPayday: Date;
  avatarUrl: string;
}

export default function GroupMembersPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`);

      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }

      const data: ApiResponse = await response.json();

      // Transform API response to match MemberCard props
      const transformedMembers: Member[] = data.members.map((apiMember) => ({
        id: apiMember.id,
        name: apiMember.name,
        email: apiMember.email,
        status: apiMember.status,
        contribution: apiMember.contribution,
        totalContributions: apiMember.totalContributions,
        nextPayday: new Date(apiMember.nextPayday),
        avatarUrl: apiMember.avatarUrl
      }));

      setMembers(transformedMembers);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchMembers();
    }
  }, [groupId, fetchMembers]);

  const filteredMembers = members.filter(member => {
    if (filter === 'all') return true;
    return member.status === filter;
  });

  const displayStats = stats || {
    total: 0,
    active: 0,
    inactive: 0,
    totalContributions: 0
  };

  return (
    <DashboardLayout title="Members">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/groups/${groupId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Group
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-charcoal">Members</h1>
            <p className="text-charcoal-muted">Manage members of this group</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-12 h-12 text-sage mx-auto mb-4 animate-spin" />
              <p className="text-charcoal-muted">Loading members...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="text-center py-12">
            <CardContent>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-display text-xl text-charcoal mb-2">Error Loading Members</h3>
              <p className="text-charcoal-muted mb-4">{error}</p>
              <Button onClick={fetchMembers}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-sage-dim rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-sage" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-muted">Total</p>
                    <p className="font-display text-xl text-charcoal">{displayStats.total}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-muted">Active</p>
                    <p className="font-display text-xl text-charcoal">{displayStats.active}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-muted">Inactive</p>
                    <p className="font-display text-xl text-charcoal">{displayStats.inactive}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-terracotta-dim rounded-lg flex items-center justify-center">
                    <PhilippinePeso className="w-5 h-5 text-terracotta" />
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-muted">Total Pool</p>
                    <p className="font-display text-xl text-charcoal">{formatCurrency(displayStats.totalContributions)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'active', 'inactive'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                filter === filterOption
                  ? 'bg-sage text-white'
                  : 'bg-white text-charcoal-secondary hover:bg-black/[0.03]'
              }`}
            >
              {filterOption}
              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                filter === filterOption
                  ? 'bg-white/20 text-white'
                  : 'bg-black/[0.06] text-charcoal-muted'
              }`}>
                {filterOption === 'all' ? displayStats.total : filterOption === 'active' ? displayStats.active : displayStats.inactive}
              </span>
            </button>
          ))}
        </div>

        {/* Members List */}
        {filteredMembers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-charcoal-muted mx-auto mb-4" />
              <h3 className="font-display text-xl text-charcoal mb-2">No Members Found</h3>
              <p className="text-charcoal-muted mb-6">
                {filter === 'all' 
                  ? 'Invite members to join this group.'
                  : `No ${filter} members in this group.`
                }
              </p>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MemberCard 
                  name={member.name}
                  email={member.email}
                  status={member.status}
                  contribution={member.contribution}
                  totalContributions={member.totalContributions}
                  nextPayday={member.nextPayday}
                  avatarUrl={member.avatarUrl}
                />
              </motion.div>
            ))}
          </div>
        )}
        </>
        )}

        {/* Invite Modal */}
        <InviteMemberModal 
          groupId={groupId}
          isOpen={isInviteModalOpen}
          onClose={() => {
            setIsInviteModalOpen(false);
            fetchMembers();
          }}
        />
      </motion.div>
    </DashboardLayout>
  );
}
