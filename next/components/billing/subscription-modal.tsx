'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { SubscriptionPlan, SubscriptionModalProps } from '@/lib/types/billing';

export function SubscriptionModal({
  isOpen,
  onClose,
  onSubscribe,
  selectedPlan,
  email,
  onEmailClick,
}: SubscriptionModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [canSubscribe, setCanSubscribe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    async function checkSubscription() {
      if (!email) {
        console.log('📧 No email provided to modal');
        setUserEmail('');
        return;
      }

      console.log('📧 Email provided to modal:', email);
      setUserEmail(email);

      try {
        const checkResponse = await fetch('/api/subscription/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const checkData = await checkResponse.json();

        if (checkData.hasSubscription && selectedPlan.name !== 'Black') {
          const currentPlanAmount = checkData.subscription.amount || 0;
          const selectedPlanAmount = selectedPlan.amount;
          setCanSubscribe(selectedPlanAmount > currentPlanAmount);
        } else {
          setCanSubscribe(true);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setCanSubscribe(true);
      }
    }

    checkSubscription();
  }, [email, selectedPlan]);

  const handleSubscribe = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await onSubscribe();
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold">
            <span className="mr-2 text-3xl">{selectedPlan.emoji}</span>
            Subscribe to {selectedPlan.name}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="text-center">
            <p className="text-3xl font-bold">{selectedPlan.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedPlan.description}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-lg font-semibold">What's included:</p>
            <ul className="space-y-3">
              {selectedPlan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {userEmail && (
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">Subscribing as:</p>
              <p className="font-medium">{userEmail}</p>
            </div>
          )}

          <div className="flex items-center mt-4 space-x-2">
            <Checkbox
              id="autoRenew"
              checked={autoRenew}
              onCheckedChange={(checked: boolean) => setAutoRenew(checked)}
              disabled={true}
            />
            <label
              htmlFor="autoRenew"
              className="text-sm text-muted-foreground cursor-default"
            >
              Auto-renew subscription monthly
            </label>
          </div>

          {selectedPlan?.isInviteOnly && !isCodeVerified && (
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium mb-1">
                Enter invite code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="Enter your invite code"
                />
                <button
                  onClick={() => {/* Implement invite code verification */ }}
                  disabled={isVerifying || !inviteCode}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          {!userEmail ? (
            <Button
              onClick={onEmailClick}
              className="w-full sm:w-auto"
            >
              Sign in to subscribe
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              className="w-full sm:w-auto"
              disabled={
                !canSubscribe ||
                isLoading ||
                (selectedPlan?.isInviteOnly && !isCodeVerified)
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : selectedPlan?.isInviteOnly && !isCodeVerified ? (
                'Verify code first'
              ) : canSubscribe ? (
                'Continue to payment'
              ) : (
                'Already subscribed'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

