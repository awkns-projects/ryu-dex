"use client"

import React from "react"
import { motion } from "motion/react"
import { WarpBackground } from "./warp-background"
import { Card, CardContent } from "./card"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface LoadingProps {
  className?: string
  text?: string
}

export const Loading: React.FC<LoadingProps> = ({
  className,
  text = "Loading"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 2,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={cn("fixed inset-0 flex items-center justify-center", className)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
        transition={{
          duration: 2,
          ease: [0.22, 1, 0.36, 1]
        }}
        className="absolute inset-0"
      >
        <WarpBackground beamsPerSide={4} beamSize={5} beamDuration={2.5} gridColor='grey' perspective={60} beamDelayMax={3} beamDelayMin={0} className="border-none w-full h-full">
          <div />
        </WarpBackground>
      </motion.div>
      <div className="relative z-10 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Ryu Logo"
          width={50}
          height={50}
          className="object-contain"
          priority
        />
      </div>
      {/* <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.7, opacity: 0, y: -40 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.1
        }}
        className="relative z-10"
      >
        <Card className="w-80 border shadow-2xl bg-card/90 backdrop-blur">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3
              }}
              className="text-2xl font-bold text-foreground"
            >
              {text}
            </motion.p>
          </CardContent>
        </Card>
      </motion.div> */}
    </motion.div>
  )
}

