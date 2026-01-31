import React from 'react'
import { cn } from '@/lib/utils'
import { User, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface CoMakerSelectorProps {
  members: Array<{
    id: string
    user: { name?: string; image?: string }
    hasActiveLoans: boolean
    hasActiveCoMakerRole: boolean
  }>
  selectedCoMakerId?: string
  onSelect: (memberId: string) => void
  required?: boolean
  className?: string
}

export function CoMakerSelector({ 
  members, 
  selectedCoMakerId, 
  onSelect, 
  required = false,
  className 
}: CoMakerSelectorProps) {
  const eligibleMembers = members.filter(
    m => !m.hasActiveLoans && !m.hasActiveCoMakerRole
  )

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-charcoal-secondary" />
        <h3 className="font-display text-lg text-charcoal">
          {required ? 'Select Co-Maker (Required)' : 'Select Co-Maker (Optional)'}
        </h3>
      </div>

      {eligibleMembers.length === 0 ? (
        <div className="bg-cream-dim rounded-lg p-6 text-center">
          <User className="w-12 h-12 text-charcoal-muted mx-auto mb-3" />
          <p className="text-charcoal-secondary">
            No eligible co-makers available. All members either have active loans 
            or are already co-makers on other loans.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {eligibleMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member.id)}
              className={cn(
                'flex items-center gap-3 p-4 bg-white border border-black/[0.06] rounded-lg transition-all duration-200 text-left',
                'hover:shadow-md hover:border-sage/30',
                selectedCoMakerId === member.id 
                  ? 'border-sage bg-sage-dim' 
                  : 'hover:-translate-y-0.5'
              )}
            >
              {member.user?.image ? (
                <img 
                  src={member.user.image} 
                  alt={member.user.name} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-white font-semibold">
                  {member.user?.name?.[0] || '?'}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-charcoal truncate">
                    {member.user?.name || 'Unknown'}
                  </p>
                  <Badge variant="default">
                    Eligible
                  </Badge>
                </div>
                {member.hasActiveLoans ? (
                  <Badge variant="warning" className="mt-1">
                    Has Active Loan
                  </Badge>
                ) : member.hasActiveCoMakerRole ? (
                  <Badge variant="warning" className="mt-1">
                    Active Co-Maker
                  </Badge>
                ) : null}
              </div>

              {selectedCoMakerId === member.id && (
                <div className="w-5 h-5 rounded-full bg-sage flex items-center justify-center text-white">
                  <span className="text-sm">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-sage-dim rounded-lg">
        <p className="text-sm text-sage">
          <span className="font-semibold">Co-Maker Rules:</span>
          <br />
          • Co-maker cannot have active loans
          <br />
          • Co-maker blocked from borrowing until this loan is repaid
          <br />
          • Co-maker is jointly responsible for repayment if borrower defaults
        </p>
      </div>
    </div>
  )
}
