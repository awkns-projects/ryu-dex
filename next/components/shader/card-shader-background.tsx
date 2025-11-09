"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import Image from "next/image"

interface CardShaderBackgroundProps {
  children: React.ReactNode
  className?: string
  agentName?: string
  agentAvatar?: string
  showAgentInfo?: boolean
}

export default function CardShaderBackground({
  children,
  className = "",
  agentName,
  agentAvatar,
  showAgentInfo = false
}: CardShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative bg-black overflow-hidden ${className}`}>
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect-card" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter-card" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <div className="absolute inset-0 w-full h-full">
        <MeshGradient
          className="absolute inset-0 w-full h-full"
          colors={["#000000", "#8b5cf6", "#ffffff", "#1e1b4b", "#4c1d95"]}
          speed={0.3}
        />
        <MeshGradient
          className="absolute inset-0 w-full h-full opacity-60"
          colors={["#000000", "#ffffff", "#8b5cf6", "#000000"]}
          speed={0.2}
        />
      </div>

      <div className="relative z-10">
        {showAgentInfo && agentName ? (
          <div className="flex items-stretch gap-4">
            {/* Agent Info - Left Side */}
            <div className="flex flex-col items-center justify-center px-4 py-6 min-w-[140px]">
              {agentAvatar ? (
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-white/20 shadow-lg mb-3">
                  <Image
                    src={agentAvatar}
                    alt={agentName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 ring-2 ring-white/20 shadow-lg flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              )}
              <div className="text-center">
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-[0.15em] mb-1">
                  AI Agent
                </div>
                <div className="text-xs font-bold text-white leading-tight">
                  {agentName}
                </div>
              </div>
            </div>

            {/* Main Content - Right Side */}
            <div className="flex-1">
              {children}
            </div>
          </div>
        ) : (
          <div>
            {children}
          </div>
        )}
      </div>
    </div>
  )
}


