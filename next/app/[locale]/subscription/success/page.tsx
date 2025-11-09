'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    async function verifySession() {
      if (sessionId) {
        try {
          const response = await fetch('/api/subscription/verify-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            throw new Error('Verification failed');
          }

          setStatus('success');
        } catch (error) {
          console.error('Verification error:', error);
          setStatus('error');
        }
      }
    }

    verifySession();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 border rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-primary" />
            <h1 className="text-2xl font-bold mb-4">Verifying payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your subscription.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-500 rounded-full">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Subscription Successful!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for subscribing. Your subscription is now active.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-yellow-500 rounded-full">
              <span className="text-2xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold mb-4">Payment Pending</h1>
            <p className="text-muted-foreground mb-6">
              Your payment is being processed. You'll receive a confirmation email shortly.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}

