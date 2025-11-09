'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface UsageLimitsBannerProps {
  email?: string;
  agentCount?: number;
}

interface UsageLimits {
  maxAgents: number;
  maxExecutions: number;
  maxApiCalls: number;
  currentAgents: number;
  currentExecutions: number;
  currentApiCalls: number;
  planName: string;
}

const PLAN_LIMITS: Record<string, { maxAgents: number; maxExecutions: number; maxApiCalls: number }> = {
  'Free': { maxAgents: 5, maxExecutions: 100, maxApiCalls: 1000 },
  'Pro': { maxAgents: -1, maxExecutions: 10000, maxApiCalls: 100000 }, // -1 means unlimited
  'Enterprise': { maxAgents: -1, maxExecutions: -1, maxApiCalls: -1 },
};

export function UsageLimitsBanner({ email, agentCount = 0 }: UsageLimitsBannerProps) {
  const locale = useLocale();
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsageAndLimits() {
      console.log('🔍 UsageLimitsBanner - Checking limits for email:', email, 'agentCount:', agentCount);

      if (!email) {
        console.log('❌ UsageLimitsBanner - No email provided');
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
        console.log('📦 UsageLimitsBanner - Stripe API Response:', data);

        const planName = data.currentPlan || 'Free';

        console.log('📊 UsageLimitsBanner - Determined plan:', planName);

        const limits = PLAN_LIMITS[planName] || PLAN_LIMITS['Free'];

        setUsage({
          ...limits,
          planName,
          currentAgents: agentCount,
          currentExecutions: 0, // TODO: Get from actual usage tracking
          currentApiCalls: 0, // TODO: Get from actual usage tracking
        });
      } catch (error) {
        console.error('❌ UsageLimitsBanner - Error fetching usage:', error);
        // Default to Free plan on error
        setUsage({
          ...PLAN_LIMITS['Free'],
          planName: 'Free',
          currentAgents: agentCount,
          currentExecutions: 0,
          currentApiCalls: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUsageAndLimits();
  }, [email, agentCount]);

  if (loading || !usage) return null;

  // Check if user is approaching limits
  const agentLimitReached = usage.maxAgents > 0 && usage.currentAgents >= usage.maxAgents;
  const agentLimitWarning = usage.maxAgents > 0 && usage.currentAgents >= usage.maxAgents * 0.8;

  if (!agentLimitReached && !agentLimitWarning) return null;

  return (
    <Alert className={agentLimitReached ? 'border-red-500 bg-red-50 dark:bg-red-950/20' : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'}>
      <AlertCircle className={agentLimitReached ? 'text-red-500' : 'text-yellow-500'} />
      <AlertDescription className="flex items-center justify-between">
        <div>
          {agentLimitReached ? (
            <span className="font-semibold text-red-700 dark:text-red-400">
              Agent limit reached! You're using {usage.currentAgents} of {usage.maxAgents} agents on the {usage.planName} plan.
            </span>
          ) : (
            <span className="font-semibold text-yellow-700 dark:text-yellow-400">
              You're using {usage.currentAgents} of {usage.maxAgents} agents on the {usage.planName} plan.
            </span>
          )}
        </div>
        <Link href={`/${locale}/billing`}>
          <Button
            size="sm"
            className="bg-gradient-to-r from-yellow-400 to-pink-500 hover:from-yellow-500 hover:to-pink-600 text-white"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}

