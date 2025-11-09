import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFullAgentWithModelsAndActions, updateAgentRecord } from '@/lib/db/agent-queries';

/**
 * Complete Agent OAuth (called from deep link handler in native app)
 * 
 * This endpoint is called by the mobile app after it receives the OAuth callback deep link.
 * It exchanges the authorization code for tokens and stores them in the agent field.
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
    const { provider, code, agentId, state } = body;

    if (!provider || !code || !agentId) {
      return NextResponse.json(
        { error: 'Missing required fields: provider, code, agentId' },
        { status: 400 }
      );
    }

    console.log('🔄 Completing OAuth for agent:', agentId, 'provider:', provider);

    // Verify agent belongs to user
    const agent = await getFullAgentWithModelsAndActions(agentId);
    if (!agent || agent.agent.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse state to get additional info (like codeVerifier for X)
    let stateData: any = {};
    try {
      stateData = JSON.parse(decodeURIComponent(state));
    } catch (e) {
      console.warn('⚠️ Could not parse state:', e);
    }

    // Exchange code for tokens based on provider
    let tokens: any = {};
    let fieldName: string;

    if (provider === 'google') {
      // Always store in googleAuth field, even when adding scopes
      // The new tokens will contain ALL scopes (base + additional)
      fieldName = 'googleAuth';
      console.log(`📝 Storing Google tokens in: ${fieldName} (scopeUpdate: ${stateData.scopeUpdate})`);

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: `${process.env.BETTER_AUTH_URL}/auth/agent-oauth-redirect`,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Google token exchange failed');
      }

      tokens = await tokenResponse.json();

    } else if (provider === 'facebook') {
      fieldName = 'fbAuth';

      const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
      tokenUrl.searchParams.append('client_id', process.env.FACEBOOK_CLIENT_ID || '');
      tokenUrl.searchParams.append('client_secret', process.env.FACEBOOK_CLIENT_SECRET || '');
      tokenUrl.searchParams.append('redirect_uri', `${process.env.BETTER_AUTH_URL}/auth/agent-oauth-redirect`);
      tokenUrl.searchParams.append('code', code);

      const tokenResponse = await fetch(tokenUrl.toString());

      if (!tokenResponse.ok) {
        throw new Error('Facebook token exchange failed');
      }

      tokens = await tokenResponse.json();

    } else if (provider === 'x') {
      fieldName = 'xAuth';

      const clientId = process.env.NEXT_PUBLIC_X_CLIENT_ID || '';
      const clientSecret = process.env.NEXT_PUBLIC_X_CLIENT_SECRET || '';

      const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: `${process.env.BETTER_AUTH_URL}/auth/agent-oauth-redirect`,
          code_verifier: stateData.codeVerifier || '',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('X token exchange failed');
      }

      tokens = await tokenResponse.json();

    } else if (provider === 'instagram') {
      fieldName = 'instagramAuth';

      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID || '',
        client_secret: process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BETTER_AUTH_URL}/auth/agent-oauth-redirect`,
        code,
      });

      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!tokenResponse.ok) {
        throw new Error('Instagram token exchange failed');
      }

      tokens = await tokenResponse.json();

    } else if (provider === 'threads') {
      fieldName = 'threadsAuth';

      const params = new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_THREADS_APP_ID || '',
        client_secret: process.env.NEXT_PUBLIC_THREADS_APP_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BETTER_AUTH_URL}/auth/agent-oauth-redirect`,
        code,
      });

      const tokenResponse = await fetch(`https://graph.threads.net/oauth/access_token?${params}`, {
        method: 'GET',
      });

      if (!tokenResponse.ok) {
        throw new Error('Threads token exchange failed');
      }

      tokens = await tokenResponse.json();

    } else {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    // Prepare OAuth data
    const oauthData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || '',
      expiresAt: tokens.expires_in ? Date.now() + (tokens.expires_in * 1000) : undefined,
      scope: tokens.scope || '',
      tokenType: tokens.token_type || 'Bearer',
      userId: tokens.user_id || '',
      updatedAt: new Date().toISOString(),
    };

    console.log('🔐 OAuth data prepared:', {
      provider,
      fieldName,
      hasAccessToken: !!oauthData.accessToken,
      hasRefreshToken: !!oauthData.refreshToken,
      accessTokenPreview: oauthData.accessToken?.substring(0, 20) + '...',
      refreshTokenPreview: oauthData.refreshToken?.substring(0, 20) + '...',
      scope: oauthData.scope,
    });

    // Find the Agent model and the specific agent record by agentId
    const agentModel = agent.models.find((m: any) => m.name === 'Agent');
    if (!agentModel || !agentModel.records || agentModel.records.length === 0) {
      return NextResponse.json({ error: 'Agent model or records not found' }, { status: 404 });
    }

    // Find the specific agent record that matches the agentId
    // The agentId is actually the agent's main ID, and we need to find the corresponding AgentRecord
    // Since each agent has one Agent record, we look for it by the agent's ID
    const agentRecord = agentModel.records.find((record: any) => {
      // The record's data should have an agentId field pointing to the main agent
      return record.data?.agentId === agentId || record.modelId === agentModel.id;
    });

    // If we can't find by agentId relationship, take the first record (since there should only be one)
    const recordId = agentRecord?.id || agentModel.records[0]?.id;

    if (!recordId) {
      return NextResponse.json({ error: 'No agent record found to update' }, { status: 404 });
    }

    console.log(`📝 Updating agent record ${recordId} with field: ${fieldName}`);
    console.log(`📝 Found record in model with ${agentModel.records.length} total records`);

    await updateAgentRecord(recordId, {
      [fieldName]: JSON.stringify(oauthData),
    });

    console.log(`✅ Stored ${provider} OAuth tokens in agent's ${fieldName} field`);
    console.log(`✅ Record ID: ${recordId}, Field: ${fieldName}, Data length: ${JSON.stringify(oauthData).length} chars`);

    return NextResponse.json({
      success: true,
      provider,
      agentId,
      message: `Successfully connected ${provider}`,
    });

  } catch (error) {
    console.error('❌ OAuth completion error:', error);
    return NextResponse.json(
      {
        error: 'OAuth completion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

