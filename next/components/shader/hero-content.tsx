"use client"

import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'

export default function HeroContent() {
  const t = useTranslations('shaderHero')
  const locale = useLocale()
  const router = useRouter()

  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
      <div className="text-left">
        <div
          className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm mb-6 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-sm font-light relative z-10">🤖 {t('badge')}</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl md:leading-tight tracking-tight font-light text-white mb-6">
          <span className="font-medium italic instrument">{t('title.intelligent')}</span> {t('title.trading')}
          <br />
          <span className="font-light tracking-tight text-white">{t('title.madeSimple')}</span>
        </h1>

        {/* Description */}
        <p className="text-base md:text-lg font-light text-white/80 mb-8 leading-relaxed max-w-xl">
          {t('description')}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => router.push(`/${locale}/explorer`)}
            className="px-10 py-4 rounded-full bg-transparent border border-white/30 text-white font-normal text-base transition-all duration-200 hover:bg-white/10 hover:border-white/50 cursor-pointer"
          >
            {t('viewExplorer')}
          </button>
          <button
            onClick={() => router.push(`/${locale}/trade`)}
            className="px-10 py-4 rounded-full bg-white text-black font-normal text-base transition-all duration-200 hover:bg-white/90 cursor-pointer"
          >
            {t('startTrading')}
          </button>
        </div>
      </div>
    </main>
  )
}

