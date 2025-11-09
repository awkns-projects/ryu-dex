import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trading Templates | Ryu - AI Trading Platform',
  description: '50+ ready-to-use trading templates for crypto, stocks, forex, and more. Start with proven strategies and customize to your needs.',
  keywords: 'trading templates, crypto trading, stock trading, AI trading strategies, automated trading, portfolio management',
  openGraph: {
    title: 'Browse 50+ Trading Templates | Ryu',
    description: 'Ready-to-use templates for crypto, stocks, portfolio management, and more.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browse 50+ Trading Templates | Ryu',
    description: 'Ready-to-use templates for crypto, stocks, portfolio management, and more.',
  },
}

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

