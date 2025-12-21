/**
 * Google Sign In Service
 * Handles Google authentication using expo-auth-session
 */

import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

// Complete the auth session for better UX
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

/**
 * Initialize Google Sign In
 * @param {string} clientId - Google OAuth client ID (Web client ID)
 * @returns {Promise<object>} - Google user info
 */
export const signInWithGoogle = async (clientId) => {
  try {
    console.log("🔵 [GOOGLE SERVICE] Starting Google authentication...");
    console.log(
      "🔵 [GOOGLE SERVICE] Client ID:",
      clientId ? "***" + clientId.slice(-10) : "N/A"
    );
    console.log("🔵 [GOOGLE SERVICE] Platform:", Platform.OS);

    // Create redirect URI - use Expo's proxy for development
    // For production, you may want to use the custom scheme instead
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "com.jijicare.app", // Match the package name from app.json
      path: "auth",
      useProxy: true, // Use Expo's proxy - this generates https://auth.expo.io/@username/slug
    });

    console.log("🔵 [GOOGLE SERVICE] Redirect URI:", redirectUri);
    console.log(
      "⚠️ [GOOGLE SERVICE] IMPORTANT: Make sure this redirect URI is registered in Google Cloud Console!"
    );
    console.log(
      "⚠️ [GOOGLE SERVICE] Go to: https://console.cloud.google.com/apis/credentials"
    );
    console.log(
      "⚠️ [GOOGLE SERVICE] Edit your OAuth 2.0 Client ID and add this URI to 'Authorized redirect URIs'"
    );

    // Create auth request - Request both token and id_token
    // For Google OAuth, we need to request id_token explicitly
    // Disable PKCE for implicit flow (token response type doesn't support PKCE)
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Token, // Use Token to get access_token
      redirectUri: redirectUri,
      usePKCE: false, // Disable PKCE for implicit flow (token response type)
      extraParams: {},
      additionalParameters: {
        // Request id_token explicitly
        response_type: "token id_token",
      },
    });

    // Get authorization URL
    const authUrl = await request.makeAuthUrlAsync(discovery);
    console.log("🔵 [GOOGLE SERVICE] Auth URL created");

    // Open browser for authentication - use promptAsync instead of startAsync
    console.log("🔵 [GOOGLE SERVICE] Opening browser for authentication...");
    const result = await request.promptAsync(discovery);

    console.log("🔵 [GOOGLE SERVICE] Auth result type:", result.type);

    if (result.type === "success") {
      console.log("🔵 [GOOGLE SERVICE] Authentication successful!");
      console.log(
        "🔵 [GOOGLE SERVICE] Full result params:",
        JSON.stringify(result.params, null, 2)
      );

      // Get idToken from result
      const idToken = result.params.id_token;
      const accessToken = result.params.access_token;

      console.log(
        "🔵 [GOOGLE SERVICE] ID Token received:",
        idToken ? "***" + idToken.slice(-10) : "N/A"
      );
      console.log(
        "🔵 [GOOGLE SERVICE] Access token received:",
        accessToken ? "***" + accessToken.slice(-10) : "N/A"
      );

      if (!idToken) {
        throw new Error("ID Token not received from Google");
      }

      // Get user info from Google using access token if available, otherwise decode idToken
      let userInfo = {};
      if (accessToken) {
        console.log(
          "🔵 [GOOGLE SERVICE] Fetching user info from Google using access token..."
        );
        const userInfoResponse = await fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
        );

        if (userInfoResponse.ok) {
          userInfo = await userInfoResponse.json();
          console.log(
            "🔵 [GOOGLE SERVICE] User info received:",
            JSON.stringify(userInfo, null, 2)
          );
        } else {
          console.warn(
            "⚠️ [GOOGLE SERVICE] Failed to fetch user info, will use idToken only"
          );
        }
      }

      const googleUserData = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        givenName: userInfo.given_name,
        familyName: userInfo.family_name,
        picture: userInfo.picture,
        accessToken: accessToken,
        idToken: idToken, // This is the important one for the backend
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
            accessToken: accessToken ? "***" + accessToken.slice(-10) : "N/A",
          },
          null,
          2
        )
      );

      return googleUserData;
    } else if (result.type === "cancel") {
      console.log("ℹ️ [GOOGLE SERVICE] User cancelled authentication");
      throw new Error("Google sign in was cancelled");
    } else {
      console.error("❌ [GOOGLE SERVICE] Authentication failed:", result);
      throw new Error("Google sign in failed");
    }
  } catch (error) {
    console.error("❌ [GOOGLE SERVICE] Google Sign In Error:", error);
    console.error(
      "❌ [GOOGLE SERVICE] Error details:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
};

export default {
  signInWithGoogle,
};
