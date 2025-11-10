/**
 * Standard OAuth token names used across the application
 * These exact names are required for the onboarding flow to recognize OAuth tokens
 */
export const OAUTH_TOKENS = {
  FACEBOOK: 'FACEBOOK_ACCESS_TOKEN',
  INSTAGRAM: 'INSTAGRAM_ACCESS_TOKEN',
  X_TWITTER: 'X_ACCESS_TOKEN',
  THREADS: 'THREADS_ACCESS_TOKEN',
} as const;

/**
 * Detection patterns for each OAuth provider
 * Used to automatically detect which OAuth tokens are needed from step descriptions
 */
export const OAUTH_DETECTION_PATTERNS = {
  [OAUTH_TOKENS.X_TWITTER]: /\b(twitter|tweet|x post|post to x|publish to x|x\.com)\b/i,
  [OAUTH_TOKENS.FACEBOOK]: /\b(facebook|fb post|post to facebook|facebook\.com)\b/i,
  [OAUTH_TOKENS.INSTAGRAM]: /\b(instagram|ig post|post to instagram|instagram\.com)\b/i,
  [OAUTH_TOKENS.THREADS]: /\b(threads|post to threads|threads\.net)\b/i,
} as const;

/**
 * Check if an environment variable name is a known OAuth token
 */
export function isOAuthToken(envVarName: string): boolean {
  return Object.values(OAUTH_TOKENS).includes(envVarName as any);
}

/**
 * Detect which OAuth tokens are needed based on text description
 * Returns an array of required OAuth token names
 */
export function detectRequiredOAuthTokens(text: string): string[] {
  const required = new Set<string>();
  const searchText = text.toLowerCase();

  for (const [tokenName, pattern] of Object.entries(OAUTH_DETECTION_PATTERNS)) {
    if (pattern.test(searchText)) {
      required.add(tokenName);
    }
  }

  return Array.from(required);
}

/**
 * Get a human-readable name for an OAuth provider
 */
export function getOAuthProviderName(tokenName: string): string {
  switch (tokenName) {
    case OAUTH_TOKENS.X_TWITTER:
      return 'X (Twitter)';
    case OAUTH_TOKENS.FACEBOOK:
      return 'Facebook';
    case OAUTH_TOKENS.INSTAGRAM:
      return 'Instagram';
    case OAUTH_TOKENS.THREADS:
      return 'Threads';
    default:
      return tokenName;
  }
} 