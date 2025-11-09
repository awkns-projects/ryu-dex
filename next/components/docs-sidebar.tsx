'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface DocNavItem {
  slug: string;
  title: string;
  order: number;
}

interface DocsSidebarProps {
  docs: DocNavItem[];
  locale: string;
}

export function DocsSidebar({ docs, locale }: DocsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine current selection
  const isOverview = pathname === `/${locale}/docs` || pathname === `/${locale}/docs/`;
  const currentDoc = docs.find(doc => pathname === `/${locale}/docs/${doc.slug}`);
  const [selectedValue, setSelectedValue] = useState(
    isOverview ? 'overview' : currentDoc?.slug || 'overview'
  );

  // Update selected value when pathname changes
  useEffect(() => {
    if (isOverview) {
      setSelectedValue('overview');
    } else if (currentDoc) {
      setSelectedValue(currentDoc.slug);
    }
  }, [pathname, isOverview, currentDoc]);

  const handleSelectChange = (value: string) => {
    setSelectedValue(value);
    if (value === 'overview') {
      router.push(`/${locale}/docs`);
    } else {
      router.push(`/${locale}/docs/${value}`);
    }
  };

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="block lg:hidden">
        <select
          value={selectedValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="overview">📄 Overview</option>
          {docs.map((doc) => (
            <option key={doc.slug} value={doc.slug}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block space-y-1">
        <div className="mb-4">
          <Link
            href={`/${locale}/docs`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              isOverview
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <FileText className="h-4 w-4" />
            Overview
          </Link>
        </div>

        <div className="space-y-1">
          {docs.map((doc) => {
            const isActive = pathname === `/${locale}/docs/${doc.slug}`;

            return (
              <Link
                key={doc.slug}
                href={`/${locale}/docs/${doc.slug}`}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isActive && "rotate-90"
                  )}
                />
                <span className="flex-1">{doc.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

