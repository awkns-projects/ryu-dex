/**
 * Token Refresh Utility
 * Automatically refreshes expired OAuth tokens before action execution
 */

export interface OAuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
  updatedAt?: string;
}

export interface TokenRefreshResult {
  success: boolean;
  newTokenData?: OAuthTokenData;
  error?: string;
  refreshed?: boolean;
}

/**
 * Check if an access token is expired or will expire soon
 * @param expiresAt - Token expiration timestamp in milliseconds
 * @param bufferMinutes - Refresh if expiring within this many minutes (default: 5)
 */
export function isTokenExpired(expiresAt: number | undefined, bufferMinutes: number = 5): boolean {
  if (!expiresAt) {
    // If no expiry time, assume it might be expired - refresh to be safe
    return true;
  }

  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;

  return (expiresAt - now) < bufferMs;
}

/**
 * Refresh Google OAuth token using refresh token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<TokenRefreshResult> {
  try {
    console.log('🔄 Refreshing Google access token...');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google token refresh failed:', errorText);
      return {
        success: false,
        error: `Token refresh failed: ${response.status} ${errorText}`,
        refreshed: false,
      };
    }

    const tokens = await response.json();

    if (!tokens.access_token) {
      return {
        success: false,
        error: 'No access token in refresh response',
        refreshed: false,
      };
    }

    const newTokenData: OAuthTokenData = {
      accessToken: tokens.access_token,
      refreshToken: refreshToken, // Keep the same refresh token
      expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
      scope: tokens.scope || '',
      tokenType: tokens.token_type || 'Bearer',
      updatedAt: new Date().toISOString(),
    };

    console.log('✅ Google token refreshed successfully');
    console.log(`🔑 New access token: ${tokens.access_token.substring(0, 20)}...`);
    console.log(`⏰ Expires in: ${tokens.expires_in} seconds`);

    return {
      success: true,
      newTokenData,
      refreshed: true,
    };
  } catch (error) {
    console.error('❌ Google token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      refreshed: false,
    };
  }
}

/**
 * Refresh Facebook OAuth token using refresh token
 * Note: Facebook tokens are long-lived and may not support refresh
 */
export async function refreshFacebookToken(refreshToken: string): Promise<TokenRefreshResult> {
  try {
    console.log('🔄 Refreshing Facebook access token...');

    // Facebook uses a different approach for token refresh
    // Exchange short-lived token for long-lived token
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_CLIENT_SECRET}&fb_exchange_token=${refreshToken}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Facebook token refresh failed:', errorText);
      return {
        success: false,
        error: `Token refresh failed: ${response.status} ${errorText}`,
        refreshed: false,
      };
    }

    const tokens = await response.json();

    if (!tokens.access_token) {
      return {
        success: false,
        error: 'No access token in refresh response',
        refreshed: false,
      };
    }

    const newTokenData: OAuthTokenData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.access_token, // Facebook uses access token as refresh token
      expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
      scope: '',
      tokenType: 'Bearer',
      updatedAt: new Date().toISOString(),
    };

    console.log('✅ Facebook token refreshed successfully');

    return {
      success: true,
      newTokenData,
      refreshed: true,
    };
  } catch (error) {
    console.error('❌ Facebook token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      refreshed: false,
    };
  }
}

/**
 * Refresh X (Twitter) OAuth token using refresh token
 */
export async function refreshXToken(refreshToken: string): Promise<TokenRefreshResult> {
  try {
    console.log('🔄 Refreshing X (Twitter) access token...');

    const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID || '';
    const clientSecret = process.env.NEXT_PUBLIC_X_CLIENT_SECRET || '';

    const response = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ X token refresh failed:', errorText);
      return {
        success: false,
        error: `Token refresh failed: ${response.status} ${errorText}`,
        refreshed: false,
      };
    }

    const tokens = await response.json();

    const newTokenData: OAuthTokenData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || refreshToken,
      expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
      scope: tokens.scope || '',
      tokenType: 'Bearer',
      updatedAt: new Date().toISOString(),
    };

    console.log('✅ X token refreshed successfully');

    return {
      success: true,
      newTokenData,
      refreshed: true,
    };
  } catch (error) {
    console.error('❌ X token refresh error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      refreshed: false,
    };
  }
}

/**
 * Check and refresh OAuth token if needed
 * @param tokenDataJson - JSON string containing OAuth token data
 * @param provider - OAuth provider
 * @returns Refreshed token data or original if still valid
 */
export async function ensureFreshToken(
  tokenDataJson: string,
  provider: 'google' | 'facebook' | 'x' | 'instagram' | 'threads'
): Promise<TokenRefreshResult> {
  try {
    // Parse existing token data
    const tokenData: OAuthTokenData = JSON.parse(tokenDataJson);

    if (!tokenData.accessToken) {
      return {
        success: false,
        error: 'No access token in token data',
        refreshed: false,
      };
    }

    if (!tokenData.refreshToken) {
      console.warn('⚠️ No refresh token available - cannot refresh');
      return {
        success: true,
        newTokenData: tokenData,
        refreshed: false,
      };
    }

    // Check if token is expired
    if (!isTokenExpired(tokenData.expiresAt)) {
      console.log('✅ Access token still valid, no refresh needed');
      return {
        success: true,
        newTokenData: tokenData,
        refreshed: false,
      };
    }

    console.log('⚠️ Access token expired or expiring soon, refreshing...');

    // Refresh based on provider
    let refreshResult: TokenRefreshResult;
    if (provider === 'google') {
      refreshResult = await refreshGoogleToken(tokenData.refreshToken);
    } else if (provider === 'facebook') {
      refreshResult = await refreshFacebookToken(tokenData.refreshToken);
    } else if (provider === 'x') {
      refreshResult = await refreshXToken(tokenData.refreshToken);
    } else if (provider === 'instagram') {
      // Instagram tokens are long-lived (60 days) and don't support refresh
      console.warn('⚠️ Instagram tokens do not support refresh - connection needs re-authorization');
      return {
        success: true,
        newTokenData: tokenData,
        refreshed: false,
      };
    } else if (provider === 'threads') {
      // Threads uses same token model as Instagram
      console.warn('⚠️ Threads tokens do not support refresh - connection needs re-authorization');
      return {
        success: true,
        newTokenData: tokenData,
        refreshed: false,
      };
    } else {
      return {
        success: false,
        error: `Unsupported provider: ${provider}`,
        refreshed: false,
      };
    }

    return refreshResult;
  } catch (error) {
    console.error('❌ ensureFreshToken error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      refreshed: false,
    };
  }
}

