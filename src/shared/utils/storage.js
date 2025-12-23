/**
 * Storage Utility
 * Handles token and user data storage using AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  ACCESS_TOKEN: "@jigi_care:access_token",
  REFRESH_TOKEN: "@jigi_care:refresh_token",
  USER_DATA: "@jigi_care:user_data",
  SIGN_IN_RESPONSE: "@jigi_care:sign_in_response",
  SIGN_UP_RESPONSE: "@jigi_care:sign_up_response",
  GOOGLE_SIGN_IN_RESPONSE: "@jigi_care:google_sign_in_response",
  PROFILE_RESPONSE: "@jigi_care:profile_response",
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
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.SIGN_IN_RESPONSE,
      STORAGE_KEYS.SIGN_UP_RESPONSE,
      STORAGE_KEYS.GOOGLE_SIGN_IN_RESPONSE,
      STORAGE_KEYS.PROFILE_RESPONSE,
    ];

    console.log("🗑️ [STORAGE] Clearing known storage keys:", knownKeys);
    await AsyncStorage.multiRemove(knownKeys);

    // Get all keys to find any other app-related storage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log("🗑️ [STORAGE] All storage keys found:", allKeys);

    // Filter keys that belong to this app
    const appKeys = allKeys.filter((key) => key.startsWith("@jigi_care:"));
    console.log("🗑️ [STORAGE] App-specific keys to clear:", appKeys);

    // Clear all app-specific keys (in case there are any we missed)
    if (appKeys.length > 0) {
      await AsyncStorage.multiRemove(appKeys);
      console.log(
        "✅ [STORAGE] Cleared",
        appKeys.length,
        "app-specific storage keys"
      );
    }

    // Verify everything is cleared
    const remainingKeys = await AsyncStorage.getAllKeys();
    const remainingAppKeys = remainingKeys.filter((key) =>
      key.startsWith("@jigi_care:")
    );

    if (remainingAppKeys.length === 0) {
      console.log(
        "✅ [STORAGE] All cached tokens and data successfully cleared!"
      );
    } else {
      console.warn(
        "⚠️ [STORAGE] Some keys may still remain:",
        remainingAppKeys
      );
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
 * Store refresh token
 * @param {string} token - Refresh token to store
 */
export const storeRefreshToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error("Error storing refresh token:", error);
    throw error;
  }
};

/**
 * Retrieve refresh token
 * @returns {Promise<string|null>} - Refresh token or null if not found
 */
export const getRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    console.error("Error retrieving refresh token:", error);
    return null;
  }
};

/**
 * Store response data
 * @param {string} key - Storage key
 * @param {object} responseData - Response data to store
 */
export const storeResponseData = async (key, responseData) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(responseData));
    console.log("💾 [STORAGE] Cached response data for:", key);
  } catch (error) {
    console.error("Error storing response data:", error);
    throw error;
  }
};

/**
 * Retrieve response data
 * @param {string} key - Storage key
 * @returns {Promise<object|null>} - Response data or null if not found
 */
export const getResponseData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error retrieving response data:", error);
    return null;
  }
};

/**
 * Store sign in response
 * @param {object} responseData - Sign in response data
 */
export const storeSignInResponse = async (responseData) => {
  return storeResponseData(STORAGE_KEYS.SIGN_IN_RESPONSE, responseData);
};

/**
 * Retrieve sign in response
 * @returns {Promise<object|null>} - Sign in response data or null
 */
export const getSignInResponse = async () => {
  return getResponseData(STORAGE_KEYS.SIGN_IN_RESPONSE);
};

/**
 * Store sign up response
 * @param {object} responseData - Sign up response data
 */
export const storeSignUpResponse = async (responseData) => {
  return storeResponseData(STORAGE_KEYS.SIGN_UP_RESPONSE, responseData);
};

/**
 * Retrieve sign up response
 * @returns {Promise<object|null>} - Sign up response data or null
 */
export const getSignUpResponse = async () => {
  return getResponseData(STORAGE_KEYS.SIGN_UP_RESPONSE);
};

/**
 * Store Google sign in response
 * @param {object} responseData - Google sign in response data
 */
export const storeGoogleSignInResponse = async (responseData) => {
  return storeResponseData(STORAGE_KEYS.GOOGLE_SIGN_IN_RESPONSE, responseData);
};

/**
 * Retrieve Google sign in response
 * @returns {Promise<object|null>} - Google sign in response data or null
 */
export const getGoogleSignInResponse = async () => {
  return getResponseData(STORAGE_KEYS.GOOGLE_SIGN_IN_RESPONSE);
};

/**
 * Store profile response
 * @param {object} responseData - Profile response data
 */
export const storeProfileResponse = async (responseData) => {
  return storeResponseData(STORAGE_KEYS.PROFILE_RESPONSE, responseData);
};

/**
 * Retrieve profile response
 * @returns {Promise<object|null>} - Profile response data or null
 */
export const getProfileResponse = async () => {
  return getResponseData(STORAGE_KEYS.PROFILE_RESPONSE);
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
  storeRefreshToken,
  getRefreshToken,
  storeUserData,
  getUserData,
  storeResponseData,
  getResponseData,
  storeSignInResponse,
  getSignInResponse,
  storeSignUpResponse,
  getSignUpResponse,
  storeGoogleSignInResponse,
  getGoogleSignInResponse,
  storeProfileResponse,
  getProfileResponse,
  clearStorage,
  isAuthenticated,
};
