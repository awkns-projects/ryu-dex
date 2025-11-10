/**
 * Agent OAuth Utility
 * Handles OAuth flows for individual agents to connect to Google and Facebook
 * IMPORTANT: These flows do NOT affect the user's authentication session
 */

import { API_BASE_URL } from './api-config';
import { authenticatedFetch } from './authenticated-fetch';

export interface OAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Open URL for OAuth (platform-aware)
 * On native: uses expo-web-browser (in-app browser like Better Auth)
 * On web: uses window.open
 */
async function openOAuthUrl(url: string): Promise<void> {
  // Detect if we're on web or native
  if (typeof window !== 'undefined' && typeof window.open === 'function') {
    // Web platform
    const popup = window.open(
      url,
      'agent_oauth',
      'width=600,height=700,scrollbars=yes'
    );

    if (!popup) {
      // Popup blocked - use redirect
      window.location.href = url;
    }
  } else {
    // Native platform (React Native/Expo)
    // Use expo-web-browser (in-app browser) - SAME AS BETTER AUTH!
    try {
      const WebBrowser = await import('expo-web-browser');

      console.log('🌐 Opening OAuth in expo-web-browser (in-app)');

      const result = await WebBrowser.openAuthSessionAsync(url, 'ryu-ai-agent-builder://oauth-callback');

      console.log('✅ WebBrowser result:', result);

      if (result.type === 'success' && result.url) {
        console.log('✅ OAuth completed with URL:', result.url);

        // Parse the returned URL to extract params
        const urlObj = new URL(result.url);
        const provider = urlObj.searchParams.get('provider');
        const code = urlObj.searchParams.get('code');
        const state = urlObj.searchParams.get('state');

        console.log('🔍 Parsed OAuth callback:', { provider, codeLength: code?.length, stateLength: state?.length });

        if (provider && code && state) {
          // Import expo-router dynamically
          const { router } = await import('expo-router');

          console.log('🔀 Navigating to oauth-callback screen...');
          router.replace(`/auth/oauth-callback?provider=${provider}&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`);
        } else {
          console.error('❌ Missing OAuth callback parameters:', { provider, hasCode: !!code, hasState: !!state });
        }
      } else if (result.type === 'cancel') {
        console.log('⚠️ User cancelled OAuth');
      } else if (result.type === 'dismiss') {
        console.log('⚠️ User dismissed OAuth');
      }
    } catch (error) {
      console.error('❌ Failed to open with expo-web-browser:', error);
      throw new Error(`Failed to open OAuth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Initiate Google OAuth for an agent
 * Opens OAuth flow and returns tokens to be stored in agent's googleAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentGoogleOAuth(
  agentId: string,
  scopes: string[] = ['profile', 'email'],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Google OAuth for agent:', agentId);
    console.log('📋 Requested scopes:', scopes);
    console.log('🌐 API Base URL:', API_BASE_URL);

    // Call the initiate endpoint to get the OAuth URL (with authentication)
    console.log('📡 Calling: /api/agent/oauth/initiate');

    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'google',
        scopes,
        platform: 'native', // Tell backend to use deep link redirect
        recordId,
        modelId,
      }),
    });
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Open the OAuth URL in external browser/webview
    // This does NOT use authClient.signIn to avoid affecting user session
    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate Facebook OAuth for an agent
 * Opens OAuth flow and returns tokens to be stored in agent's fbAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentFacebookOAuth(
  agentId: string,
  scopes: string[] = ['email', 'public_profile'],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Facebook OAuth for agent:', agentId);
    console.log('📋 Requested scopes:', scopes);
    console.log('🌐 API Base URL:', API_BASE_URL);

    // Call the initiate endpoint to get the OAuth URL (with authentication)
    console.log('📡 Calling: /api/agent/oauth/initiate');

    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'facebook',
        scopes,
        platform: 'native', // Tell backend to use deep link redirect
        recordId,
        modelId,
      }),
    });
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Open the OAuth URL in external browser/webview
    // This does NOT use authClient.signIn to avoid affecting user session
    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Facebook OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Request additional Google scopes for an existing auth
 * Used when agent needs more permissions (e.g., Gmail send)
 * Does NOT affect user's session
 */
export async function requestAdditionalGoogleScopes(
  agentId: string,
  additionalScopes: string[],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Requesting additional Google scopes for agent:', agentId);
    console.log('📋 Additional scopes:', additionalScopes);

    // Call the initiate endpoint to get the OAuth URL with scope update flag (with authentication)
    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'google',
        scopes: additionalScopes,
        requiresExisting: true,
        platform: 'native', // Tell backend to use deep link redirect
        recordId,
        modelId,
      }),
    });

    const { authUrl } = result;

    // Open the OAuth URL in external browser/webview
    // This does NOT use authClient.signIn to avoid affecting user session
    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ Additional scopes OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Additional scopes OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate X (Twitter) OAuth for an agent
 * Opens OAuth flow and returns tokens to be stored in agent's xAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentXOAuth(
  agentId: string,
  scopes: string[] = ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating X (Twitter) OAuth for agent:', agentId);
    console.log('📋 Requested scopes:', scopes);

    // Call the initiate endpoint to get the OAuth URL (with authentication)
    console.log('📡 Calling: /api/agent/oauth/initiate');

    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'x',
        scopes,
        platform: 'native',
        recordId,
        modelId,
      }),
    });
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Open the OAuth URL
    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ X OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate Instagram OAuth for an agent
 * Opens OAuth flow and returns tokens to be stored in agent's instagramAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentInstagramOAuth(
  agentId: string,
  scopes: string[] = ['instagram_basic', 'instagram_content_publish'],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Instagram OAuth for agent:', agentId);
    console.log('📋 Requested scopes:', scopes);

    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'instagram',
        scopes,
        platform: 'native',
        recordId,
        modelId,
      }),
    });
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Instagram OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate Threads OAuth for an agent
 * Opens OAuth flow and returns tokens to be stored in agent's threadsAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentThreadsOAuth(
  agentId: string,
  scopes: string[] = ['threads_basic', 'threads_content_publish'],
  recordId?: string,
  modelId?: string
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Threads OAuth for agent:', agentId);
    console.log('📋 Requested scopes:', scopes);

    const result = await authenticatedFetch({
      path: '/api/agent/oauth/initiate',
      method: 'POST',
      body: JSON.stringify({
        agentId,
        provider: 'threads',
        scopes,
        platform: 'native',
        recordId,
        modelId,
      }),
    });
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    console.log('🌐 Opening OAuth URL:', authUrl);
    await openOAuthUrl(authUrl);

    console.log('✅ OAuth flow initiated');

    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Threads OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Check if agent has valid OAuth tokens
 */
export function hasValidOAuthTokens(authData: string | null | undefined): boolean {
  if (!authData) return false;

  try {
    const parsed = JSON.parse(authData);
    return !!(parsed.accessToken && parsed.refreshToken);
  } catch {
    return false;
  }
}

/**
 * Check if OAuth tokens contain specific scopes
 * Useful for checking if googleAuth has email scopes, etc.
 */
export function hasOAuthScopes(authData: string | null | undefined, requiredScopes: string[]): boolean {
  if (!authData) return false;

  try {
    const parsed = JSON.parse(authData);
    if (!parsed.scope) return false;

    const scopes = parsed.scope.toLowerCase().split(' ');
    return requiredScopes.every(required =>
      scopes.some(scope => scope.includes(required.toLowerCase()))
    );
  } catch {
    return false;
  }
}

/**
 * Parse OAuth data from agent field
 */
export interface ParsedOAuthData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  scope?: string;
}

export function parseOAuthData(authData: string): ParsedOAuthData | null {
  try {
    const parsed = JSON.parse(authData);
    if (!parsed.accessToken || !parsed.refreshToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

