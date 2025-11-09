'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Loader2, Sparkles, ArrowRight, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import type { SubscriptionPlan } from '@/lib/types/billing';
import { cn } from '@/lib/utils';

export function PricingSection() {
  const locale = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch('/api/subscription/plans');
        const data = await response.json();

        if (!data || data.length === 0) {
          await fetch('/api/subscription/init-plans', { method: 'POST' });
          const retryResponse = await fetch('/api/subscription/plans');
          const retryData = await retryResponse.json();
          setPlans(retryData);
        } else {
          setPlans(data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Simple, Transparent Pricing</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="block">Choose the perfect plan</span>
            <span className="block text-primary">for your needs</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Scale as you grow with our flexible options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isPro = plan.isPopular;

            return (
              <Card
                key={plan.id}
                className={cn(
                  "p-8 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden",
                  isPro && "border-foreground/20 shadow-lg md:scale-105",
                  "before:absolute before:inset-0 before:bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] before:bg-[size:14px_14px] before:opacity-30 before:z-0",
                  "[&>*]:relative [&>*]:z-10"
                )}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-foreground/20 bg-foreground text-background text-xs font-semibold shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm mb-4">
                      <span className="text-4xl">{plan.emoji}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  <div className="text-center py-4">
                    {plan.amount === 0 ? (
                      <div className="text-4xl font-bold">Free</div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold">${(plan.amount / 100).toFixed(0)}</span>
                        <span className="text-muted-foreground text-lg">/month</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border"></div>

                  <ul className="space-y-3 min-h-[280px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={`/${locale}/billing`} className="block">
                    <Button
                      className={cn(
                        "w-full font-semibold",
                        isPro && "bg-foreground text-background hover:bg-foreground/90"
                      )}
                      variant={isPro ? 'default' : 'outline'}
                      size="lg"
                    >
                      {plan.amount === 0
                        ? 'Get Started'
                        : 'Subscribe Now'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 24/7 support • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </section>
  );
}
