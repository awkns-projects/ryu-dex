/**
 * Email sending utility for magic links and other notifications
 * Uses Resend (https://resend.com) for email delivery
 */

import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<void> {
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not configured');
    console.log('📧 Email would be sent to:', to);
    console.log('📧 Subject:', subject);

    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY is not configured. Please add it to your environment variables.');
    }

    // In development, log the email details instead of failing
    console.log('⚠️  Skipping email send in development mode without API key');
    return Promise.resolve();
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'ryu <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Email ID:', data?.id);
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
}

/**
 * Send a magic link email
 */
export async function sendMagicLinkEmail(email: string, magicLinkUrl: string): Promise<void> {
  const subject = 'Sign in to ryu';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in to ryu</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">ryu</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">AI Agent Builder</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Sign in to your account</h2>
          
          <p style="color: #666; font-size: 16px;">
            Click the button below to securely sign in to your ryu account. This link will expire in 10 minutes.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 14px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Sign In to ryu
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you didn't request this email, you can safely ignore it.
          </p>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">
              ${magicLinkUrl}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ryu. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  const text = `
Sign in to ryu

Click the link below to sign in to your account:
${magicLinkUrl}

This link will expire in 10 minutes.

If you didn't request this email, you can safely ignore it.

© ${new Date().getFullYear()} ryu. All rights reserved.
  `.trim();

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

