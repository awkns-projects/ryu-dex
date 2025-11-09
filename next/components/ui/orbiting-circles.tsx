"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface OrbitingCirclesProps {
  children: React.ReactNode
  iconSize?: number
  radius?: number
  reverse?: boolean
  speed?: number
  className?: string
}

export function OrbitingCircles({
  children,
  iconSize = 40,
  radius = 150,
  reverse = false,
  speed = 1,
  className,
}: OrbitingCirclesProps) {
  const childrenArray = React.Children.toArray(children)
  const count = childrenArray.length

  return (
    <>
      {childrenArray.map((child, index) => {
        const delay = (index / count) * (20 / speed)
        const angle = (360 / count) * index

        return (
          <div
            key={index}
            className={cn(
              "absolute flex items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
              className
            )}
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              animation: `orbit ${20 / speed}s linear infinite`,
              animationDelay: `-${delay}s`,
              animationDirection: reverse ? "reverse" : "normal",
              transformOrigin: `${radius}px center`,
              transform: `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`,
            }}
          >
            <div className="scale-75">{child}</div>
          </div>
        )
      })}
      <style jsx>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(${radius}px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(${radius}px) rotate(-360deg);
          }
        }
      `}</style>
    </>
  )
}

