import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';

interface InviteMemberModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ 
  groupId, 
  isOpen, 
  onClose 
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvite = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${/* Get current user's token */ ''}`
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      toast({
        title: 'Invite Sent',
        description: `Invite sent to ${email}. Token: ${data.token}`,
        variant: 'success'
      });

      setEmail('');
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Invite Member"
    >
      <div className="space-y-4">
        <Input 
          label="Member Email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="member@example.com"
        />
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleInvite}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}