/**
 * Google OAuth Configuration
 *
 * SETUP FOR @react-native-google-signin/google-signin (Native Android Builds):
 *
 * HOW IT WORKS (vs Flutter):
 * - Flutter: Uses google-services.json which contains the Android OAuth Client ID explicitly
 * - React Native: Google's SDK AUTOMATICALLY detects the Android OAuth Client ID by matching:
 *   * Package name (from build.gradle: com.jijicare.app)
 *   * SHA-1 fingerprint (from the keystore used to sign the app)
 * - You DON'T need google-services.json - Google's servers do the matching automatically!
 *
 * You need TWO OAuth Client IDs:
 *
 * 1. ANDROID OAuth Client ID (for native sign-in):
 *    - Go to Google Cloud Console > Credentials > Create OAuth client ID > Android
 *    - Package name: com.jijicare.app (MUST match exactly)
 *    - SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25 (MUST match exactly)
 *      ⚠️ This is from android/app/debug.keystore (the keystore your app actually uses)
 *    - You DON'T paste this anywhere in code - Google SDK finds it automatically via package+SHA-1
 *    - DEVELOPER_ERROR (code 10) = Google can't find Android client ID matching your package+SHA-1
 *
 * 2. WEB OAuth Client ID (for getting idToken on Android):
 *    - Go to Google Cloud Console > Credentials > Create OAuth client ID > Web application
 *    - No redirect URIs needed
 *    - Copy the Client ID and paste it below as GOOGLE_WEB_CLIENT_ID
 *    - This is ONLY used to exchange auth code for idToken (not for finding Android client ID)
 *
 * NOTE ABOUT CLIENT ID SECURITY:
 * - Google OAuth Client IDs are PUBLIC credentials (not secrets)
 * - Safe to include in code and commit to GitHub (like Flutter's google-services.json)
 * - Security comes from SHA-1 fingerprint restriction in Google Cloud Console
 */

// Google OAuth Web Client ID (required for getting idToken on Android)
// Get this from: https://console.cloud.google.com/apis/credentials
// Create a WEB OAuth Client ID (not Android) - no redirect URIs needed
export const GOOGLE_WEB_CLIENT_ID =
  "326138021655-4tnvd4k857q8lipkcpu4k9ka73617cmg.apps.googleusercontent.com";

// Legacy name for compatibility
export const GOOGLE_CLIENT_ID = GOOGLE_WEB_CLIENT_ID;

// Check if Google Client ID is configured
export const isGoogleConfigured = () => {
  // Check if it's not the placeholder and has a valid length
  const PLACEHOLDER = "YOUR_GOOGLE_WEB_CLIENT_ID_HERE";
  return (
    GOOGLE_CLIENT_ID !== PLACEHOLDER &&
    GOOGLE_CLIENT_ID.length > 0 &&
    GOOGLE_CLIENT_ID.includes(".apps.googleusercontent.com") // Basic validation that it looks like a Google Client ID
  );
};

export default {
  GOOGLE_CLIENT_ID,
  isGoogleConfigured,
};
