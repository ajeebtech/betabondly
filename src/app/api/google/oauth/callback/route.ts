import { NextResponse } from 'next/server';
import { getTokens, saveTokens } from '@/lib/google/oauth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  try {
    // Verify state to prevent CSRF
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    
    // Exchange code for tokens
    const tokens = await getTokens(code);
    
    // Save tokens for the user
    await saveTokens(userId, tokens);

    // Redirect to success page or close the popup
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <script>
            window.close();
            window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, window.location.origin);
          </script>
        </head>
        <body>
          <p>Authentication successful! You can close this window.</p>
        </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
