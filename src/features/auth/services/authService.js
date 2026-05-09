/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { post, get, patch, del } from "../../../shared/services/api";
import {
  storeSignInResponse,
  storeSignUpResponse,
  storeGoogleSignInResponse,
  storeProfileResponse,
} from "../../../shared/utils/storage";

/**
 * Sign up a new user
 * @param {object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.fullName - User full name
 * @param {string} userData.password - User password
 * @param {string} userData.role - User role (defaults to 'patient')
 * @returns {Promise<object>} - Response with user data and accessToken
 */
export const signUp = async (userData) => {
  const { email, fullName, password, role = "patient", otp } = userData;

  console.log("📝 [SIGN UP] Starting sign up process...");
  console.log("📝 [SIGN UP] Request data:", {
    email,
    fullName,
    role,
    otp: otp ? "***" : undefined,
    password: "***", // Don't log password
  });

  const requestBody = {
    email,
    fullName,
    password,
    role,
  };

  // Add OTP if provided
  if (otp) {
    requestBody.otp = otp;
  }

  const response = await post("/users/signup", requestBody);

  console.log("✅ [SIGN UP] Sign up successful!");
  console.log(
    "✅ [SIGN UP] Full response data:",
    JSON.stringify(response, null, 2)
  );

  // Cache the full response data
  try {
    await storeSignUpResponse(response);
    console.log("💾 [SIGN UP] Response data cached successfully!");
  } catch (cacheError) {
    console.warn("⚠️ [SIGN UP] Failed to cache response data:", cacheError);
  }

  // Handle new response format: response.data contains user data
  // Tokens are now in response headers (handled by api.js)
  const userDataFromResponse = response.data || response.user;
  console.log(
    "✅ [SIGN UP] User data:",
    JSON.stringify(userDataFromResponse, null, 2)
  );
  console.log(
    "✅ [SIGN UP] Note: Access token is stored from response headers (x-access-token)"
  );

  // Return in the format expected by AuthContext
  return {
    user: userDataFromResponse,
    accessToken: null, // Token is stored from headers, not needed here
    response, // Include full response for caching
  };
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
  console.log(
    "✅ [SIGN IN] Full response data:",
    JSON.stringify(response, null, 2)
  );

  // Cache the full response data
  try {
    await storeSignInResponse(response);
    console.log("💾 [SIGN IN] Response data cached successfully!");
  } catch (cacheError) {
    console.warn("⚠️ [SIGN IN] Failed to cache response data:", cacheError);
  }

  // Handle new response format: response.data contains user data
  // Tokens are now in response headers (handled by api.js)
  const userDataFromResponse = response.data || response.user;
  console.log(
    "✅ [SIGN IN] User data:",
    JSON.stringify(userDataFromResponse, null, 2)
  );
  console.log(
    "✅ [SIGN IN] Note: Access token is stored from response headers (x-access-token)"
  );

  // Return in the format expected by AuthContext
  return {
    user: userDataFromResponse,
    accessToken: null, // Token is stored from headers, not needed here
    response, // Include full response for caching
  };
};

/**
 * Sign in with Google (mobile)
 * @param {object} googleData - Google authentication data
 * @param {string} googleData.idToken - Google ID token (used only for API call, NOT stored)
 * @param {string} googleData.role - User role (defaults to 'patient')
 * @returns {Promise<object>} - Response with user data
 *
 * NOTE: The Google idToken is only used to authenticate with the backend.
 * We do NOT cache/store the Google idToken. Only tokens from response headers
 * (x-access-token, x-refresh-token) are stored by api.js
 */
