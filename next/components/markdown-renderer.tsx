'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const params = useParams();
  const locale = params?.locale as string || 'en';

  const components: Components = {
    h1: ({ children, ...props }) => (
      <h1 className="text-4xl font-bold mt-8 mb-4 text-foreground" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-3xl font-semibold mt-8 mb-3 text-foreground" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-2xl font-semibold mt-6 mb-2 text-foreground" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }) => (
      <p className="mb-4 leading-7 text-muted-foreground" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-muted-foreground" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),
    a: ({ children, href, ...props }) => {
      if (!href) {
        return <a {...props}>{children}</a>;
      }

      // Handle external links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        return (
          <a
            className="text-primary hover:underline font-medium"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      }

      // Handle relative markdown links (e.g., ./01-introduction.md or 01-introduction.md)
      if (href.endsWith('.md')) {
        // Remove ./ prefix and .md suffix
        const slug = href.replace(/^\.\//, '').replace(/\.md$/, '');
        const internalHref = `/${locale}/docs/${slug}`;

        return (
          <Link
            href={internalHref}
            className="text-primary hover:underline font-medium"
            {...props}
          >
            {children}
          </Link>
        );
      }

      // Handle anchor links
      if (href.startsWith('#')) {
        return (
          <a
            className="text-primary hover:underline font-medium"
            href={href}
            {...props}
          >
            {children}
          </a>
        );
      }

      // Default to regular link for other cases
      return (
        <a
          className="text-primary hover:underline font-medium"
          href={href}
          {...props}
        >
          {children}
        </a>
      );
    },
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      return isInline ? (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props}>
          {children}
        </code>
      ) : (
        <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto text-foreground" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props}>
        {children}
      </pre>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props}>
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full divide-y divide-border" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-muted" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-border" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr {...props}>{children}</tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-2 text-left text-sm font-semibold text-foreground" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 text-sm text-muted-foreground" {...props}>
        {children}
      </td>
    ),
    hr: (props) => (
      <hr className="my-8 border-border" {...props} />
    ),
  };

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

