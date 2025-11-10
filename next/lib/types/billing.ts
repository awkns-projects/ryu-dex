/**
 * Centralized TypeScript types for billing and subscription system
 * Use these instead of duplicating types in components
 */

export interface SubscriptionPlan {
  id: string;
  name: string;
  emoji: string;
  price: string; // Display format: "$19.99/month" or "Free"
  description: string;
  features: string[];
  stripePriceId: string;
  isPopular: boolean;
  isInviteOnly: boolean;
  amount: number; // Price in cents
  currency?: string;
  orderIndex?: number;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' | 'expired';
  startDate: Date;
  endDate: Date | null;
  cancelDate: Date | null;
  stoppedDate: Date | null;
  active: boolean;
  autoRenew: boolean;
  cancelAtPeriodEnd: boolean;
  upgradeInitiated: boolean;
  upgradeSessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  subscriptionId: string;
  amount: number; // Amount in cents
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  invoiceId?: string;
  invoiceUrl?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InviteCode {
  id: string;
  code: string;
  planId: string;
  userId: string | null;
  isUsed: boolean;
  usedAt: Date | null;
  expiresAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  brand: string; // 'visa', 'mastercard', etc.
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

// API Response Types

export interface CheckSubscriptionResponse {
  hasSubscription: boolean;
  subscription?: {
    planName: string;
    amount: number;
    status: string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
  };
}

export interface CreateCheckoutSessionRequest {
  plan: string; // Stripe price ID
  userId: string;
  currentSubscriptionId?: string;
  isUpgrade?: boolean;
}

export interface CreateCheckoutSessionResponse {
  url?: string;
  error?: string;
}

export interface SubscriptionHistoryItem {
  id: string;
  startDate: string;
  endDate: string | null;
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

// Component Props Types

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  selectedPlan: SubscriptionPlan;
  email: string;
  onEmailClick?: () => void;
}

export interface PaymentMethodsManagerProps {
  customerId: string;
  onClose: () => void;
}

export interface SubscriptionHistoryProps {
  className?: string;
  user: any;
  subscriptionPlans: SubscriptionPlan[];
  onCancel: (subscriptionId: string) => void;
  inline?: boolean;
}

// Email Types

export interface SubscriptionEmailParams {
  to: string;
  name?: string;
  planName: string;
  locale?: 'en' | 'zh-TW';
}

export interface ExpirationReminderParams extends SubscriptionEmailParams {
  expiryDate: string;
}

export interface PaymentFailedEmailParams extends SubscriptionEmailParams {
  amount?: number;
}

export interface SubscriptionCancelledEmailParams extends SubscriptionEmailParams {
  endDate?: string;
}

