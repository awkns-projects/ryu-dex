"use client"

import { useState, useEffect } from "react"
import { useInView } from "@/hooks/use-in-view"

export function SocialProof() {
  const testimonials = [
    {
      quote: "I track all my store metrics in one place — it updates while I sleep.",
      author: "Sarah Chen",
      role: "E-commerce Owner",
    },
    {
      quote: "It feels like a co-worker who never misses a task.",
      author: "Marcus Rodriguez",
      role: "Marketing Manager",
    },
    {
      quote: "Finally, automation that feels natural.",
      author: "Emily Watson",
      role: "Data Analyst",
    },
  ]

  const [current, setCurrent] = useState(0)
  const { ref, isInView } = useInView({ threshold: 0.3, triggerOnce: false })

  useEffect(() => {
    if (!isInView) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isInView, testimonials.length])

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 text-balance">Trusted by Builders and Businesses</h2>
          <p className="text-muted-foreground text-lg">
            From solo creators to data-driven teams, thousands use Ryu to keep their world in sync.
          </p>
        </div>

        <div className="relative min-h-[240px]">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${index === current ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <blockquote className="text-2xl font-medium mb-8 text-balance leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="space-y-1">
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${index === current ? "w-8 bg-foreground" : "w-2 bg-border"}`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-12 text-muted-foreground/50">
          {["Shopify", "Instagram", "X", "Binance", "Stripe"].map((logo) => (
            <div key={logo} className="font-semibold text-lg">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
