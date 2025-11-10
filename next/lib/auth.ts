import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./db/prisma";

// Lazy load Resend to avoid initialization issues
let resendInstance: any = null;
function getResend() {
  if (!resendInstance) {
    const { Resend } = require("resend");
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "sign-in"
            ? "Your Sign In Code"
            : type === "email-verification"
              ? "Verify Your Email"
              : "Reset Your Password";

        const message =
          type === "sign-in"
            ? `Your verification code is: ${otp}. This code will expire in 5 minutes.`
            : type === "email-verification"
              ? `Your email verification code is: ${otp}. This code will expire in 5 minutes.`
              : `Your password reset code is: ${otp}. This code will expire in 5 minutes.`;

        try {
          const resend = getResend();
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || "onboarding@resend.dev",
            to: email,
            subject,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>${subject}</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                          <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center;">
                              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">${subject}</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 20px 40px; text-align: center;">
                              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #666;">
                                ${message}
                              </p>
                              <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; margin: 24px 0;">
                                <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a1a1a; font-family: monospace;">
                                  ${otp}
                                </div>
                              </div>
                              <p style="margin: 24px 0 0 0; font-size: 14px; color: #999;">
                                If you didn't request this code, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #eee;">
                              <p style="margin: 0; font-size: 12px; color: #999;">
                                This is an automated message, please do not reply.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
              </html>
            `,
          });
        } catch (error) {
          console.error("Failed to send OTP email:", error);
          throw new Error("Failed to send verification email");
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      sendVerificationOnSignUp: true,
      disableSignUp: false,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiry will be updated)
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;

