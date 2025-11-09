"use client"

import { use } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { Home, Database, MessageSquare, Calendar, Wrench, ArrowLeft, Settings, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthStatus } from "@/components/auth-status"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function AgentLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ agentId: string; locale: string }>
}) {
  const { agentId } = use(params)
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('header')
  const [open, setOpen] = useState(false)
  const [agentName, setAgentName] = useState<string>("Agent")
  const [agentImage, setAgentImage] = useState<string | null>(null)

  // Fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agent/${agentId}`)
        if (response.ok) {
          const data = await response.json()
          setAgentName(data.agent?.name || "Agent")
          setAgentImage(data.agent?.image || null)
        }
      } catch (error) {
        console.error("Failed to fetch agent:", error)
      }
    }
    fetchAgent()
  }, [agentId])

  // Determine active tab from pathname
  const getActiveTab = () => {
    if (pathname.endsWith("/data")) return "data"
    if (pathname.endsWith("/chat")) return "chat"
    if (pathname.endsWith("/schedule")) return "schedule"
    if (pathname.endsWith("/build")) return "build"
    return "home"
  }

  const activeTab = getActiveTab()

  const tabs = [
    { id: "home", label: "Home", icon: Home, path: "" },
    { id: "data", label: "Data", icon: Database, path: "/data" },
    { id: "chat", label: "Chat", icon: MessageSquare, path: "/chat" },
    { id: "schedule", label: "Schedule", icon: Calendar, path: "/schedule" },
    { id: "build", label: "Build", icon: Wrench, path: "/build" },
  ]

  const navigateToTab = (path: string) => {
    router.push(`/${locale}/agent/${agentId}${path}`)
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Left: Logo & Back Button */}
          <div className="flex items-center gap-4">
            <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="Ryu Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-semibold hidden sm:inline">{t('logo')}</span>
            </Link>

            <div className="h-6 w-px bg-border/40 hidden sm:block" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/my-agents`)}
              className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">My Agents</span>
            </Button>
          </div>

          {/* Center: Agent Info */}
          <div className="hidden md:flex items-center gap-3">
            {agentImage ? (
              <Image
                src={agentImage}
                alt={agentName}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="text-2xl">🤖</div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-foreground">{agentName}</h2>
              {/* <p className="text-xs text-muted-foreground">Active</p> */}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <AnimatedThemeToggler className="h-9 w-9 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center" />
              {/* <Button
                variant="ghost"
                size="sm"
                className="hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Button> */}
              <AuthStatus />
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <AnimatedThemeToggler className="h-9 w-9 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center" />
              <AuthStatus />

              {/* <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetTitle className="text-xl font-semibold mb-6">{t('menuTitle')}</SheetTitle>
                  <nav className="flex flex-col gap-4">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        router.push(`/${locale}/my-agents`)
                        setOpen(false)
                      }}
                      className="justify-start text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <ArrowLeft className="h-5 w-5 mr-3" />
                      My Agents
                    </Button>

                    <Link
                      href={`/${locale}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </Link>

                    <Link
                      href={`/${locale}/templates`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                      </svg>
                      Templates
                    </Link>

                    <Button
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      className="justify-start text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Settings
                    </Button>

                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                      <AuthStatus />
                    </div>
                  </nav>
                </SheetContent>
              </Sheet> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Padding for Header and Tab Bar */}
      <main className="min-h-screen pt-16 pb-32">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Fixed Bottom Tab Bar */}
      <nav className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:px-6">
        <div className="relative flex items-center gap-1 md:gap-2 rounded-full px-4 md:px-6 py-3 bg-background/80 backdrop-blur-lg border border-border/40 shadow-lg">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <motion.button
                key={tab.id}
                onClick={() => navigateToTab(tab.path)}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-3 md:px-4 py-2 z-10",
                  "transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Active background indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-accent rounded-xl"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                <motion.div
                  className="relative z-10"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>

                <span
                  className={cn(
                    "relative z-10 text-[10px] font-medium transition-all duration-200",
                    "hidden sm:inline", // Hide labels on mobile
                  )}
                >
                  {tab.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

