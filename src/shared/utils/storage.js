/**
 * Storage Utility
 * Handles token and user data storage using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "@jigi_care:access_token",
  USER_DATA: "@jigi_care:user_data",
};

/**
 * Store access token
 * @param {string} token - Access token to store
 */
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error("Error storing token:", error);
    throw error;
  }
};

/**
 * Retrieve access token
 * @returns {Promise<string|null>} - Access token or null if not found
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

/**
 * Store user data
 * @param {object} userData - User data to store
 */
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_DATA,
      JSON.stringify(userData)
    );
  } catch (error) {
    console.error("Error storing user data:", error);
    throw error;
  }
};

/**
 * Retrieve user data
 * @returns {Promise<object|null>} - User data or null if not found
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error retrieving user data:", error);
    return null;
  }
};

/**
 * Clear all stored data (logout)
 * This clears all AsyncStorage data to ensure no tokens or cached data remain
 */
export const clearStorage = async () => {
  try {
    console.log("🗑️ [STORAGE] Starting to clear all cached tokens and data...");
    
    // First, try to clear known keys
    const knownKeys = [
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ];
    
    console.log("🗑️ [STORAGE] Clearing known storage keys:", knownKeys);
    await AsyncStorage.multiRemove(knownKeys);
    
    // Get all keys to find any other app-related storage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log("🗑️ [STORAGE] All storage keys found:", allKeys);
    
    // Filter keys that belong to this app
    const appKeys = allKeys.filter(key => key.startsWith("@jigi_care:"));
    console.log("🗑️ [STORAGE] App-specific keys to clear:", appKeys);
    
    // Clear all app-specific keys (in case there are any we missed)
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
      console.log("✅ [STORAGE] Cleared", appKeys.length, "app-specific storage keys");
    }
    
    // Verify everything is cleared
    const remainingKeys = await AsyncStorage.getAllKeys();
    const remainingAppKeys = remainingKeys.filter(key => key.startsWith("@jigi_care:"));
    
    if (remainingAppKeys.length === 0) {
      console.log("✅ [STORAGE] All cached tokens and data successfully cleared!");
    } else {
      console.warn("⚠️ [STORAGE] Some keys may still remain:", remainingAppKeys);
      // Force clear any remaining app keys
      if (remainingAppKeys.length > 0) {
        await AsyncStorage.multiRemove(remainingAppKeys);
        console.log("✅ [STORAGE] Force cleared remaining keys");
      }
    }
  } catch (error) {
    console.error("❌ [STORAGE] Error clearing storage:", error);
    throw error;
  }
};

/**
 * Check if user is authenticated (has token)
 * @returns {Promise<boolean>} - True if token exists
 */
export const isAuthenticated = async () => {
  try {
    const token = await getToken();
    return token !== null;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export default {
  storeToken,
  getToken,
  storeUserData,
  getUserData,
  clearStorage,
  isAuthenticated,
};

