import { Injectable } from '@angular/core';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  confirmSignIn,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  resendSignUpCode,
  updatePassword,
  updateUserAttributes,
  SignInOutput,
} from 'aws-amplify/auth';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Sign in — returns the Amplify SignInOutput (check nextStep for MFA etc.) */
  async signIn(email: string, password: string): Promise<SignInOutput> {
    if (environment.skipCognito) {
      return { isSignedIn: true, nextStep: { signInStep: 'DONE' } } as SignInOutput;
    }
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
    if (environment.skipCognito) return;
    await signOut();
  }

  /**
   * Returns the Cognito ID Token string.
   * The backend requires the ID Token because it reads the 'email' claim
   * for user provisioning — the Access Token does not contain email by default.
   */
  async getAccessToken(): Promise<string | null> {
    if (environment.skipCognito) {
      return environment.localAuthToken || null;
    }
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (environment.skipCognito) return true;
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /** Returns the email of the currently signed-in user, or null if not signed in */
  async getCurrentUserEmail(): Promise<string | null> {
    if (environment.skipCognito) return null;
    try {
      const session = await fetchAuthSession();
      const claims = session.tokens?.idToken?.payload;
      return (claims?.['email'] as string) ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Confirms a sign-in challenge (CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED).
   * Call this after signIn() returns that challenge step.
   */
  async confirmSignIn(newPassword: string): Promise<SignInOutput> {
    return confirmSignIn({ challengeResponse: newPassword });
  }

  /** Change password for currently signed-in user */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await updatePassword({ oldPassword, newPassword });
  }

  /** Update first/last name attributes for currently signed-in user */
  async updateUserAttributes(firstName: string, lastName: string): Promise<void> {
    await updateUserAttributes({
      userAttributes: {
        given_name: firstName,
        family_name: lastName,
      },
    });
  }
}
