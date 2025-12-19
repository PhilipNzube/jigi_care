/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { post } from "../../../shared/services/api";

/**
 * Sign up a new user
 * @param {object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.fullName - User full name
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (defaults to 'consultant')
 * @returns {Promise<object>} - Response with user data and accessToken
 */
export const signUp = async (userData) => {
  const { email, fullName, password, role = "consultant" } = userData;

  const response = await post("/users/signup", {
    email,
    fullName,
    password,
    role,
  });

  return response;
};

/**
 * Sign in an existing user
 * @param {object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<object>} - Response with user data and accessToken
 */
export const signIn = async (credentials) => {
  const { email, password } = credentials;

  const response = await post("/auth/signin", {
    email,
    password,
  });

  return response;
};

export default {
  signUp,
  signIn,
};

