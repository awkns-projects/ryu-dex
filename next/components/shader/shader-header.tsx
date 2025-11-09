"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useTranslations } from 'next-intl'
import { useSession } from "@/lib/auth-client"
import { LanguageSwitcher } from "../language-switcher"
import { PointsBadge } from "../points-badge"

export default function ShaderHeader() {
  const t = useTranslations('shaderHeader')
  const [isScrolled, setIsScrolled] = useState(false)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [pointsLoading, setPointsLoading] = useState(true)
  const { data: session, isPending } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (session?.user) {
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
    } else {
      setPointsLoading(false)
    }
  }, [session])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 transition-all duration-300 ${isScrolled ? "backdrop-blur-md bg-black/20" : ""}`}>
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Logo"
          width={48}
          height={48}
          className="object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        <a
          href="#how-it-works"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          {t('howItWorks')}
        </a>
        <a
          href="#strategies"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('strategies')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="text-white/80 hover:text-white text-sm font-light px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          {t('strategies')}
        </a>
        <div className="ml-2">
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Points Badge (logged in) or Login Button (not logged in) */}
      {session?.user ? (
        <div className="flex items-center">
          <PointsBadge points={userPoints} loading={pointsLoading} />
        </div>
      ) : (
        <div id="gooey-btn" className="relative flex items-center group" style={{ filter: "url(#gooey-filter)" }}>
          <button className="absolute right-0 px-3 py-2.5 rounded-full bg-white text-black font-normal text-sm transition-all duration-300 hover:bg-white/90 cursor-pointer h-10 flex items-center justify-center -translate-x-12 group-hover:-translate-x-22 z-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </button>
          <button className="px-8 py-2.5 rounded-full bg-white text-black font-normal text-sm transition-all duration-300 hover:bg-white/90 cursor-pointer h-10 flex items-center z-10">
            {t('login')}
          </button>
        </div>
      )}
    </header>
  )
}

