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
      const { user: userData, accessToken } = authData;

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store in AsyncStorage
      await storeToken(accessToken);
      await storeUserData(userData);
    } catch (error) {
      console.error("Error signing in:", error);
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
      const { user: userData, accessToken } = authData;

      // Store in state
      setUser(userData);
      setToken(accessToken);
      setIsAuthenticated(true);

      // Store in AsyncStorage
      await storeToken(accessToken);
      await storeUserData(userData);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  /**
   * Sign out user and clear storage
   */
  const signOut = async () => {
    try {
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Clear storage
      await clearStorage();
    } catch (error) {
      console.error("Error signing out:", error);
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

