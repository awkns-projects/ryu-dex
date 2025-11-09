import { ReactNode } from 'react';
import { getAllDocs } from '@/lib/docs';
import { DocsSidebar } from '@/components/docs-sidebar';
import { Header } from '@/components/header';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// Force Node.js runtime for file system access
export const runtime = 'nodejs';

interface DocsLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function DocsLayout({ children, params }: DocsLayoutProps) {
  const { locale } = await params;
  const docs = getAllDocs(locale);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="border rounded-lg p-4 bg-card">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Documentation</h2>
              <DocsSidebar docs={docs} locale={locale} />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0">
            <div className="border rounded-lg p-6 lg:p-8 bg-card">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

