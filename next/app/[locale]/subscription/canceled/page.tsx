'use client';

import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionCanceled() {
  const router = useRouter();

  const handleTryAgain = () => {
    router.push('/billing');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 border rounded-lg shadow-lg text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-4">Subscription Canceled</h1>

        <p className="text-muted-foreground mb-6">
          Your subscription process was canceled. No charges were made to your account.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleTryAgain}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            Try Again
          </button>

          <button
            onClick={handleGoHome}
            className="w-full px-6 py-3 border rounded-md hover:bg-muted transition-colors font-semibold"
          >
            Return to Home
          </button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Need help? Contact our support team.
        </p>
      </div>
    </div>
  );
}

