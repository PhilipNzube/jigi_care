/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { post, get } from "../../../shared/services/api";

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

  console.log("📝 [SIGN UP] Starting sign up process...");
  console.log("📝 [SIGN UP] Request data:", {
    email,
    fullName,
    role,
    password: "***", // Don't log password
  });

  const response = await post("/users/signup", {
    email,
    fullName,
    password,
    role,
  });

  console.log("✅ [SIGN UP] Sign up successful!");
  console.log("✅ [SIGN UP] Full response data:", JSON.stringify(response, null, 2));
  console.log("✅ [SIGN UP] User data:", JSON.stringify(response.user, null, 2));
  console.log("✅ [SIGN UP] Access token:", response.accessToken ? "***" + response.accessToken.slice(-10) : "N/A");

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

  console.log("🔐 [SIGN IN] Starting sign in process...");
  console.log("🔐 [SIGN IN] Request data:", {
    email,
    password: "***", // Don't log password
  });

  const response = await post("/auth/signin", {
    email,
    password,
  });

  console.log("✅ [SIGN IN] Sign in successful!");
  console.log("✅ [SIGN IN] Full response data:", JSON.stringify(response, null, 2));
  console.log("✅ [SIGN IN] User data:", JSON.stringify(response.user, null, 2));
  console.log("✅ [SIGN IN] Access token:", response.accessToken ? "***" + response.accessToken.slice(-10) : "N/A");

  return response;
};

/**
 * Sign in with Google (mobile)
 * @param {object} googleData - Google authentication data
 * @param {string} googleData.idToken - Google ID token
 * @param {string} googleData.role - User role (defaults to 'consultant')
 * @returns {Promise<object>} - Response with user data and accessToken
 */
export const signInWithGoogle = async (googleData) => {
  const { idToken, role = "consultant" } = googleData;

  console.log("🔵 [GOOGLE SIGN IN] Starting Google sign in process...");
  console.log("🔵 [GOOGLE SIGN IN] Request params:", {
    role,
    idToken: idToken ? "***" + idToken.slice(-10) : "N/A",
  });
  console.log("🔵 [GOOGLE SIGN IN] Full idToken (first 50 chars):", idToken ? idToken.substring(0, 50) + "..." : "N/A");

  // Use GET request with query params as specified
  const endpoint = `/auth/google/mobile-signin?role=${encodeURIComponent(role)}&idToken=${encodeURIComponent(idToken)}`;
  
  console.log("🔵 [GOOGLE SIGN IN] Making GET request to:", endpoint.replace(/idToken=[^&]+/, "idToken=***"));

  const response = await get(endpoint);

  console.log("✅ [GOOGLE SIGN IN] Google sign in successful!");
  console.log("✅ [GOOGLE SIGN IN] Full response data:", JSON.stringify(response, null, 2));
  console.log("✅ [GOOGLE SIGN IN] Response type:", typeof response);
  console.log("✅ [GOOGLE SIGN IN] Response keys:", Object.keys(response || {}));
  
  if (response.user) {
    console.log("✅ [GOOGLE SIGN IN] User data:", JSON.stringify(response.user, null, 2));
    console.log("✅ [GOOGLE SIGN IN] User ID:", response.user.id || response.user._id || "N/A");
    console.log("✅ [GOOGLE SIGN IN] User email:", response.user.email || "N/A");
    console.log("✅ [GOOGLE SIGN IN] User name:", response.user.fullName || response.user.name || "N/A");
  }
  
  if (response.accessToken) {
    console.log("✅ [GOOGLE SIGN IN] Access token:", "***" + response.accessToken.slice(-10));
  } else {
    console.warn("⚠️ [GOOGLE SIGN IN] No access token in response");
  }

  return response;
};

/**
 * Sign up with Google (mobile) - Uses same endpoint as sign in
 * @param {object} googleData - Google authentication data
 * @param {string} googleData.idToken - Google ID token
 * @param {string} googleData.role - User role (defaults to 'consultant')
 * @returns {Promise<object>} - Response with user data and accessToken
 */
export const signUpWithGoogle = async (googleData) => {
  const { idToken, role = "consultant" } = googleData;

  console.log("🔵 [GOOGLE SIGN UP] Starting Google sign up process...");
  console.log("🔵 [GOOGLE SIGN UP] Request params:", {
    role,
    idToken: idToken ? "***" + idToken.slice(-10) : "N/A",
  });
  console.log("🔵 [GOOGLE SIGN UP] Full idToken (first 50 chars):", idToken ? idToken.substring(0, 50) + "..." : "N/A");

  // Use GET request with query params - same endpoint handles both sign in and sign up
  const endpoint = `/auth/google/mobile-signin?role=${encodeURIComponent(role)}&idToken=${encodeURIComponent(idToken)}`;
  
  console.log("🔵 [GOOGLE SIGN UP] Making GET request to:", endpoint.replace(/idToken=[^&]+/, "idToken=***"));

  const response = await get(endpoint);

  console.log("✅ [GOOGLE SIGN UP] Google sign up successful!");
  console.log("✅ [GOOGLE SIGN UP] Full response data:", JSON.stringify(response, null, 2));
  console.log("✅ [GOOGLE SIGN UP] Response type:", typeof response);
  console.log("✅ [GOOGLE SIGN UP] Response keys:", Object.keys(response || {}));
  
  if (response.user) {
    console.log("✅ [GOOGLE SIGN UP] User data:", JSON.stringify(response.user, null, 2));
    console.log("✅ [GOOGLE SIGN UP] User ID:", response.user.id || response.user._id || "N/A");
    console.log("✅ [GOOGLE SIGN UP] User email:", response.user.email || "N/A");
    console.log("✅ [GOOGLE SIGN UP] User name:", response.user.fullName || response.user.name || "N/A");
  }
  
  if (response.accessToken) {
    console.log("✅ [GOOGLE SIGN UP] Access token:", "***" + response.accessToken.slice(-10));
  } else {
    console.warn("⚠️ [GOOGLE SIGN UP] No access token in response");
  }

  return response;
};

export default {
  signUp,
  signIn,
  signInWithGoogle,
  signUpWithGoogle,
};