export const signInWithGoogle = async (googleData) => {
  const { idToken, role = "patient" } = googleData;

  console.log("🔵 [GOOGLE SIGN IN] Starting Google sign in process...");
  console.log("🔵 [GOOGLE SIGN IN] Request params:", {
    role,
    idToken: idToken ? "***" + idToken.slice(-10) : "N/A",
  });
  console.log(
    "🔵 [GOOGLE SIGN IN] Full idToken (first 50 chars):",
    idToken ? idToken.substring(0, 50) + "..." : "N/A"
  );
  console.log(
    "🔵 [GOOGLE SIGN IN] NOTE: Google idToken is used only for API call and will NOT be cached/stored"
  );

  // Use GET request with query params as specified
  // The idToken is sent to backend but NOT stored - only backend tokens from headers are stored
  const endpoint = `/auth/google/mobile-signin?role=${encodeURIComponent(role)}&idToken=${encodeURIComponent(idToken)}`;

  console.log(
    "🔵 [GOOGLE SIGN IN] Making GET request to:",
    endpoint.replace(/idToken=[^&]+/, "idToken=***")
  );

  const response = await get(endpoint);

  console.log("✅ [GOOGLE SIGN IN] Google sign in successful!");
  console.log(
    "✅ [GOOGLE SIGN IN] Full response data:",
    JSON.stringify(response, null, 2)
  );
  console.log("✅ [GOOGLE SIGN IN] Response type:", typeof response);
  console.log(
    "✅ [GOOGLE SIGN IN] Response keys:",
    Object.keys(response || {})
  );

  // Cache the full response data
  try {
    await storeGoogleSignInResponse(response);
    console.log("💾 [GOOGLE SIGN IN] Response data cached successfully!");
  } catch (cacheError) {
    console.warn(
      "⚠️ [GOOGLE SIGN IN] Failed to cache response data:",
      cacheError
    );
  }

  // Handle new response format: response.data contains user data
  // Tokens are now in response headers (handled by api.js)
  const userDataFromResponse = response.data || response.user;

  if (userDataFromResponse) {
    console.log(
      "✅ [GOOGLE SIGN IN] User data:",
      JSON.stringify(userDataFromResponse, null, 2)
    );
    console.log(
      "✅ [GOOGLE SIGN IN] User ID:",
      userDataFromResponse.id || userDataFromResponse._id || "N/A"
    );
    console.log(
      "✅ [GOOGLE SIGN IN] User email:",
      userDataFromResponse.email || "N/A"
    );
    console.log(
      "✅ [GOOGLE SIGN IN] User name:",
      userDataFromResponse.fullName || userDataFromResponse.name || "N/A"
    );
  }

  console.log(
    "✅ [GOOGLE SIGN IN] Note: Access token is stored from response headers (x-access-token)"
  );

  // Return in the format expected by AuthContext
  return {
    user: userDataFromResponse,
    accessToken: null, // Token is stored from headers, not needed here
    response, // Include full response for caching
  };
};

/**
 * Sign up with Google (mobile) - Uses same endpoint as sign in
 * @param {object} googleData - Google authentication data
 * @param {string} googleData.idToken - Google ID token (used only for API call, NOT stored)
 * @param {string} googleData.role - User role (defaults to 'patient')
 * @returns {Promise<object>} - Response with user data
 *
 * NOTE: The Google idToken is only used to authenticate with the backend.
 * We do NOT cache/store the Google idToken. Only tokens from response headers
 * (x-access-token, x-refresh-token) are stored by api.js
 */
export const signUpWithGoogle = async (googleData) => {
  const { idToken, role = "patient" } = googleData;

  console.log("🔵 [GOOGLE SIGN UP] Starting Google sign up process...");
  console.log("🔵 [GOOGLE SIGN UP] Request params:", {
    role,
    idToken: idToken ? "***" + idToken.slice(-10) : "N/A",
  });
  console.log(
    "🔵 [GOOGLE SIGN UP] Full idToken (first 50 chars):",
    idToken ? idToken.substring(0, 50) + "..." : "N/A"
  );
  console.log(
    "🔵 [GOOGLE SIGN UP] NOTE: Google idToken is used only for API call and will NOT be cached/stored"
  );

  // Use GET request with query params - same endpoint handles both sign in and sign up
  // The idToken is sent to backend but NOT stored - only backend tokens from headers are stored
  const endpoint = `/auth/google/mobile-signin?role=${encodeURIComponent(role)}&idToken=${encodeURIComponent(idToken)}`;

  console.log(
    "🔵 [GOOGLE SIGN UP] Making GET request to:",
    endpoint.replace(/idToken=[^&]+/, "idToken=***")
  );

  const response = await get(endpoint);

  console.log("✅ [GOOGLE SIGN UP] Google sign up successful!");
  console.log(
    "✅ [GOOGLE SIGN UP] Full response data:",
    JSON.stringify(response, null, 2)
  );
  console.log("✅ [GOOGLE SIGN UP] Response type:", typeof response);
  console.log(
    "✅ [GOOGLE SIGN UP] Response keys:",
    Object.keys(response || {})
  );

  // Cache the full response data
  try {
    await storeGoogleSignInResponse(response);
    console.log("💾 [GOOGLE SIGN UP] Response data cached successfully!");
  } catch (cacheError) {
    console.warn(
      "⚠️ [GOOGLE SIGN UP] Failed to cache response data:",
      cacheError
    );
  }

  // Handle new response format: response.data contains user data
  // Tokens are now in response headers (handled by api.js)
  const userDataFromResponse = response.data || response.user;

  if (userDataFromResponse) {
    console.log(
      "✅ [GOOGLE SIGN UP] User data:",
      JSON.stringify(userDataFromResponse, null, 2)
    );
    console.log(
      "✅ [GOOGLE SIGN UP] User ID:",
      userDataFromResponse.id || userDataFromResponse._id || "N/A"
    );
    console.log(
      "✅ [GOOGLE SIGN UP] User email:",
      userDataFromResponse.email || "N/A"
    );
    console.log(
      "✅ [GOOGLE SIGN UP] User name:",
      userDataFromResponse.fullName || userDataFromResponse.name || "N/A"
    );
  }

  console.log(
    "✅ [GOOGLE SIGN UP] Note: Access token is stored from response headers (x-access-token)"
  );

  // Return in the format expected by AuthContext
  return {
    user: userDataFromResponse,
    accessToken: null, // Token is stored from headers, not needed here
    response, // Include full response for caching
  };
};

