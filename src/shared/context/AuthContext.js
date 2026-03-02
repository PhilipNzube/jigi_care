/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { AppState } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import {
  getToken,
  getUserData,
  storeToken,
  storeUserData,
  clearStorage,
  getRefreshToken,
  getLastActiveTime,
  storeLastActiveTime,
  getBiometricEnabled,
} from "../utils/storage";
import {
  getUserProfile,
  logout,
} from "../../features/auth/services/authService";
import { showError } from "../utils/toast";
import { resetToLogin } from "../navigation/navigationRef";

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

  // 2 minutes in milliseconds
  const LOCK_TIMEOUT = 2 * 60 * 1000;
  const appState = useRef(AppState.currentState);

  /**
   * Load stored authentication data on mount
   */
  useEffect(() => {
    loadStoredAuth();
  }, []);

  /**
   * AppState listener to handle background/foreground transitions
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("📱 [APP STATE] App has come to the foreground!");
        checkLockState();
      } else if (
        appState.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        console.log("📱 [APP STATE] App has gone to the background!");
        if (isAuthenticated) {
          await storeLastActiveTime(Date.now());
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  /**
   * Check if the app should be locked based on last active time
   */
  const checkLockState = async () => {
    if (!isAuthenticated) return;

    const lastActive = await getLastActiveTime();
    if (lastActive) {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastActive;

      console.log(`⏱️ [APP STATE] Time since last active: ${Math.floor(timeDiff / 1000)}s`);

      if (timeDiff > LOCK_TIMEOUT) {
        console.log("🔒 [APP STATE] Time limit reached");
        const biometricEnabled = await getBiometricEnabled();
        const defaultMethod = await getDefaultBiometricMethod();

        if (biometricEnabled && defaultMethod !== "password") {
          console.log(`🔒 [APP STATE] Navigating to Login with method: ${defaultMethod}`);
          resetToLogin({ defaultMethod, timeout: true });
        } else {
          console.log("🚪 [APP STATE] Biometrics disabled or unavailable. Logging user out.");
          // Pass timeout: true so LoginScreen shows the message
          signOut({ timeout: true });
        }
      }
    }
  };

  /**
   * Determine the best available biometric method for this device
   */
  const getDefaultBiometricMethod = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) return "password";
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const canFingerprint = supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
      const canFace = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
      return canFingerprint ? "fingerprint" : (canFace ? "face" : "password");
    } catch {
      return "password";
    }
  };

  /**
   * Load authentication data from storage and fetch fresh profile in background
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();
      const storedUser = await getUserData();

      if (storedToken) {
        setToken(storedToken);
        setIsAuthenticated(true);

        // Use stored user data immediately for faster navigation
        if (storedUser) {
          setUser(storedUser);
          console.log(
            "✅ [AUTH CONTEXT] Using stored user data for immediate navigation"
          );
        }

        // Check lock state — if timed out, navigate to Login
        const lastActive = await getLastActiveTime();
        if (lastActive) {
          const currentTime = Date.now();
          if (currentTime - lastActive > LOCK_TIMEOUT) {
            console.log("🔒 [AUTH CONTEXT] Time limit reached on initial load");
            const biometricEnabled = await getBiometricEnabled();
            const defaultMethod = await getDefaultBiometricMethod();
            
            if (biometricEnabled && defaultMethod !== "password") {
              console.log(`🔒 [AUTH CONTEXT] Navigating to Login (${defaultMethod}) on load`);
              setIsLoading(false);
              resetToLogin({ defaultMethod, timeout: true });
              return;
            } else {
              console.log("🚪 [AUTH CONTEXT] Biometrics disabled or unavailable. Logging user out on initial load.");
              await clearStorage();
              setIsAuthenticated(false);
              setUser(null);
              setToken(null);
              setIsLoading(false);
              // Navigate manually with timeout param since it's an initial load cleanup
              resetToLogin({ timeout: true });
              return;
            }
          }
        }

        // Set loading to false immediately to allow navigation
        setIsLoading(false);

        // Fetch fresh profile in background (non-blocking)
        loadProfileInBackground(storedToken, storedUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error loading stored auth:", error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  /**
   * Load user profile in background after navigation
   */
  const loadProfileInBackground = async (token, fallbackUser) => {
    try {
      console.log(
        "🔄 [AUTH CONTEXT] Fetching fresh user profile in background..."
      );
          const profileData = await getUserProfile();

          if (profileData) {
            setUser(profileData);
            await storeUserData(profileData);
        console.log(
          "✅ [AUTH CONTEXT] Fresh profile loaded successfully in background!"
        );
          } else {
            // Fallback to stored user data if profile fetch fails
        if (fallbackUser) {
          setUser(fallbackUser);
          console.log("⚠️ [AUTH CONTEXT] Using stored user data as fallback");
            }
          }
        } catch (profileError) {
          console.error(
        "❌ [AUTH CONTEXT] Error fetching profile in background:",
            profileError
          );

          // Check if this is a session expiration error
          const isSessionExpired =
            profileError.statusCode === 400 &&
            profileError.data?.message === "Cannot GET /signin" &&
            profileError.data?.error === "Unauthorized";

          if (isSessionExpired) {
            console.log(
              "🔒 [AUTH CONTEXT] Session expired - clearing data and redirecting to login"
            );

        // Clear all state
            setIsAuthenticated(false);
            setUser(null);
            setToken(null);

            // Clear all storage
            await clearStorage();

            // Show toast message
            showError(
              "Your session has expired. Please log in again.",
              "Session Expired"
            );

        // Navigate to login screen directly
        // Use longer delay to ensure Activity context is ready for Google Sign-In
            setTimeout(() => {
              resetToLogin();
        }, 1000);

        return;
          }

          // If profile fetch fails but we have stored user, use that
      if (fallbackUser) {
        setUser(fallbackUser);
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
        console.error(
          "❌ [AUTH CONTEXT] User data is missing from auth response"
        );
        console.error(
          "❌ [AUTH CONTEXT] Auth data:",
          JSON.stringify(authData, null, 2)
        );
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
        console.error(
          "❌ [AUTH CONTEXT] User data is missing from auth response"
        );
        console.error(
          "❌ [AUTH CONTEXT] Auth data:",
          JSON.stringify(authData, null, 2)
        );
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
   * @param {object} params - Optional navigation params for resetToLogin
   */
  const signOut = async (params = {}) => {
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
      resetToLogin(params);
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
