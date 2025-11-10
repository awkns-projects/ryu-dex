import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// In production, use the current origin; in development, use localhost
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Browser environment - use current origin
    return window.location.origin;
  }
  // Server-side or build time
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [emailOTPClient()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;

