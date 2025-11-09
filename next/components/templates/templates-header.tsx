"use client"

import { Button } from "@/components/ui/button"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthStatus } from "@/components/auth-status"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSession } from "@/lib/auth-client"

interface TemplatesHeaderProps {
  activeFiltersCount?: number
  onClearFilters?: () => void
  scrolled?: boolean
  pageTitle?: string
}

export function TemplatesHeader({
  activeFiltersCount = 0,
  onClearFilters,
  scrolled = false,
  pageTitle = "Templates"
}: TemplatesHeaderProps) {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const t = useTranslations('header')
  const locale = useLocale()
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        "border-b",
        isScrolled
          ? "bg-background/95 backdrop-blur-xl border-border/60 shadow-lg"
          : "bg-background/80 backdrop-blur-lg border-border/40"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
        {/* Left: Logo & Back Link */}
        <div className="flex items-center gap-6">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="Ryu Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-xl font-semibold">{t('logo')}</span>
          </Link>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>

        {/* Center: Navigation Menu */}
        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              pathname === `/${locale}`
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={`/${locale}`}>
              Home
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              pathname === `/${locale}/templates`
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={`/${locale}/templates`}>
              Templates
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              pathname === `/${locale}/my-agents`
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={`/${locale}/my-agents`}>
              My Agents
            </Link>
          </Button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <AnimatedThemeToggler className="h-9 w-9 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center" />
            <AuthStatus />
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <AnimatedThemeToggler className="h-9 w-9 rounded-lg bg-background hover:bg-accent transition-colors flex items-center justify-center" />
            {/* <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="text-xl font-semibold mb-6">Menu</SheetTitle>
                <nav className="flex flex-col gap-4">
                  <Link
                    href={`/${locale}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-lg font-medium transition-colors py-2",
                      pathname === `/${locale}`
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>

                  <Link
                    href={`/${locale}/templates`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-lg font-medium transition-colors py-2",
                      pathname === `/${locale}/templates`
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                    </svg>
                    Templates
                  </Link>

                  <Link
                    href={`/${locale}/my-agents`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 text-lg font-medium transition-colors py-2",
                      pathname === `/${locale}/my-agents`
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                    My Agents
                  </Link>

                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                    <AuthStatus />
                  </div>
                </nav>
              </SheetContent>
            </Sheet> */}
            <AuthStatus />

          </div>
        </div>
      </div>
    </header>
  )
}

