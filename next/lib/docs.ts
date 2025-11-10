import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocPage {
  slug: string;
  title: string;
  order: number;
  content: string;
  locale: string;
}

export interface DocNavItem {
  slug: string;
  title: string;
  order: number;
}

const docsDirectory = path.join(process.cwd(), 'docs');
console.log('[docs.ts] Docs directory path:', docsDirectory);
console.log('[docs.ts] Current working directory:', process.cwd());

// Extract title and order from markdown content
function extractMetadata(content: string, filename: string): { title: string; order: number } {
  const { data, content: markdownContent } = matter(content);

  // If frontmatter has title and order, use them
  if (data.title && data.order !== undefined) {
    return { title: data.title, order: data.order };
  }

  // Otherwise, extract from filename and first heading
  const lines = markdownContent.split('\n');
  const firstHeading = lines.find(line => line.startsWith('# '));
  const title = firstHeading ? firstHeading.replace('# ', '').trim() : filename.replace('.md', '');

  // Extract order from filename (e.g., "01-introduction.md" -> 1)
  const orderMatch = filename.match(/^(\d+)-/);
  const order = orderMatch ? parseInt(orderMatch[1]) : 999;

  return { title, order };
}

export function getDocBySlug(slug: string, locale: string): DocPage | null {
  try {
    const localeDir = path.join(docsDirectory, locale);
    const filePath = path.join(localeDir, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);
    const { title, order } = extractMetadata(fileContents, `${slug}.md`);

    return {
      slug,
      title: data.title || title,
      order: data.order !== undefined ? data.order : order,
      content,
      locale,
    };
  } catch (error) {
    console.error(`Error reading doc: ${slug}`, error);
    return null;
  }
}

export function getAllDocs(locale: string): DocNavItem[] {
  try {
    const localeDir = path.join(docsDirectory, locale);
    console.log(`[getAllDocs] Checking directory: ${localeDir}`);

    if (!fs.existsSync(localeDir)) {
      console.error(`[getAllDocs] Directory does not exist: ${localeDir}`);
      // List what's in the docs directory
      if (fs.existsSync(docsDirectory)) {
        console.log('[getAllDocs] Contents of docs directory:', fs.readdirSync(docsDirectory));
      } else {
        console.error('[getAllDocs] Docs directory itself does not exist:', docsDirectory);
      }
      return [];
    }

    const files = fs.readdirSync(localeDir);
    console.log(`[getAllDocs] Found ${files.length} files in ${localeDir}`);
    const docs = files
      .filter(file => file.endsWith('.md') && file !== 'README.md')
      .map(file => {
        const slug = file.replace('.md', '');
        const filePath = path.join(localeDir, file);
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const { title, order } = extractMetadata(fileContents, file);

        return {
          slug,
          title,
          order,
        };
      })
      .sort((a, b) => a.order - b.order);

    return docs;
  } catch (error) {
    console.error(`Error reading docs for locale: ${locale}`, error);
    return [];
  }
}

export function getReadmeContent(locale: string): string | null {
  try {
    const localeDir = path.join(docsDirectory, locale);
    const readmePath = path.join(localeDir, 'README.md');
    console.log(`[getReadmeContent] Looking for README at: ${readmePath}`);

    // List all files in the directory to debug
    if (fs.existsSync(localeDir)) {
      const allFiles = fs.readdirSync(localeDir);
      console.log(`[getReadmeContent] All files in ${localeDir}:`, allFiles);
      console.log(`[getReadmeContent] Files matching README:`, allFiles.filter(f => f.toLowerCase().includes('readme')));
    }

    if (!fs.existsSync(readmePath)) {
      console.error(`[getReadmeContent] README not found at: ${readmePath}`);
      // Try case-insensitive search
      if (fs.existsSync(localeDir)) {
        const files = fs.readdirSync(localeDir);
        const readmeFile = files.find(f => f.toLowerCase() === 'readme.md');
        if (readmeFile) {
          console.log(`[getReadmeContent] Found README with different case: ${readmeFile}`);
          const actualPath = path.join(localeDir, readmeFile);
          const fileContents = fs.readFileSync(actualPath, 'utf8');
          const { content } = matter(fileContents);
          return content;
        }
      }
      return null;
    }

    const fileContents = fs.readFileSync(readmePath, 'utf8');
    const { content } = matter(fileContents);
    console.log(`[getReadmeContent] Successfully read README for locale: ${locale}`);

    return content;
  } catch (error) {
    console.error(`[getReadmeContent] Error reading README for locale: ${locale}`, error);
    return null;
  }
}

