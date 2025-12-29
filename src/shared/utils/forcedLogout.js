/**
 * Forced Logout Utility
 * Handles forced logout when refresh token fails (without calling logout API)
 */

import { clearStorage } from "./storage";
import { resetToLogin } from "../navigation/navigationRef";

/**
 * Force logout user by clearing all cached data and navigating to login
 * This is used when refresh token fails and we need to log the user out
 * without calling the logout API
 */
export const forceLogout = async () => {
  try {
    console.log("🚪 [FORCED LOGOUT] Starting forced logout...");
    console.log("🚪 [FORCED LOGOUT] Refresh token failed - clearing all cached data");

    // Clear all storage (tokens, user data, and any other cached data)
    await clearStorage();
    console.log("✅ [FORCED LOGOUT] All cached data cleared");

    // Navigate to login screen
    resetToLogin();
    console.log("✅ [FORCED LOGOUT] User redirected to login screen");
  } catch (error) {
    console.error("❌ [FORCED LOGOUT] Error during forced logout:", error);
    // Even if navigation fails, try to navigate anyway
    try {
      resetToLogin();
    } catch (navError) {
      console.error("❌ [FORCED LOGOUT] Error navigating to login:", navError);
    }
  }
};

export default {
  forceLogout,
};

