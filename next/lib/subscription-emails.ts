/**
 * Subscription email utilities using Resend
 * Integrates with existing email.ts Resend setup
 */

import { sendEmail } from './email';
import { render } from '@react-email/components';
import SubscriptionExpiringEmail from '@/emails/subscription-expiring';

interface SubscriptionEmailParams {
  to: string;
  name?: string;
  planName: string;
  locale?: string;
}

/**
 * Send subscription expiring reminder (3 days before expiry)
 */
export async function sendExpirationReminder({
  to,
  name,
  planName,
  expiryDate,
  locale = 'en',
}: SubscriptionEmailParams & { expiryDate: string }) {
  try {
    // Render the React email template
    const emailHtml = render(
      SubscriptionExpiringEmail({
        email: to,
        planName,
        expiryDate,
        locale,
      })
    );

    const subject = locale === 'zh-TW'
      ? '您的訂閱即將到期'
      : 'Your Subscription is Expiring Soon';

    await sendEmail({
      to,
      subject,
      html: emailHtml,
      text: `Your ${planName} subscription will expire on ${expiryDate}. Please renew to continue enjoying our services.`,
    });

    console.log(`✅ Expiration reminder sent to ${to} for ${planName}`);
  } catch (error) {
    console.error(`❌ Failed to send expiration reminder to ${to}:`, error);
    throw error;
  }
}

/**
 * Send subscription success email
 */
export async function sendSubscriptionSuccessEmail({
  to,
  name,
  planName,
  locale = 'en',
}: SubscriptionEmailParams) {
  const subject = locale === 'zh-TW'
    ? '訂閱成功！'
    : 'Subscription Successful!';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #ec4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ${planName}!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">
            ${locale === 'zh-TW' ? '訂閱成功' : 'Subscription Activated'}
          </h2>
          
          <p style="color: #666; font-size: 16px;">
            ${locale === 'zh-TW'
      ? `感謝您訂閱 ${planName} 方案！您的訂閱已成功啟用。`
      : `Thank you for subscribing to the ${planName} plan! Your subscription is now active.`}
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">
              ${locale === 'zh-TW' ? '接下來可以做什麼：' : 'What\'s Next:'}
            </h3>
            <ul style="color: #666; padding-left: 20px;">
              <li style="margin: 10px 0;">
                ${locale === 'zh-TW' ? '開始使用所有高級功能' : 'Start using all premium features'}
              </li>
              <li style="margin: 10px 0;">
                ${locale === 'zh-TW' ? '查看您的訂閱詳情' : 'View your subscription details'}
              </li>
              <li style="margin: 10px 0;">
                ${locale === 'zh-TW' ? '探索新功能和更新' : 'Explore new features and updates'}
              </li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" 
               style="background: linear-gradient(135deg, #fbbf24 0%, #ec4899 100%); 
                      color: white; 
                      padding: 14px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${locale === 'zh-TW' ? '前往控制台' : 'Go to Dashboard'}
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            ${locale === 'zh-TW'
      ? '如有任何問題，請隨時與我們聯繫。'
      : 'If you have any questions, please don\'t hesitate to contact us.'}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ryu. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject,
    html,
    text: `Thank you for subscribing to ${planName}! Your subscription is now active.`,
  });

  console.log(`✅ Success email sent to ${to} for ${planName}`);
}

/**
 * Send subscription cancelled email
 */
export async function sendSubscriptionCancelledEmail({
  to,
  name,
  planName,
  endDate,
  locale = 'en',
}: SubscriptionEmailParams & { endDate?: string }) {
  const subject = locale === 'zh-TW'
    ? '訂閱已取消'
    : 'Subscription Cancelled';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${locale === 'zh-TW' ? '訂閱已取消' : 'Subscription Cancelled'}
          </h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #666; font-size: 16px;">
            ${locale === 'zh-TW'
      ? `您的 ${planName} 訂閱已取消。`
      : `Your ${planName} subscription has been cancelled.`}
          </p>
          
          ${endDate ? `
            <div style="margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <p style="color: #666; margin: 0;">
                ${locale === 'zh-TW'
        ? `您可以繼續使用服務至：${endDate}`
        : `You can continue using the service until: ${endDate}`}
              </p>
            </div>
          ` : ''}
          
          <p style="color: #666; font-size: 16px; margin-top: 20px;">
            ${locale === 'zh-TW'
      ? '我們很遺憾看到您離開。如果您改變主意，隨時歡迎回來！'
      : 'We\'re sorry to see you go. You\'re always welcome to come back!'}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" 
               style="background: linear-gradient(135deg, #fbbf24 0%, #ec4899 100%); 
                      color: white; 
                      padding: 14px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${locale === 'zh-TW' ? '重新訂閱' : 'Resubscribe'}
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ryu. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject,
    html,
    text: `Your ${planName} subscription has been cancelled.${endDate ? ` You can continue using the service until ${endDate}.` : ''}`,
  });

  console.log(`✅ Cancellation email sent to ${to} for ${planName}`);
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail({
  to,
  name,
  planName,
  amount,
  locale = 'en',
}: SubscriptionEmailParams & { amount?: number }) {
  const subject = locale === 'zh-TW'
    ? '付款失敗'
    : 'Payment Failed';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">
            ${locale === 'zh-TW' ? '付款失敗' : 'Payment Failed'}
          </h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <p style="color: #666; font-size: 16px;">
            ${locale === 'zh-TW'
      ? `您的 ${planName} 訂閱付款未能成功處理。`
      : `We were unable to process payment for your ${planName} subscription.`}
          </p>
          
          ${amount ? `
            <div style="margin: 20px 0; padding: 20px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="color: #991b1b; margin: 0; font-weight: bold;">
                ${locale === 'zh-TW' ? '金額' : 'Amount'}: $${(amount / 100).toFixed(2)}
              </p>
            </div>
          ` : ''}
          
          <p style="color: #666; font-size: 16px; margin-top: 20px;">
            ${locale === 'zh-TW'
      ? '請更新您的付款方式以繼續使用服務。'
      : 'Please update your payment method to continue using our service.'}
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" 
               style="background: #ef4444; 
                      color: white; 
                      padding: 14px 40px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${locale === 'zh-TW' ? '更新付款方式' : 'Update Payment Method'}
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ryu. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to,
    subject,
    html,
    text: `Payment for your ${planName} subscription failed. Please update your payment method.`,
  });

  console.log(`✅ Payment failed email sent to ${to}`);
}

