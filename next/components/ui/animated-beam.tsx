"use client"

import { useEffect, useId, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedBeamProps {
  containerRef: React.RefObject<HTMLElement>
  fromRef: React.RefObject<HTMLElement>
  toRef: React.RefObject<HTMLElement>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 2,
  delay = 0,
  pathColor = "rgb(99, 102, 241)",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: AnimatedBeamProps) {
  const id = useId()
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updatePath = () => {
      if (!fromRef.current || !toRef.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const fromRect = fromRef.current.getBoundingClientRect()
      const toRect = toRef.current.getBoundingClientRect()

      const startX =
        fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset
      const startY =
        fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset
      const endX =
        toRect.left - containerRect.left + toRect.width / 2 + endXOffset
      const endY =
        toRect.top - containerRect.top + toRect.height / 2 + endYOffset

      const controlX = startX + (endX - startX) / 2
      const controlY = startY + curvature

      const d = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`
      setPathD(d)
      setSvgDimensions({
        width: containerRect.width,
        height: containerRect.height,
      })
    }

    updatePath()

    const resizeObserver = new ResizeObserver(updatePath)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ])

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className="pointer-events-none absolute left-0 top-0 transform-gpu stroke-2"
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <defs>
        <linearGradient
          id={`gradient-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="0%"
          x2="100%"
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="50%" stopColor={gradientStartColor} />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        strokeWidth={pathWidth}
        stroke={`url(#gradient-${id})`}
        strokeOpacity="1"
        strokeLinecap="round"
      >
        <animate
          attributeName="stroke-dasharray"
          from={`0 ${svgDimensions.width * 2}`}
          to={`${svgDimensions.width * 2} 0`}
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
          direction={reverse ? "reverse" : "normal"}
        />
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to={svgDimensions.width * 2}
          dur={`${duration}s`}
          repeatCount="indefinite"
          begin={`${delay}s`}
          direction={reverse ? "reverse" : "normal"}
        />
      </path>
    </svg>
  )
}

