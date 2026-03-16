import { Injectable } from '@angular/core';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
  SignInOutput,
} from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Sign in — returns the Amplify SignInOutput (check nextStep for MFA etc.) */
  async signIn(email: string, password: string): Promise<SignInOutput> {
    return signIn({ username: email, password });
  }

  /** Sign up — user will receive an email verification code */
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          given_name: firstName,
          family_name: lastName,
        },
      },
    });
  }

  /** Confirm email with the 6-digit code from the verification email */
  async confirmSignUp(email: string, code: string): Promise<void> {
    await confirmSignUp({ username: email, confirmationCode: code });
  }

  /** Resend verification code */
  async resendCode(email: string): Promise<void> {
    await resendSignUpCode({ username: email });
  }

  /** Initiate forgot-password flow */
  async forgotPassword(email: string): Promise<void> {
    await resetPassword({ username: email });
  }

  /** Complete forgot-password with the emailed code */
  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  }

  async signOut(): Promise<void> {
    await signOut();
  }

  /**
   * Returns the Cognito ID Token string.
   * The backend requires the ID Token because it reads the 'email' claim
   * for user provisioning — the Access Token does not contain email by default.
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}
