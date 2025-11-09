"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLocale } from "next-intl"
import { useSession } from "@/lib/auth-client"

interface BackToMyAgentsButtonProps {
  className?: string
}

export function BackToMyAgentsButton({
  className = ""
}: BackToMyAgentsButtonProps) {
  const locale = useLocale()
  const { data: session } = useSession()

  // Only show if user is logged in
  if (!session) {
    return null
  }

  return (
    <Button
      variant="outline"
      asChild
      className={`bg-background hover:bg-muted border-border/60 ${className}`}
    >
      <Link href={`/${locale}/my-agents`} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Agents</span>
      </Link>
    </Button>
  )
}

