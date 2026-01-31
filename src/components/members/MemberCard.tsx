import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

interface MemberCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  contribution: number;
  totalContributions: number;
  nextPayday: Date;
}

export function MemberCard({
  name, 
  email, 
  avatarUrl, 
  status, 
  contribution, 
  totalContributions, 
  nextPayday
}: MemberCardProps) {
  return (
    <Card>
      <div className="flex items-center space-x-4 p-4">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt={`${name}'s avatar`} 
              width={48} 
              height={48} 
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-charcoal truncate">{name}</p>
            <Badge 
              variant={status === 'active' ? 'success' : 'warning'}
            >
              {status}
            </Badge>
          </div>
          <p className="text-xs text-charcoal/70 truncate">{email}</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-mono text-charcoal">
            Bi-weekly: ${contribution.toFixed(2)}
          </div>
          <div className="text-xs text-charcoal/70">
            Total: ${totalContributions.toFixed(2)}
          </div>
          <div className="text-xs text-charcoal/70">
            Next Payday: {nextPayday.toLocaleDateString()}
          </div>
        </div>
      </div>
    </Card>
  );
}