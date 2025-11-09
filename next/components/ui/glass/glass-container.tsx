"use client"

import { cn } from "@/lib/utils"
import type React from "react"

interface GlassContainerProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "card" | "header" | "tab-bar"
}

export function GlassContainer({
  children,
  className,
  variant = "default"
}: GlassContainerProps) {
  const variants = {
    default: "glass-effect",
    card: "glass-effect rounded-3xl p-6",
    header: "glass-effect border-b border-border/50",
    "tab-bar": "glass-effect rounded-full shadow-lg shadow-black/10",
  }

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  )
}

