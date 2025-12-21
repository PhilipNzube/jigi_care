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
} from "../utils/storage";

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
   * Load authentication data from storage
   */
  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedToken = await getToken();
      const storedUser = await getUserData();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in user and store credentials
   * @param {object} authData - Authentication data from API
   * @param {object} authData.user - User data
   * @param {string} authData.accessToken - Access token
   */
  const signIn = async (authData) => {
    try {
      console.log("💾 [AUTH CONTEXT] Storing sign in data...");
      console.log("💾 [AUTH CONTEXT] Auth data received:", JSON.stringify(authData, null, 2));
      
      const { user: userData, accessToken } = authData;

      console.log("💾 [AUTH CONTEXT] User data:", JSON.stringify(userData, null, 2));
      console.log("💾 [AUTH CONTEXT] Access token:", accessToken ? "***" + accessToken.slice(-10) : "N/A");

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store in AsyncStorage
      await storeToken(accessToken);
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
   * @param {string} authData.accessToken - Access token
   */
  const signUp = async (authData) => {
    try {
      console.log("💾 [AUTH CONTEXT] Storing sign up data...");
      console.log("💾 [AUTH CONTEXT] Auth data received:", JSON.stringify(authData, null, 2));
      
      const { user: userData, accessToken } = authData;

      console.log("💾 [AUTH CONTEXT] User data:", JSON.stringify(userData, null, 2));
      console.log("💾 [AUTH CONTEXT] Access token:", accessToken ? "***" + accessToken.slice(-10) : "N/A");

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store in AsyncStorage
      await storeToken(accessToken);
      await storeUserData(userData);

      console.log("✅ [AUTH CONTEXT] Sign up data stored successfully!");
    } catch (error) {
      console.error("❌ [AUTH CONTEXT] Error signing up:", error);
      throw error;
    }
  };

  /**
   * Sign out user and clear all cached tokens and storage
   */
  const signOut = async () => {
    try {
      console.log("🚪 [SIGN OUT] Starting sign out process...");
      console.log("🚪 [SIGN OUT] Current user:", user ? user.email || user.id : "N/A");
      console.log("🚪 [SIGN OUT] Current token:", token ? "***" + token.slice(-10) : "N/A");
      
      // Clear state first
      console.log("🚪 [SIGN OUT] Clearing application state...");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Clear all storage (tokens, user data, and any other cached data)
      console.log("🚪 [SIGN OUT] Clearing all cached tokens and storage...");
      await clearStorage();
      
      console.log("✅ [SIGN OUT] Sign out completed successfully!");
      console.log("✅ [SIGN OUT] All tokens and cached data have been wiped out");
    } catch (error) {
      console.error("❌ [SIGN OUT] Error signing out:", error);
      console.error("❌ [SIGN OUT] Error details:", JSON.stringify(error, null, 2));
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

