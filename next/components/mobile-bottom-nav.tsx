"use client"

import { useRouter, usePathname } from "next/navigation"
import { useLocale, useTranslations } from 'next-intl'
import { TrendingUp, Store, Compass } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('marketplaceHeader')

  const navItems = [
    {
      id: "trade",
      label: t('trade'),
      href: `/${locale}/trade`,
      icon: TrendingUp,
      gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
      iconColor: "text-blue-500",
    },
    {
      id: "marketplace",
      label: t('marketplace'),
      href: `/${locale}/marketplace`,
      icon: Store,
      gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(126,34,206,0) 100%)",
      iconColor: "text-purple-500",
    },
    {
      id: "explorer",
      label: t('explorer'),
      href: `/${locale}/explorer`,
      icon: Compass,
      gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
      iconColor: "text-green-500",
    },
  ]

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes('/trade')) return 'trade'
    if (pathname.includes('/marketplace')) return 'marketplace'
    if (pathname.includes('/explorer')) return 'explorer'
    return ''
  }

  const activeTab = getActiveTab()

  // Only show on mobile and on specific pages
  const shouldShow = pathname.includes('/trade') ||
    pathname.includes('/marketplace') ||
    pathname.includes('/explorer') ||
    pathname.includes('/position')

  if (!shouldShow) return null

  // Animation variants from @animated-menu/
  const itemVariants = {
    initial: { rotateX: 0, opacity: 1 },
    hover: { rotateX: -90, opacity: 0 },
  }

  const backVariants = {
    initial: { rotateX: 90, opacity: 0 },
    hover: { rotateX: 0, opacity: 1 },
  }

  const glowVariants = {
    initial: { opacity: 0, scale: 0.8 },
    hover: {
      opacity: 1,
      scale: 2,
      transition: {
        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
        scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
      },
    },
  }

  const navGlowVariants = {
    initial: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  const sharedTransition = {
    type: "spring",
    stiffness: 100,
    damping: 20,
    duration: 0.5,
  }

  return (
    <motion.nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none safe-area-bottom"
      initial="initial"
      whileHover="hover"
    >
      <div className="flex items-center justify-center px-4 pb-4 pt-2">
        <motion.div className="pointer-events-auto p-2 rounded-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-lg border border-border/40 shadow-lg relative overflow-hidden">
          <motion.div
            className="absolute -inset-2 bg-gradient-radial from-transparent via-blue-400/30 via-30% via-purple-400/30 via-60% via-green-400/30 via-90% to-transparent rounded-3xl z-0 pointer-events-none"
            variants={navGlowVariants}
          />
          <ul className="flex items-center gap-2 relative z-10">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <motion.li key={item.id} className="relative">
                  <motion.div
                    className="block rounded-xl overflow-visible group relative"
                    style={{ perspective: "600px" }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      variants={glowVariants}
                      style={{
                        background: item.gradient,
                        opacity: isActive ? 1 : 0,
                        borderRadius: "16px",
                      }}
                      animate={isActive ? "hover" : "initial"}
                    />
                    <motion.button
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "flex flex-col items-center gap-1 px-4 py-2 relative z-10 bg-transparent transition-colors rounded-xl",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
                    >
                      <span className={cn(
                        "transition-colors duration-300",
                        isActive && item.iconColor
                      )}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[9px] font-medium">{item.label}</span>
                    </motion.button>
                    <motion.button
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "flex flex-col items-center gap-1 px-4 py-2 absolute inset-0 z-10 bg-transparent transition-colors rounded-xl",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
                    >
                      <span className={cn(
                        "transition-colors duration-300",
                        isActive && item.iconColor
                      )}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-[9px] font-medium">{item.label}</span>
                    </motion.button>
                  </motion.div>
                </motion.li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </motion.nav>
  )
}

