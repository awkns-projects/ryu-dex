"use client"

import { Button } from "@/components/ui/button"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { LanguageSwitcher } from "@/components/language-switcher"
import { PointsBadge } from "@/components/points-badge"
import { AuthStatus } from "@/components/auth-status"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "@/lib/auth-client"

export function Header() {
  const [open, setOpen] = useState(false)
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [userPoints, setUserPoints] = useState<number>(0)
  const [pointsLoading, setPointsLoading] = useState(true)

  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await fetch('/api/user/points')
        if (response.ok) {
          const data = await response.json()
          setUserPoints(data.points)
        }
      } catch (error) {
        console.error('Failed to fetch user points:', error)
      } finally {
        setPointsLoading(false)
      }
    }

    fetchUserPoints()
  }, [])

  // Check if we're on the home page
  const isHomePage = pathname === `/${locale}` || pathname === `/${locale}/`

  const menuItems = [
    { href: "#templates", label: t('menu.templates'), isAnchor: true },
    { href: "#features", label: t('menu.features'), isAnchor: true },
    { href: "#how-it-works", label: t('menu.howItWorks'), isAnchor: true },
    { href: "#comparison", label: t('menu.comparison'), isAnchor: true },
    { href: "#pricing", label: t('menu.pricing'), isAnchor: true },
    { href: `/${locale}/docs`, label: t('menu.docs'), isAnchor: false },
  ]

  // Add authenticated menu items when user is logged in
  // const authenticatedMenuItems = session ? [
  //   { href: `/${locale}/my-agents`, label: t('menu.myAgents'), isAnchor: false },
  //   { href: `/${locale}/pilot`, label: t('menu.pilot'), isAnchor: false },
  // ] : []

  const allMenuItems = [...menuItems]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Ryu Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-semibold">{t('logo')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {allMenuItems.map((item) => {
            // For anchor links, if not on home page, go to home page with anchor
            const href = item.isAnchor && !isHomePage
              ? `/${locale}${item.href}`
              : item.href;

            return item.isAnchor ? (
              isHomePage ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <PointsBadge points={userPoints} loading={pointsLoading} />
          <LanguageSwitcher />
          <AnimatedThemeToggler className="h-9 w-9 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center" />
          <AuthStatus />
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <PointsBadge points={userPoints} loading={pointsLoading} />
          <AuthStatus />
          <LanguageSwitcher />
          <AnimatedThemeToggler className="h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent transition-colors flex items-center justify-center" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-xl font-semibold mb-6">{t('menuTitle')}</SheetTitle>
              <nav className="flex flex-col gap-4">
                {allMenuItems.map((item) => {
                  // For anchor links, if not on home page, go to home page with anchor
                  const href = item.isAnchor && !isHomePage
                    ? `/${locale}${item.href}`
                    : item.href;

                  return item.isAnchor ? (
                    isHomePage ? (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                      >
                        {item.label}
                      </Link>
                    )
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                  <AuthStatus />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
