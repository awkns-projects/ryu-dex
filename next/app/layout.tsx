import type { ReactNode } from 'react';
import { locales } from '@/i18n';

type Props = {
  children: ReactNode;
};

// Since we have a root `layout.tsx`, this layout file
// is required. It can be used for shared layout elements.
export default function RootLayout({ children }: Props) {
  return children;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