/**
 * Get user profile
 * @returns {Promise<object>} - Response with user profile data
 */
export const getUserProfile = async () => {
  console.log("👤 [GET PROFILE] Fetching user profile...");

  try {
    const response = await get("/users/patient/profile");

    console.log("✅ [GET PROFILE] Profile fetched successfully!");
    console.log(
      "✅ [GET PROFILE] Full response data:",
      JSON.stringify(response, null, 2)
    );

    // Cache the full response data
    try {
      await storeProfileResponse(response);
      console.log("💾 [GET PROFILE] Response data cached successfully!");
    } catch (cacheError) {
      console.warn("⚠️ [GET PROFILE] Failed to cache response data:", cacheError);
    }

    // Handle response format: response.data contains user data
    const userDataFromResponse = response.data;
    if (response.notificationCount !== undefined) {
      userDataFromResponse.notificationCount = response.notificationCount;
    }
    console.log(
      "✅ [GET PROFILE] User data:",
      JSON.stringify(userDataFromResponse, null, 2)
    );

    return userDataFromResponse;
  } catch (error) {
    // Re-throw the error so AuthContext can handle session expiration
    // The error will be caught and checked in AuthContext
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<object>} - Response with success message
 */
export const logout = async () => {
  console.log("🚪 [LOGOUT] Starting logout process...");

  const response = await get("/auth/logout");

  console.log("✅ [LOGOUT] Logout successful!");
  console.log(
    "✅ [LOGOUT] Full response data:",
    JSON.stringify(response, null, 2)
  );

  return response;
};

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @param {string} profileData.fullName - Full name
 * @param {string} profileData.dateOfBirth - Date of birth (YYYY-MM-DD)
 * @param {string} profileData.gender - Gender
 * @param {string} profileData.phone - Phone number
 * @param {string} profileData.address - Address
 * @param {object} profileData.emergencyContact - Emergency contact info
 * @param {string} profileData.weight - Weight
 * @param {string} profileData.height - Height
 * @param {string} profileData.bloodType - Blood type
 * @returns {Promise<object>} - Response with updated user data
 */
export const updateProfile = async (profileData) => {
  console.log("📝 [UPDATE PROFILE] Starting profile update...");
  console.log(
    "📝 [UPDATE PROFILE] Request data:",
    JSON.stringify(profileData, null, 2)
  );

  const response = await patch("/users/update/patient", profileData);

  console.log("✅ [UPDATE PROFILE] Profile updated successfully!");
  console.log(
    "✅ [UPDATE PROFILE] Full response data:",
    JSON.stringify(response, null, 2)
  );

  // Handle response format: response.data contains user data
  // Tokens are now in response headers (handled by api.js)
  const userDataFromResponse = response.data || response.user;
  console.log(
    "✅ [UPDATE PROFILE] User data:",
    JSON.stringify(userDataFromResponse, null, 2)
  );
  console.log(
    "✅ [UPDATE PROFILE] Note: Access token is stored from response headers (x-access-token)"
  );

  return userDataFromResponse;
};

/**
 * Send password reset OTP
 * @param {string} email - User email
 * @returns {Promise<object>} - Response with success message
 */
export const sendPasswordResetOTP = async (email) => {
  console.log("🔐 [PASSWORD RESET] Sending password reset OTP...");
  console.log("🔐 [PASSWORD RESET] Email:", email);

  const response = await post("/password-reset/send-otp", {
    email,
  });

  console.log("✅ [PASSWORD RESET] OTP sent successfully!");
  console.log(
    "✅ [PASSWORD RESET] Full response data:",
    JSON.stringify(response, null, 2)
  );

  return response;
};

/**
 * Verify password reset OTP and set new password
 * @param {object} data - OTP verification data
 * @param {number} data.OTP - OTP code
 * @param {string} data.password - New password
 * @param {string} data.email - User email
 * @returns {Promise<object>} - Response with success message
 */
export const verifyPasswordResetOTP = async (data) => {
  const { OTP, password, email } = data;

  console.log("🔐 [PASSWORD RESET] Verifying OTP and resetting password...");
  console.log("🔐 [PASSWORD RESET] Email:", email);
  console.log("🔐 [PASSWORD RESET] OTP:", OTP);

  const response = await post("/password-reset/verify-otp", {
    OTP,
    password,
    email,
  });

  console.log("✅ [PASSWORD RESET] Password reset successful!");
  console.log(
    "✅ [PASSWORD RESET] Full response data:",
    JSON.stringify(response, null, 2)
  );

  return response;
};

/**
 * Send email verification OTP
 * @param {string} email - User email
 * @param {string} fullName - User full name (required for signup flow)
 * @returns {Promise<object>} - Response with success message
 */
export const sendEmailVerificationOTP = async (email, fullName) => {
  console.log("📧 [EMAIL VERIFICATION] Sending email verification OTP...");
  console.log("📧 [EMAIL VERIFICATION] Email:", email);
  console.log("📧 [EMAIL VERIFICATION] FullName:", fullName);

  const requestBody = {};
  if (email) {
    requestBody.email = email;
  }
  if (fullName) {
    requestBody.fullName = fullName;
  }

  const response = await post("/email-verification/send-otp", requestBody);

  console.log("✅ [EMAIL VERIFICATION] OTP sent successfully!");
  console.log(
    "✅ [EMAIL VERIFICATION] Full response data:",
    JSON.stringify(response, null, 2)
  );

  return response;
};

/**
 * Verify email verification OTP
 * @param {number} OTP - OTP code
 * @returns {Promise<object>} - Response with success message
 */
export const verifyEmailVerificationOTP = async (OTP) => {
  console.log("📧 [EMAIL VERIFICATION] Verifying OTP...");
  console.log("📧 [EMAIL VERIFICATION] OTP:", OTP);

  const response = await post("/email-verification/verify-otp", {
    OTP,
  });

  console.log("✅ [EMAIL VERIFICATION] Email verified successfully!");
  console.log(
    "✅ [EMAIL VERIFICATION] Full response data:",
    JSON.stringify(response, null, 2)
  );

  return response;
};

/**
 * Delete user account
 * @returns {Promise<object>} - Response with success message
 */
export const deleteAccount = async () => {
  console.log("⚠️ [DELETE ACCOUNT] Starting account deletion...");
  const response = await del("/users/delete");
  console.log("✅ [DELETE ACCOUNT] Account deleted successfully!");
  return response;
};

/**
 * Download health report / my data
 * @returns {Promise<object>} - Response with blob/download URL
 */
export const downloadHealthReport = async () => {
  console.log("📥 [DOWNLOAD DATA] Requesting health report...");
  const response = await get("/users/download-report");
  console.log("✅ [DOWNLOAD DATA] Report request successful!");
  return response;
};

export default {
  signUp,
  signIn,
  signInWithGoogle,
  signUpWithGoogle,
  getUserProfile,
  logout,
  updateProfile,
  sendPasswordResetOTP,
  verifyPasswordResetOTP,
  sendEmailVerificationOTP,
  verifyEmailVerificationOTP,
  deleteAccount,
  downloadHealthReport,
};
