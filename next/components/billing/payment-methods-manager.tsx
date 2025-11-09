'use client';

import { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2 } from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface PaymentMethodsFormProps {
  customerId: string;
  onClose: () => void;
}

// Separate form component
const PaymentMethodsForm = ({
  customerId,
  onClose,
}: PaymentMethodsFormProps) => {
  const [paymentMethods, setPaymentMethods] = useState<Array<any>>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [hasSavedBefore, setHasSavedBefore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const stripe = useStripe();
  const elements = useElements();

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment-methods/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });
      const data = await response.json();
      setPaymentMethods(data.paymentMethods);

      if (data.paymentMethods.some((method: any) => method.isDefault)) {
        setHasSavedBefore(true);
      }

      if (data.paymentMethods.length === 1 && !selectedMethodId) {
        setSelectedMethodId(data.paymentMethods[0].id);
      }
      const defaultMethod = data.paymentMethods.find(
        (method: any) => method.isDefault
      );
      if (defaultMethod) {
        setSelectedMethodId(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Handle selecting payment method
  const handleSelectMethod = (methodId: string) => {
    setSelectedMethodId(methodId);
  };

  // Check if card can be deleted
  const canDeleteCard = (methodId: string) => {
    if (!hasSavedBefore) return true;
    if (paymentMethods.length <= 1) return false;
    return true;
  };

  // Delete payment method
  const deletePaymentMethod = async (paymentMethodId: string) => {
    if (!canDeleteCard(paymentMethodId)) {
      alert('You must have at least one payment method saved.');
      return;
    }

    try {
      setDeletingMethodId(paymentMethodId);
      await fetch('/api/payment-methods/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethodId }),
      });

      if (paymentMethodId === selectedMethodId && paymentMethods.length > 1) {
        const otherCard = paymentMethods.find((m) => m.id !== paymentMethodId);
        if (otherCard) setSelectedMethodId(otherCard.id);
      }

      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setDeletingMethodId(null);
    }
  };

  // Save default payment method
  const handleSave = async () => {
    if (!selectedMethodId) {
      alert('Please select a default payment method.');
      return;
    }

    try {
      setIsSaving(true);
      await fetch('/api/payment-methods/set-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, paymentMethodId: selectedMethodId }),
      });
      setHasSavedBefore(true);
      await fetchPaymentMethods();
      onClose();
    } catch (error) {
      console.error('Error saving default payment method:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add new card
  const handleAddCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.error(error);
      return;
    }

    await fetch('/api/payment-methods/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId,
        paymentMethodId: paymentMethod.id,
      }),
    });

    setIsAddingNew(false);
    fetchPaymentMethods();
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="radio"
                    checked={method.id === selectedMethodId}
                    onChange={() => handleSelectMethod(method.id)}
                    className="w-4 h-4"
                  />
                  <div>
                    <div className="font-medium">
                      {method.brand.toUpperCase()} •••• {method.last4}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expires {method.expMonth}/{method.expYear}
                    </div>
                    {method.isDefault && (
                      <span className="text-xs text-green-600 font-medium">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePaymentMethod(method.id)}
                  disabled={
                    !canDeleteCard(method.id) || deletingMethodId === method.id
                  }
                >
                  {deletingMethodId === method.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>

          {/* Add new card button */}
          <Button
            variant="outline"
            onClick={() => setIsAddingNew(true)}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Card
          </Button>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedMethodId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Default'
              )}
            </Button>
          </div>
        </>
      )}

      {/* Add new card modal */}
      {isAddingNew && (
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Card</DialogTitle>
              <DialogDescription>
                Enter your card details to add a new payment method.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCard}>
              <div className="p-4 mb-4 border rounded-md bg-muted">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Card</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface PaymentMethodsManagerProps {
  customerId: string;
  onClose: () => void;
}

export function PaymentMethodsManager({
  customerId,
  onClose,
}: PaymentMethodsManagerProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethodsForm customerId={customerId} onClose={onClose} />
    </Elements>
  );
}

