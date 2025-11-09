"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useInView } from "@/hooks/use-in-view"
import { Canvas, useFrame } from '@react-three/fiber'
import { CycleRaycast, BakeShadows, useCursor, Text } from '@react-three/drei'
import { useTranslations, useLocale } from 'next-intl'
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

function Stair({ stepIndex, thinkingStep, onCardClick, ...props }: any) {
  const ref = useRef<any>()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  useFrame((state) => {
    if (ref.current) {
      const targetScale = hovered ? 1.6 : 1
      ref.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1)
    }
  })
  // Sets document.body.style.cursor: useCursor(flag, onPointerOver = 'pointer', onPointerOut = 'auto')
  useCursor(hovered)

  return (
    <group {...props} ref={ref}>
      {/* Card Background */}
      <mesh
        onClick={(e) => (e.stopPropagation(), setClicked(!clicked), onCardClick(stepIndex))}
        onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
        onPointerOut={(e) => setHovered(false)}>
        <boxGeometry args={[2, 6, 0.075]} />
        <meshStandardMaterial
          roughness={0.3}
          metalness={0.2}
          transparent
          opacity={hovered ? 0.95 : 0.75}
          color={clicked ? '#93c5fd' : hovered ? '#6ee7b7' : '#e0e0e0'}
          depthWrite={false}
        />
      </mesh>

      {/* AI Thinking Step Title */}
      <Text
        position={[0, 1.5, 0.2]}
        rotation={[0, 0, -Math.PI / 2]}
        fontSize={0.18}
        color={clicked ? '#ffffff' : hovered ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
        outlineWidth={0.005}
        outlineColor={clicked ? '#000000' : hovered ? '#000000' : '#ffffff'}
        fillOpacity={1}
        depthOffset={-1}>
        {thinkingStep.cardTitle}
      </Text>

      {/* AI Thinking Step Description */}
      <Text
        position={[0, -0.5, 0.15]}
        rotation={[0, 0, -Math.PI / 2]}
        fontSize={0.09}
        color={clicked ? '#e5e7eb' : hovered ? '#f3f4f6' : '#1f2937'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.7}
        textAlign="center"
        outlineWidth={0.003}
        outlineColor={clicked ? '#000000' : hovered ? '#000000' : '#ffffff'}
        fillOpacity={1}
        depthOffset={-1}>
        {thinkingStep.description}
      </Text>
    </group>
  )
}

function Stage() {
  return (
    <>
      {/* Fill */}
      <ambientLight intensity={0.5} />
      {/* Main */}
      <directionalLight
        position={[1, 10, -2]}
        intensity={1}
        shadow-camera-far={70}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-mapSize={[512, 512]}
        castShadow
      />
      {/* Strip */}
      <directionalLight position={[-10, -10, 2]} intensity={3} />
      {/* Ground */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
      {/* This freezes the shadow map, which is fast, but the model has to be static  */}
      <BakeShadows />
    </>
  )
}

export function Hero() {
  const t = useTranslations('hero')
  const locale = useLocale()
  const [currentCase, setCurrentCase] = useState(0)
  const { ref, isInView } = useInView({ threshold: 0.3, triggerOnce: false })
  const [{ objects, cycle }, set] = useState<{ objects: any[], cycle: number }>({ objects: [], cycle: 0 })
  const [selectedCase, setSelectedCase] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const aiThinkingSteps = [
    {
      cardTitle: t('aiThinkingSteps.step1'),
      description: t('aiThinkingSteps.step1Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step2'),
      description: t('aiThinkingSteps.step2Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step3'),
      description: t('aiThinkingSteps.step3Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step4'),
      description: t('aiThinkingSteps.step4Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step5'),
      description: t('aiThinkingSteps.step5Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step6'),
      description: t('aiThinkingSteps.step6Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step7'),
      description: t('aiThinkingSteps.step7Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step8'),
      description: t('aiThinkingSteps.step8Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step9'),
      description: t('aiThinkingSteps.step9Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step10'),
      description: t('aiThinkingSteps.step10Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step11'),
      description: t('aiThinkingSteps.step11Desc')
    },
    {
      cardTitle: t('aiThinkingSteps.step12'),
      description: t('aiThinkingSteps.step12Desc')
    }
  ]

  useEffect(() => {
    if (!isInView) return

    const interval = setInterval(() => {
      setCurrentCase((prev) => (prev + 1) % aiThinkingSteps.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isInView, aiThinkingSteps.length])

  const handleCardClick = (index: number) => {
    setSelectedCase(index)
    setModalOpen(true)
  }

  return (
    <>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedCase !== null && aiThinkingSteps[selectedCase]?.cardTitle}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {selectedCase !== null && aiThinkingSteps[selectedCase]?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                  {t('modal.keyFeatures')}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('modal.feature1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('modal.feature2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{t('modal.feature3')}</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => {
                    setModalOpen(false)
                    document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  {t('viewTemplates')}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  asChild
                >
                  <Link href={`/${locale}/pilot`}>
                    {t('getStarted')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,rgb(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_60%,transparent_100%)] opacity-35" />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--primary))_0%,transparent_70%)] opacity-[0.03]" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-24 items-center">
              {/* Left side - Content */}
              <div className="space-y-8 lg:order-1 order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-muted/50 backdrop-blur-sm text-xs font-medium shadow-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  <span className="text-muted-foreground">{t('badge')}</span>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-balance">
                  <span className="block text-foreground">{t('title.line1')}</span>
                  <span className="block text-foreground">{t('title.line2')}</span>
                </h1>

                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl text-pretty">
                  {t('description')}
                </p>

                {/* Desktop buttons - hidden on mobile */}
                <div className="hidden lg:flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4">
                  <Button
                    size="lg"
                    className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                    asChild
                  >
                    <Link href={`/${locale}/templates`}>
                      {t('getStarted')}
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 bg-transparent hover:bg-muted/50 transition-all w-full sm:w-auto"
                    asChild
                  >
                    <a href="#templates">
                      {t('viewTemplates')}
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right side - 3D Visualization */}
              <div className="relative w-full lg:order-2 order-2">
                {/* CycleRaycast's status data turned into informative HTML */}
                {/* <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full shadow-xl max-w-[90%] sm:max-w-none">
                {objects.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0"
                    style={{ background: i === cycle ? '#70ffd0' : '#ccc' }}
                  />
                ))}
                {objects.length > 0 && (
                  <div
                    className="text-xs font-semibold ml-2 transition-all duration-300 truncate"
                    children={objects[cycle]?.object?.name}
                  />
                )}
              </div> */}

                <div className="flex justify-center relative w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-[4/3] max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={"/images/diamond-hands.gif"}
                    alt="Hero Image"
                    width={300}
                    height={400}
                    className="rounded-xl"
                    priority
                  />
                </div>
              </div>

              {/* Mobile buttons - shown below visual on mobile, hidden on desktop */}
              <div className="lg:hidden flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:order-3 order-3">
                <Button
                  size="lg"
                  className="bg-foreground text-background hover:bg-foreground/90 h-12 px-8 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  asChild
                >
                  <Link href={`/${locale}/templates`}>
                    {t('getStarted')}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 bg-transparent hover:bg-muted/50 transition-all w-full sm:w-auto"
                  asChild
                >
                  <a href="#templates">
                    {t('viewTemplates')}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
