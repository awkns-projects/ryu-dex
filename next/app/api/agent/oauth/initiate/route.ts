import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFullAgentWithModelsAndActions } from '@/lib/db/agent-queries';

/**
 * Initiate OAuth for an Agent
 * 
 * This endpoint generates the OAuth authorization URL with the agent ID embedded
 * in the state parameter so we can identify which agent to store tokens for
 */
export async function POST(request: NextRequest) {
  try {
    // Get session to verify user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, provider, scopes, requiresExisting, platform, recordId, modelId } = body;

    if (!agentId || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, provider' },
        { status: 400 }
      );
    }

    // Determine if this is a native app request
    const isNative = platform === 'native' || platform === 'expo';

    // Verify agent belongs to user
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build state parameter to include agent ID and scope info
    const baseState: any = {
      agentId,
      scopeUpdate: !!requiresExisting, // For logging only - tokens always stored in main auth field
      timestamp: Date.now(),
    };

    // Include recordId and modelId for redirect back to detail screen
    if (recordId) {
      baseState.recordId = recordId;
    }
    if (modelId) {
      baseState.modelId = modelId;
    }

    // For native, also include provider in state so the redirect page knows which provider
    if (isNative) {
      baseState.provider = provider;
    }

    // For X (Twitter), generate and include code_verifier for PKCE
    if (provider === 'x') {
      const crypto = await import('crypto');
      const codeVerifier = crypto.randomBytes(32).toString('hex');
      const sha256Verifier = crypto.createHash('sha256').update(codeVerifier).digest('base64');
      const codeChallenge = sha256Verifier.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

      baseState.codeVerifier = codeVerifier;
      baseState.codeChallenge = codeChallenge;
    }

    const state = JSON.stringify(baseState);

    // Encode state for URL
    const encodedState = encodeURIComponent(state);

    let authUrl: string;

    // For native apps: Use web page that will redirect to deep link (Google requires HTTPS)
    // For web apps: Use direct API callback
    let baseUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

    // Remove trailing slash to prevent double slashes in redirect URI
    baseUrl = baseUrl.replace(/\/$/, '');

    const redirectUri = isNative
      ? `${baseUrl}/auth/agent-oauth-redirect`
      : `${baseUrl}/api/agent/oauth/callback/${provider}`;

    console.log('📋 Redirect URI:', redirectUri, '(platform:', isNative ? 'native' : 'web', ')');

    if (provider === 'google') {
      // Build Google OAuth URL
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.append('client_id', process.env.GOOGLE_CLIENT_ID || '');
      googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.append('response_type', 'code');
      googleAuthUrl.searchParams.append('scope', scopes?.join(' ') || 'profile email');
      googleAuthUrl.searchParams.append('access_type', 'offline');
      googleAuthUrl.searchParams.append('prompt', 'consent');
      googleAuthUrl.searchParams.append('state', encodedState);

      authUrl = googleAuthUrl.toString();
    } else if (provider === 'facebook') {
      // Build Facebook OAuth URL
      const fbAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
      fbAuthUrl.searchParams.append('client_id', process.env.FACEBOOK_CLIENT_ID || '');
      fbAuthUrl.searchParams.append('redirect_uri', redirectUri);
      fbAuthUrl.searchParams.append('response_type', 'code');
      fbAuthUrl.searchParams.append('scope', scopes?.join(',') || 'email,public_profile');
      fbAuthUrl.searchParams.append('state', encodedState);

      authUrl = fbAuthUrl.toString();
    } else if (provider === 'x') {
      // Build X (Twitter) OAuth URL with PKCE
      const xAuthUrl = new URL('https://x.com/i/oauth2/authorize');
      xAuthUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_X_CLIENT_ID || '');
      xAuthUrl.searchParams.append('redirect_uri', redirectUri);
      xAuthUrl.searchParams.append('response_type', 'code');
      xAuthUrl.searchParams.append('scope', scopes?.join(' ') || 'tweet.read tweet.write users.read offline.access');
      xAuthUrl.searchParams.append('state', encodedState);
      xAuthUrl.searchParams.append('code_challenge', JSON.parse(state).codeChallenge);
      xAuthUrl.searchParams.append('code_challenge_method', 'S256');

      authUrl = xAuthUrl.toString();
    } else if (provider === 'instagram') {
      // Build Instagram OAuth URL
      const igAuthUrl = new URL('https://www.instagram.com/oauth/authorize');
      igAuthUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '');
      igAuthUrl.searchParams.append('redirect_uri', redirectUri);
      igAuthUrl.searchParams.append('response_type', 'code');
      igAuthUrl.searchParams.append('scope', scopes?.join(',') || 'instagram_basic,instagram_content_publish');
      igAuthUrl.searchParams.append('state', encodedState);

      authUrl = igAuthUrl.toString();
    } else if (provider === 'threads') {
      // Build Threads OAuth URL
      const threadsAuthUrl = new URL('https://threads.net/oauth/authorize');
      threadsAuthUrl.searchParams.append('client_id', process.env.NEXT_PUBLIC_THREADS_APP_ID || '');
      threadsAuthUrl.searchParams.append('redirect_uri', redirectUri);
      threadsAuthUrl.searchParams.append('response_type', 'code');
      threadsAuthUrl.searchParams.append('scope', scopes?.join(',') || 'threads_basic,threads_content_publish');
      threadsAuthUrl.searchParams.append('state', encodedState);

      authUrl = threadsAuthUrl.toString();
    } else {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    console.log(`🔐 Generated OAuth URL for ${provider} agent:`, agentId);

    return NextResponse.json({
      success: true,
      authUrl,
      provider,
      agentId,
    });

  } catch (error) {
    console.error('❌ OAuth initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

