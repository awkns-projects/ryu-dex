'use client';

import { useEffect, useState } from 'react';
import { Crown, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface SubscriptionBadgeProps {
  userId?: string;
  email?: string;
  compact?: boolean;
}

export function SubscriptionBadge({ userId, email, compact = false }: SubscriptionBadgeProps) {
  const locale = useLocale();
  const [currentPlan, setCurrentPlan] = useState<string>('Free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      console.log('🔍 SubscriptionBadge - Checking subscription for email:', email);

      if (!email) {
        console.log('❌ SubscriptionBadge - No email provided, defaulting to Free');
        setCurrentPlan('Free');
        setLoading(false);
        return;
      }

      try {
        // Fetch directly from Stripe (same as billing page)
        const response = await fetch('/api/subscription/get-stripe-subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        console.log('📦 SubscriptionBadge - Stripe API Response:', data);

        // Check if there's an active subscription
        if (data.currentPlan && data.currentPlan !== 'Free') {
          console.log('✅ SubscriptionBadge - Active subscription found:', data.currentPlan);
          setCurrentPlan(data.currentPlan);
        } else {
          console.log('⚠️ SubscriptionBadge - No active subscription, defaulting to Free');
          setCurrentPlan('Free');
        }
      } catch (error) {
        console.error('❌ SubscriptionBadge - Error checking subscription:', error);
        setCurrentPlan('Free');
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, [email]);

  if (loading) {
    return (
      <div className="px-3 py-1 rounded-full bg-muted text-xs animate-pulse">
        Loading...
      </div>
    );
  }

  const getPlanIcon = () => {
    switch (currentPlan) {
      case 'Pro':
        return <Zap className="w-3 h-3" />;
      case 'Enterprise':
        return <Crown className="w-3 h-3" />;
      default:
        return <Sparkles className="w-3 h-3" />;
    }
  };

  const getPlanColor = () => {
    switch (currentPlan) {
      case 'Pro':
        return 'bg-gradient-to-r from-yellow-400 to-pink-500 text-white';
      case 'Enterprise':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <Link href={`/${locale}/billing`}>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getPlanColor()}`}>
          {getPlanIcon()}
          {currentPlan}
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/billing`}>
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity ${getPlanColor()}`}>
        {getPlanIcon()}
        <div>
          <div>{currentPlan} Plan</div>
          {currentPlan === 'Free' && (
            <div className="text-xs opacity-80">Upgrade for more features</div>
          )}
        </div>
      </div>
    </Link>
  );
}

