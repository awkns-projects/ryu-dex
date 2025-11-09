import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs, getReadmeContent } from '@/lib/docs';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Force Node.js runtime for file system access
export const runtime = 'nodejs';

interface DocPageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

export async function generateStaticParams() {
  const locales = ['en', 'zh-TW'];
  const params: { locale: string; slug: string[] }[] = [];

  try {
    for (const locale of locales) {
      const docs = getAllDocs(locale);
      console.log(`[generateStaticParams] Found ${docs.length} docs for locale: ${locale}`);

      // Add the root docs page (no slug)
      params.push({ locale, slug: [] });

      // Add each individual doc page
      docs.forEach((doc) => {
        params.push({ locale, slug: [doc.slug] });
      });
    }

    console.log(`[generateStaticParams] Generated ${params.length} total params`);
    return params;
  } catch (error) {
    console.error('[generateStaticParams] Error:', error);
    // Return at least the base pages
    return [
      { locale: 'en', slug: [] },
      { locale: 'zh-TW', slug: [] }
    ];
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { locale, slug } = await params;
  const slugString = slug && slug.length > 0 ? slug[0] : null;

  console.log(`[DocPage] Rendering - locale: ${locale}, slug: ${slugString || 'root'}`);

  // If no slug, show the README/overview
  if (!slugString) {
    let content = getReadmeContent(locale);

    // Fallback: If README not found, create a basic overview
    if (!content) {
      console.error(`[DocPage] README not found for locale: ${locale}, using fallback`);
      const allDocs = getAllDocs(locale);
      const docsList = allDocs.map(doc => `- [${doc.title}](./${doc.slug})`).join('\n');
      content = `# Documentation\n\nWelcome to the documentation. Choose a topic below:\n\n${docsList}`;
    }

    console.log(`[DocPage] Rendering README for locale: ${locale}`);
    return (
      <div>
        <MarkdownRenderer content={content} />
      </div>
    );
  }

  // Otherwise, show the specific doc
  const doc = getDocBySlug(slugString, locale);

  if (!doc) {
    console.error(`[DocPage] Doc not found - slug: ${slugString}, locale: ${locale}`);
    notFound();
  }

  console.log(`[DocPage] Rendering doc: ${doc.title}`);

  // Get all docs for navigation
  const allDocs = getAllDocs(locale);
  const currentIndex = allDocs.findIndex(d => d.slug === slugString);
  const prevDoc = currentIndex > 0 ? allDocs[currentIndex - 1] : null;
  const nextDoc = currentIndex < allDocs.length - 1 ? allDocs[currentIndex + 1] : null;

  return (
    <div>
      <MarkdownRenderer content={doc.content} />

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
        <div className="flex-1">
          {prevDoc && (
            <Link
              href={`/${locale}/docs/${prevDoc.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <div>
                <div className="text-xs uppercase tracking-wider mb-1">Previous</div>
                <div className="font-medium text-foreground">{prevDoc.title}</div>
              </div>
            </Link>
          )}
        </div>

        <div className="flex-1 text-right">
          {nextDoc && (
            <Link
              href={`/${locale}/docs/${nextDoc.slug}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div>
                <div className="text-xs uppercase tracking-wider mb-1">Next</div>
                <div className="font-medium text-foreground">{nextDoc.title}</div>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

