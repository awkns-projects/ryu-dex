import 'server-only';

// Re-export Prisma client for backward compatibility
export { prisma as db } from './prisma';
export { prisma } from './prisma';
