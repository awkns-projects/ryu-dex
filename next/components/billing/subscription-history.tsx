'use client';

import { useState, Fragment, useEffect } from 'react';
import {
  User,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentMethodsManager } from './payment-methods-manager';
import type { SubscriptionPlan, SubscriptionHistoryProps } from '@/lib/types/billing';

interface SubscriptionHistory {
  id: string;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  collectionMethod: string;
  plan: {
    name: string;
    price: number;
    currency: string;
    description: string;
  };
  payments: {
    id: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    paymentMethod: string;
    invoiceId?: string;
    createdAt: Date;
    invoiceUrl?: string;
    transactionId?: string;
  }[];
}

interface PaymentMethod {
  brand: string;
  last4: string;
}

export function SubscriptionHistory({
  className,
  user,
  subscriptionPlans,
  onCancel,
  inline = false,
}: SubscriptionHistoryProps) {
  const locale = useLocale();
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResubscribeModalOpen, setIsResubscribeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [defaultMethod, setDefaultMethod] = useState<PaymentMethod | null>(null);
  const router = useRouter();

  // Get current active subscription
  const getCurrentSubscription = () => {
    const now = new Date();
    return history.find((sub) => {
      const startDate = new Date(sub.startDate);
      const endDate = sub.endDate ? new Date(sub.endDate) : null;
      return startDate <= now && (!endDate || endDate >= now) && sub.status === 'active';
    });
  };

  const currentSub = getCurrentSubscription();

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment-methods/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.stripeCustomerId }),
      });
      const data = await response.json();
      const defaultM = data.paymentMethods.find((method: any) => method.isDefault);
      if (defaultM) {
        setDefaultMethod(defaultM);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.stripeCustomerId) {
      fetchPaymentMethods();
    }
  }, [currentSub]);

  // Fetch subscription history
  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscription/get-stripe-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      if (data.subscriptions) {
        setHistory(data.subscriptions);
      }
    } catch (error) {
      console.error('Error fetching subscription history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      if (!currentSub) {
        throw new Error('No active subscription found');
      }

      await onCancel(currentSub.id);

      // Wait and check subscription status
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const response = await fetch('/api/subscription/check-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        const data = await response.json();

        if (data.subscription?.status === 'canceled') {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      await fetchHistory();
    } catch (error) {
      console.error('Cancel subscription error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const dateInfo = currentSub
    ? {
      label: currentSub.status === 'active' ? 'Next Billing Date' : 'Expiration Date',
      value: currentSub.endDate,
    }
    : { label: 'Next Billing Date', value: '-' };

  useEffect(() => {
    if (inline) {
      fetchHistory();
    }
  }, [inline]);

  // Render content directly (inline mode)
  const renderContent = () => (
    <>
      {/* Current subscription info */}
      <div className="p-6 rounded-lg border bg-card shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Member ID</p>
            <p className="font-medium">{user?.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Current Plan
            </p>
            <p className="font-medium">
              {currentSub ? (
                <span
                  className={`px-2 py-1 rounded ${currentSub.status === 'active'
                    ? 'bg-green-500/20 text-green-600'
                    : 'bg-gray-500/20 text-gray-400'
                    }`}
                >
                  {currentSub.plan.name}
                </span>
              ) : (
                <span className="text-muted-foreground">No active plan</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{dateInfo.label}</p>
            <p className="font-medium">
              {currentSub?.status !== 'active'
                ? '-'
                : dateInfo.value instanceof Date
                  ? format(dateInfo.value, 'yyyy-MM-dd')
                  : dateInfo.value}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payment Method</p>
            <div className="font-medium">
              {defaultMethod &&
                `${defaultMethod.brand.toUpperCase()} •••• ${defaultMethod.last4}`}
              <div
                className="text-sm text-blue-500 cursor-pointer hover:underline"
                onClick={() => setShowPaymentManager(true)}
              >
                Manage Payment Methods
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription history table */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((sub) => (
                  <Fragment key={sub.id}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleRow(sub.id)}
                    >
                      <TableCell className="font-medium">
                        {sub.plan.name}
                        <span className="ml-2">
                          {expandedRow === sub.id ? (
                            <ChevronUp className="inline w-4 h-4" />
                          ) : (
                            <ChevronDown className="inline w-4 h-4" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded text-sm ${sub.status === 'active'
                            ? 'bg-green-500/20 text-green-600'
                            : 'bg-gray-500/20 text-gray-400'
                            }`}
                        >
                          {sub.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(sub.startDate), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        {sub.endDate
                          ? format(new Date(sub.endDate), 'yyyy-MM-dd')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${sub.plan.price}
                      </TableCell>
                    </TableRow>
                    {expandedRow === sub.id && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="p-4">
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              {sub.plan.description}
                            </p>
                            <h4 className="text-sm font-semibold">
                              Payment History
                            </h4>
                            <div className="space-y-2">
                              {sub.payments.map((payment) => (
                                <div
                                  key={payment.id}
                                  className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3"
                                >
                                  <div>
                                    <span className="text-muted-foreground">
                                      Date:
                                    </span>
                                    <br />
                                    {format(
                                      new Date(payment.createdAt),
                                      'yyyy-MM-dd HH:mm:ss'
                                    )}
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Invoice:
                                    </span>
                                    <br />
                                    {payment.invoiceId || '-'}
                                  </div>
                                  <div className="flex justify-start sm:justify-end">
                                    {payment.invoiceUrl && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          window.open(
                                            payment.invoiceUrl,
                                            '_blank'
                                          )
                                        }
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Download
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No subscription history
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="p-4 mt-6 rounded-lg bg-muted/30">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            {currentSub?.status === 'active' ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isCancelling}
                    className="w-full sm:w-auto"
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Cancel Subscription?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You'll
                      continue to have access until the end of your billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelSubscription}>
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/${locale}/billing`)}
              >
                Subscribe to a Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // If inline mode, render content directly without modal
  if (inline) {
    return (
      <>
        <div className={className}>
          <h2 className="text-2xl font-bold mb-4">Subscription Management</h2>
          <p className="text-muted-foreground mb-6">
            Manage your subscription and view payment history
          </p>
          {renderContent()}
        </div>

        {/* Payment methods manager modal */}
        {showPaymentManager && user?.stripeCustomerId && (
          <Dialog open={showPaymentManager} onOpenChange={setShowPaymentManager}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Payment Methods</DialogTitle>
                <DialogDescription>
                  Manage your saved payment methods
                </DialogDescription>
              </DialogHeader>
              <PaymentMethodsManager
                customerId={user.stripeCustomerId}
                onClose={() => {
                  setShowPaymentManager(false);
                  fetchPaymentMethods();
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Otherwise, render in modal (legacy mode)
  return (
    <>
      <div className={className}>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchHistory}
            >
              <User className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Subscription Management</DialogTitle>
              <DialogDescription>
                Manage your subscription and view payment history
              </DialogDescription>
            </DialogHeader>
            {renderContent()}
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment methods manager modal */}
      {showPaymentManager && user?.stripeCustomerId && (
        <Dialog open={showPaymentManager} onOpenChange={setShowPaymentManager}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Payment Methods</DialogTitle>
              <DialogDescription>
                Manage your saved payment methods
              </DialogDescription>
            </DialogHeader>
            <PaymentMethodsManager
              customerId={user.stripeCustomerId}
              onClose={() => {
                setShowPaymentManager(false);
                fetchPaymentMethods();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

