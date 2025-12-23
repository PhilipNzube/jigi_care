/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import {
  getToken,
  getUserData,
  storeToken,
  storeUserData,
  clearStorage,
  getRefreshToken,
} from "../utils/storage";
import {
  getUserProfile,
  logout,
} from "../../features/auth/services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Load stored authentication data on mount
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * Load authentication data from storage and fetch fresh profile
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();
      const storedUser = await getUserData();

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);

        // If we have a token, try to fetch fresh user profile
        try {
          console.log("🔄 [AUTH CONTEXT] Fetching fresh user profile...");
          const profileData = await getUserProfile();

          if (profileData) {
            setUser(profileData);
            await storeUserData(profileData);
            console.log("✅ [AUTH CONTEXT] Fresh profile loaded successfully!");
          } else {
            // Fallback to stored user data if profile fetch fails
            if (storedUser) {
              setUser(storedUser);
              console.log(
                "⚠️ [AUTH CONTEXT] Using stored user data as fallback"
              );
            }
          }
        } catch (profileError) {
          console.error(
            "❌ [AUTH CONTEXT] Error fetching profile:",
            profileError
          );
          // If profile fetch fails but we have stored user, use that
          if (storedUser) {
            setUser(storedUser);
            console.log(
              "⚠️ [AUTH CONTEXT] Using stored user data due to profile fetch error"
            );
          } else {
            // If no stored user and profile fetch fails, sign out
            console.log(
              "⚠️ [AUTH CONTEXT] No stored user and profile fetch failed, signing out"
            );
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);
            await clearStorage();
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error loading stored auth:", error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in user and store credentials
   * @param {object} authData - Authentication data from API
   * @param {object} authData.user - User data
   * @param {string} authData.accessToken - Access token (optional, tokens now come from headers)
   */
  const signIn = async (authData) => {
    try {
      console.log("💾 [AUTH CONTEXT] Storing sign in data...");
      console.log(
        "💾 [AUTH CONTEXT] Auth data received:",
        JSON.stringify(authData, null, 2)
      );

      const { user: userData } = authData;

      // Validate user data exists
      if (!userData) {
        console.error("❌ [AUTH CONTEXT] User data is missing from auth response");
        console.error("❌ [AUTH CONTEXT] Auth data:", JSON.stringify(authData, null, 2));
        throw new Error("User data is missing from authentication response");
      }

      // Get tokens from storage (they were stored by api.js from response headers)
      const accessToken = await getToken();
      const refreshToken = await getRefreshToken();

      console.log(
        "💾 [AUTH CONTEXT] User data:",
        JSON.stringify(userData, null, 2)
      );
      console.log(
        "💾 [AUTH CONTEXT] Access token:",
        accessToken ? "***" + accessToken.slice(-10) : "N/A"
      );
      console.log(
        "💾 [AUTH CONTEXT] Refresh token:",
        refreshToken ? "***" + refreshToken.slice(-10) : "N/A"
      );

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store user data in AsyncStorage (tokens already stored by api.js)
      await storeUserData(userData);

      console.log("✅ [AUTH CONTEXT] Sign in data stored successfully!");
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error signing in:", error);
      throw error;
    }
  };

  /**
   * Sign up user and store credentials
   * @param {object} authData - Authentication data from API
   * @param {object} authData.user - User data
   * @param {string} authData.accessToken - Access token (optional, tokens now come from headers)
   */
  const signUp = async (authData) => {
    try {
      console.log("💾 [AUTH CONTEXT] Storing sign up data...");
      console.log(
        "💾 [AUTH CONTEXT] Auth data received:",
        JSON.stringify(authData, null, 2)
      );

      const { user: userData } = authData;

      // Validate user data exists
      if (!userData) {
        console.error("❌ [AUTH CONTEXT] User data is missing from auth response");
        console.error("❌ [AUTH CONTEXT] Auth data:", JSON.stringify(authData, null, 2));
        throw new Error("User data is missing from authentication response");
      }

      // Get tokens from storage (they were stored by api.js from response headers)
      const accessToken = await getToken();
      const refreshToken = await getRefreshToken();

      console.log(
        "💾 [AUTH CONTEXT] User data:",
        JSON.stringify(userData, null, 2)
      );
      console.log(
        "💾 [AUTH CONTEXT] Access token:",
        accessToken ? "***" + accessToken.slice(-10) : "N/A"
      );
      console.log(
        "💾 [AUTH CONTEXT] Refresh token:",
        refreshToken ? "***" + refreshToken.slice(-10) : "N/A"
      );

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store user data in AsyncStorage (tokens already stored by api.js)
      await storeUserData(userData);

      console.log("✅ [AUTH CONTEXT] Sign up data stored successfully!");
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error signing up:", error);
      throw error;
    }
  };

  /**
   * Sign out user and clear all cached tokens and storage
   * Only proceeds with local logout if server request succeeds
   */
  const signOut = async () => {
    try {
      console.log("🚪 [SIGN OUT] Starting sign out process...");
      console.log(
        "🚪 [SIGN OUT] Current user:",
        user ? user.email || user.id : "N/A"
      );
      console.log(
        "🚪 [SIGN OUT] Current token:",
        token ? "***" + token.slice(-10) : "N/A"
      );

      // Call logout API first - if this fails, we don't proceed with local logout
      console.log("🚪 [SIGN OUT] Calling logout API...");
      await logout();
      console.log("✅ [SIGN OUT] Logout API call successful!");

      // Only proceed with local sign out if API call succeeds
      // Clear state
      console.log("🚪 [SIGN OUT] Clearing application state...");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Clear all storage (tokens, user data, and any other cached data)
      console.log("🚪 [SIGN OUT] Clearing all cached tokens and storage...");
      await clearStorage();

      console.log("✅ [SIGN OUT] Sign out completed successfully!");
      console.log(
        "✅ [SIGN OUT] All tokens and cached data have been wiped out"
      );
    } catch (error) {
      console.error("❌ [SIGN OUT] Error signing out:", error);
      console.error(
        "❌ [SIGN OUT] Error details:",
        JSON.stringify(error, null, 2)
      );
      console.error(
        "❌ [SIGN OUT] Logout API call failed - NOT proceeding with local logout"
      );
      // Re-throw error so caller knows logout failed and can handle accordingly
      throw error;
    }
  };

  /**
   * Update user data
   * @param {object} userData - Updated user data
   */
  const updateUser = async (userData) => {
    try {
      setUser(userData);
      await storeUserData(userData);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    updateUser,
    loadStoredAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
