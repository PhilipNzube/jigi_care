/**
 * Google Sign In Service
 * Handles Google authentication using @react-native-google-signin/google-signin
 * Native implementation for npx expo run:android builds
 */

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

/**
 * Configure Google Sign In
 * Call this once when your app starts (e.g., in App.js or AuthContext)
 * @param {string} webClientId - Google OAuth Web Client ID (for getting idToken)
 */
export const configureGoogleSignIn = async (webClientId) => {
  try {
    GoogleSignin.configure({
      webClientId: webClientId, // Required for getting idToken on Android
      offlineAccess: true, // If you want to access Google API on behalf of the user FROM YOUR SERVER
      forceCodeForRefreshToken: true, // Get [android/ios] refresh token on user sign in
    });
    console.log("✅ [GOOGLE SERVICE] Google Sign-In configured successfully");
  } catch (error) {
    console.error(
      "❌ [GOOGLE SERVICE] Failed to configure Google Sign-In:",
      error
    );
    throw error;
  }
};

/**
 * Sign in with Google
 * @param {string} webClientId - Google OAuth Web Client ID (optional if already configured)
 * @returns {Promise<object>} - Google user info with idToken
 */
export const signInWithGoogle = async (webClientId) => {
  try {
    console.log("🔵 [GOOGLE SERVICE] Starting Google authentication...");
    console.log("🔵 [GOOGLE SERVICE] Platform:", Platform.OS);

    // Configure if webClientId is provided
    if (webClientId) {
      await configureGoogleSignIn(webClientId);
    }

    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    console.log("🔵 [GOOGLE SERVICE] Google Play Services available");

    // Sign in
    const userInfo = await GoogleSignin.signIn();

    console.log("✅ [GOOGLE SERVICE] Google Sign-In successful!");
    console.log(
      "✅ [GOOGLE SERVICE] Full user info response:",
      JSON.stringify(userInfo, null, 2)
    );

    // Get tokens (includes idToken)
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;

    console.log(
      "✅ [GOOGLE SERVICE] ID Token received:",
      idToken ? "***" + idToken.slice(-10) : "N/A"
    );
    console.log(
      "✅ [GOOGLE SERVICE] Access Token received:",
      tokens.accessToken ? "***" + tokens.accessToken.slice(-10) : "N/A"
    );

    if (!idToken) {
      throw new Error("ID Token not received from Google");
    }

    // Extract user data from response
    const user = userInfo.user || userInfo.data?.user || userInfo;

    const googleUserData = {
      id: user.id || userInfo.id,
      email: user.email || userInfo.email,
      name: user.name || userInfo.name,
      givenName: user.givenName || userInfo.givenName,
      familyName: user.familyName || userInfo.familyName,
      picture: user.photo || user.picture || userInfo.photo || userInfo.picture,
      idToken: idToken, // Used only for backend API call - DO NOT STORE/CACHE this token
      accessToken: tokens.accessToken, // Google access token - DO NOT STORE/CACHE this token
    };

    console.log(
      "✅ [GOOGLE SERVICE] Google authentication completed successfully!"
    );
    console.log(
      "✅ [GOOGLE SERVICE] Returning Google user data:",
      JSON.stringify(
        {
          ...googleUserData,
          idToken: idToken ? "***" + idToken.slice(-10) : "N/A",
          accessToken: tokens.accessToken
            ? "***" + tokens.accessToken.slice(-10)
            : "N/A",
        },
        null,
        2
      )
    );

    return googleUserData;
  } catch (error) {
    console.error("❌ [GOOGLE SERVICE] Google Sign In Error:", error);
    console.error(
      "❌ [GOOGLE SERVICE] Error details:",
      JSON.stringify(error, null, 2)
    );

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("ℹ️ [GOOGLE SERVICE] User cancelled the sign-in flow");
      throw new Error("Google sign in was cancelled");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("ℹ️ [GOOGLE SERVICE] Sign-in operation is in progress");
      throw new Error("Google sign in is already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error("❌ [GOOGLE SERVICE] Google Play Services not available");
      throw new Error("Google Play Services not available");
    } else {
      throw error;
    }
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    console.log("✅ [GOOGLE SERVICE] Signed out from Google");
  } catch (error) {
    console.error("❌ [GOOGLE SERVICE] Error signing out:", error);
    throw error;
  }
};

export default {
  configureGoogleSignIn,
  signInWithGoogle,
  signOutFromGoogle,
};
