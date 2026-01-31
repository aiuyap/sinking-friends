'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MemberCard } from '@/components/members/MemberCard';
import { InviteMemberModal } from '@/components/members/InviteMemberModal';

export default function GroupMembersPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Mock data - replace with actual data fetching
  const mockMembers = [
    {
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      status: 'active',
      contribution: 100,
      totalContributions: 1200,
      nextPayday: new Date('2024-02-15'),
      avatarUrl: '/path/to/avatar.jpg'
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john@example.com',
      status: 'inactive',
      contribution: 75,
      totalContributions: 900,
      nextPayday: new Date('2024-02-20'),
      avatarUrl: undefined
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Group Members</h1>
        <Button 
          variant="primary" 
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Member
        </Button>
      </div>

      <div className="grid gap-4">
        {mockMembers.map(member => (
          <MemberCard 
            key={member.id}
            name={member.name}
            email={member.email}
            status={member.status as 'active' | 'inactive'}
            contribution={member.contribution}
            totalContributions={member.totalContributions}
            nextPayday={member.nextPayday}
            avatarUrl={member.avatarUrl}
          />
        ))}
      </div>

      <InviteMemberModal 
        groupId={params.id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}