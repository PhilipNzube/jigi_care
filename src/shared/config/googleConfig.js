/**
 * Google OAuth Configuration
 *
 * To set up Google Sign In:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select an existing one
 * 3. Enable Google+ API (or Google Identity Services API)
 * 4. Go to "Credentials" and create an OAuth 2.0 Client ID
 * 5. For Expo, you need a "Web application" type client ID
 * 6. Add authorized redirect URIs (CRITICAL - must match exactly):
 *    - For development with Expo proxy: https://auth.expo.io/@your-username/jigicare
 *    - For custom scheme: com.jijicare.app://auth
 *    - Check the console logs to see the exact redirect URI being used
 * 7. Copy the Client ID and paste it below
 *
 * IMPORTANT: The redirect URI in Google Cloud Console MUST match exactly
 * what's shown in the console logs when you try to sign in.
 *
 * Common issues:
 * - Redirect URI not registered → Add it to "Authorized redirect URIs"
 * - Redirect URI mismatch → Must match exactly (including https://, path, etc.)
 * - Using wrong client type → Use "Web application" for Expo apps
 */

// TODO: Replace with your Google OAuth Web Client ID
// Get this from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID =
  "326138021655-4tnvd4k857q8lipkcpu4k9ka73617cmg.apps.googleusercontent.com";

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
