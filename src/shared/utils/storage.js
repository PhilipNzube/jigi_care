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
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error("Error clearing storage:", error);
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

