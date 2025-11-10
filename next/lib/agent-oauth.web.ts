/**
 * Agent OAuth Utility (Web Version)
 * Handles OAuth flows for individual agents on web platform
 * IMPORTANT: These flows do NOT affect the user's authentication session
 */

export interface OAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  error?: string;
}

/**
 * Initiate Google OAuth for an agent (Web)
 * Opens OAuth flow in popup/redirect and returns tokens to be stored in agent's googleAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentGoogleOAuth(
  agentId: string,
  scopes: string[] = ['profile', 'email']
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Google OAuth for agent (web):', agentId);
    console.log('📋 Requested scopes:', scopes);

    // Call the initiate endpoint to get the OAuth URL (with authentication cookies)
    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Automatically includes auth cookies
      body: JSON.stringify({
        agentId,
        provider: 'google',
        scopes,
        platform: 'web', // Tell backend to use web URL redirect
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OAuth initiate failed:', errorText);

      // Try to parse error details
      let errorMessage = `Failed to initiate OAuth (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        console.error('📋 Error details:', errorJson);
        errorMessage = errorJson.error || errorJson.details || errorMessage;
      } catch (e) {
        // Not JSON, use status text
        errorMessage = `${errorMessage}: ${errorText}`;
      }

      // Add helpful hint for common issues
      if (response.status === 500) {
        errorMessage += '\n\n💡 Tip: Check if GOOGLE_CLIENT_ID is set in .env.local';
      }

      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      console.error('❌ No authUrl in response:', result);
      throw new Error('No authUrl returned from server.\n\n💡 Check environment variables:\n- GOOGLE_CLIENT_ID\n- GOOGLE_CLIENT_SECRET\n- NEXT_PUBLIC_APP_URL');
    }

    console.log('🔗 Redirecting to OAuth URL');

    // Save current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      sessionStorage.setItem('oauth_return_url', currentPath);
      sessionStorage.setItem('oauth_provider', 'google');
      console.log('💾 Saved return URL:', currentPath);
    }

    // Full page redirect (works on all devices)
    window.location.href = authUrl;

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
 * Initiate Facebook OAuth for an agent (Web)
 * Opens OAuth flow in popup/redirect and returns tokens to be stored in agent's fbAuth field
 * Does NOT affect user's session
 */
export async function initiateAgentFacebookOAuth(
  agentId: string,
  scopes: string[] = ['email', 'public_profile']
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Facebook OAuth for agent (web):', agentId);
    console.log('📋 Requested scopes:', scopes);

    // Call the initiate endpoint to get the OAuth URL (with authentication cookies)
    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Automatically includes auth cookies
      body: JSON.stringify({
        agentId,
        provider: 'facebook',
        scopes,
        platform: 'web', // Tell backend to use web URL redirect
      }),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OAuth initiate failed:', errorText);
      throw new Error(`Failed to initiate OAuth: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('📥 OAuth initiate result:', result);
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Save current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_return_url', window.location.pathname);
      sessionStorage.setItem('oauth_provider', 'facebook');
    }

    // Full page redirect (works on all devices)
    window.location.href = authUrl;

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
 * Initiate X (Twitter) OAuth for an agent (Web)
 */
export async function initiateAgentXOAuth(
  agentId: string,
  scopes: string[] = []
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating X OAuth for agent (web):', agentId);

    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        agentId,
        provider: 'x',
        scopes,
        platform: 'web',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate OAuth: ${response.status}`);
    }

    const result = await response.json();
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Save current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_return_url', window.location.pathname);
    }

    // Full page redirect (works on all devices)
    window.location.href = authUrl;

    return { success: true };
  } catch (error) {
    console.error('❌ X OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate Instagram OAuth for an agent (Web)
 */
export async function initiateAgentInstagramOAuth(
  agentId: string,
  scopes: string[] = []
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Instagram OAuth for agent (web):', agentId);

    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        agentId,
        provider: 'instagram',
        scopes,
        platform: 'web',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate OAuth: ${response.status}`);
    }

    const result = await response.json();
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Save current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_return_url', window.location.pathname);
    }

    // Full page redirect (works on all devices)
    window.location.href = authUrl;

    return { success: true };
  } catch (error) {
    console.error('❌ Instagram OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Initiate Threads OAuth for an agent (Web)
 */
export async function initiateAgentThreadsOAuth(
  agentId: string,
  scopes: string[] = []
): Promise<OAuthResult> {
  try {
    console.log('🔐 Initiating Threads OAuth for agent (web):', agentId);

    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        agentId,
        provider: 'threads',
        scopes,
        platform: 'web',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to initiate OAuth: ${response.status}`);
    }

    const result = await response.json();
    const { authUrl } = result;

    if (!authUrl) {
      throw new Error('No authUrl returned from server');
    }

    // Save current URL to return to after OAuth
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_return_url', window.location.pathname);
    }

    // Full page redirect (works on all devices)
    window.location.href = authUrl;

    return { success: true };
  } catch (error) {
    console.error('❌ Threads OAuth error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth failed',
    };
  }
}

/**
 * Request additional Google scopes for an existing auth (Web)
 * Used when agent needs more permissions (e.g., Gmail send)
 * Does NOT affect user's session
 */
export async function requestAdditionalGoogleScopes(
  agentId: string,
  additionalScopes: string[]
): Promise<OAuthResult> {
  try {
    console.log('🔐 Requesting additional Google scopes for agent (web):', agentId);
    console.log('📋 Additional scopes:', additionalScopes);

    // Call the initiate endpoint to get the OAuth URL (with authentication cookies)
    const response = await fetch('/api/agent/oauth/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Automatically includes auth cookies
      body: JSON.stringify({
        agentId,
        provider: 'google',
        scopes: additionalScopes,
        requiresExisting: true,
        platform: 'web', // Tell backend to use web URL redirect
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OAuth initiate failed:', errorText);
      throw new Error(`Failed to initiate OAuth for additional scopes: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    const { authUrl } = result;

    // Open OAuth URL in popup window (does NOT use authClient to avoid affecting user session)
    const popup = window.open(
      authUrl,
      'agent_oauth_scopes',
      'width=600,height=700,scrollbars=yes'
    );

    if (!popup) {
      // If popup was blocked, use redirect
      window.location.href = authUrl;
    }

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

