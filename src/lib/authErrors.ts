/**
 * Maps Firebase Auth error codes to friendly, user-facing messages.
 * Strips all Firebase-specific language so users never see "auth/..." codes.
 */
export const getFriendlyAuthError = (error: any): string => {
  const code: string = error?.code ?? '';

  switch (code) {
    // ── Sign in errors ──────────────────────────────────────────────
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Incorrect email or password. Please try again.';

    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';

    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes and try again.';

    case 'auth/user-token-expired':
    case 'auth/requires-recent-login':
      return 'Your session has expired. Please sign in again.';

    // ── Sign up errors ──────────────────────────────────────────────
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';

    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';

    case 'auth/operation-not-allowed':
      return 'Sign up is currently unavailable. Please try again later.';

    // ── Network errors ──────────────────────────────────────────────
    case 'auth/network-request-failed':
      return 'No internet connection. Please check your network and try again.';

    case 'auth/timeout':
      return 'The request timed out. Please check your connection and try again.';

    // ── Google / OAuth errors ───────────────────────────────────────
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again.';

    case 'auth/popup-blocked':
      return 'Sign in popup was blocked. Please allow popups and try again.';

    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign in method.';

    // ── Fallback ────────────────────────────────────────────────────
    default:
      return 'Something went wrong. Please try again.';
  }
};
