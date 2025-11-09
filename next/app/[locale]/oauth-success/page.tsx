"use client"

import { useEffect, useState } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function OAuthSuccessPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const provider = searchParams.get('provider')
  const agentId = searchParams.get('agent')
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Get saved return URL from sessionStorage
    const savedReturnUrl = sessionStorage.getItem('oauth_return_url')

    // Extract locale from current pathname
    const locale = pathname.split('/')[1] || 'en'

    // Determine where to redirect
    let targetUrl: string

    if (savedReturnUrl) {
      // Return to exact page user was on (including record detail)
      targetUrl = savedReturnUrl

      // Ensure URL includes locale if it doesn't already
      if (!targetUrl.startsWith('/')) {
        targetUrl = `/${targetUrl}`
      }
      if (!targetUrl.startsWith(`/${locale}/`)) {
        targetUrl = `/${locale}${targetUrl}`
      }
    } else {
      // Fallback: redirect to agent page or my-agents
      targetUrl = agentId ? `/${locale}/agent/${agentId}` : `/${locale}/my-agents`
    }

    console.log('🔄 OAuth success')
    console.log('📍 Saved return URL:', savedReturnUrl)
    console.log('🎯 Target URL:', targetUrl)

    // Redirect after 2 seconds
    const timer = setTimeout(() => {
      setRedirecting(true)

      // Clean up sessionStorage
      sessionStorage.removeItem('oauth_return_url')
      sessionStorage.removeItem('oauth_provider')

      console.log('🚀 Redirecting to:', targetUrl)

      // Redirect back to original page
      window.location.href = targetUrl
    }, 2000)

    return () => clearTimeout(timer)
  }, [provider, agentId, pathname])

  const providerName = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'OAuth'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-950 p-4">
            <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Connected!</h1>
          <p className="text-muted-foreground">
            Successfully connected to {providerName}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{redirecting ? 'Redirecting...' : 'Returning to your page...'}</span>
        </div>

        <p className="text-xs text-muted-foreground">
          You'll be redirected back in a moment
        </p>
      </Card>
    </div>
  )
}

